import { Request, Response } from 'express';
import prisma from '../config/db';
import { scheduleEmailJob } from '../queues/email.queue';
import { searchEmails } from '../services/elasticsearch.service';
import { z } from 'zod';

const scheduleSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  recipients: z.array(z.string().email("Invalid email address")).min(1, "At least one recipient is required"),
  startTime: z.string().optional(),
  delayBetweenEmails: z.number().positive().optional().default(2),
  hourlyLimit: z.number().int().positive().optional().default(100),
});

export const scheduleEmails = async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const validation = scheduleSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid input', 
      details: validation.error.format() 
    });
  }

  const { subject, body, recipients, startTime, delayBetweenEmails, hourlyLimit } = validation.data;

  try {
    const scheduledAt = startTime ? new Date(startTime) : new Date();

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        subject,
        body,
        startTime: scheduledAt,
        delayBetweenEmails: delayBetweenEmails || 2, // default 2s
        hourlyLimit: hourlyLimit || 100,
      }
    });

    const emailsToCreate = recipients.map(recipient => ({
      campaignId: campaign.id,
      recipient,
      subject,
      body,
      scheduledAt,
      status: 'scheduled'
    }));

    // Create many emails
    await prisma.email.createMany({ data: emailsToCreate });

    // Fetch them back to get IDs
    const createdEmails = await prisma.email.findMany({
      where: { campaignId: campaign.id }
    });

    // Schedule BullMQ jobs for each email
    // This loops asynchronously to not block the event loop for a massive amount of time,
    // For 1000+ emails, this will schedule 1000 jobs. BullMQ can handle this.
    const promises = createdEmails.map(email => 
      scheduleEmailJob(
        email.id,
        userId,
        campaign.id,
        scheduledAt,
        campaign.delayBetweenEmails,
        campaign.hourlyLimit
      )
    );
    await Promise.all(promises);

    res.status(201).json({ success: true, campaignId: campaign.id, count: createdEmails.length });
  } catch (error) {
    console.error('Schedule Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getScheduledEmails = async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const emails = await prisma.email.findMany({
      where: {
        campaign: { userId },
        status: 'scheduled'
      },
      orderBy: { scheduledAt: 'asc' },
      take: 100, // Limit for UI performance
    });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSentEmails = async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const emails = await prisma.email.findMany({
      where: {
        campaign: { userId },
        status: { in: ['sent', 'failed'] }
      },
      orderBy: { sentAt: 'desc' },
      take: 100,
    });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchEmailEndpoint = async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const q = req.query.q as string;
  if (!q) return res.json([]);

  try {
    // We only want to search emails belonging to this user
    // Since Elasticsearch might not be perfectly sync, we get user's campaigns first
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: { id: true }
    });
    const campaignIds = campaigns.map(c => c.id);

    const esResults = await searchEmails(q);
    
    // Filter results to ensure they belong to the user
    const filtered = esResults.filter((e: any) => campaignIds.includes(e.campaignId));
    
    res.json(filtered);
  } catch (error) {
    // Fallback to Postgres if ES is down
    const dbResults = await prisma.email.findMany({
      where: {
        campaign: { userId },
        OR: [
          { recipient: { contains: q, mode: 'insensitive' } },
          { subject: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 50
    });
    res.json(dbResults);
  }
};
