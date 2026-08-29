import { Request, Response } from 'express';
import { config } from '../config/env';
import prisma from '../config/db';
import axios from 'axios';

export const connectSlack = (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Pass userId in state to correlate on callback
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const rootUrl = 'https://slack.com/oauth/v2/authorize';
  const options = {
    client_id: config.slack.clientId,
    scope: 'chat:write', // required to send messages
    redirect_uri: config.slack.redirectUri,
    state,
  };

  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
};

export const slackCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const stateStr = req.query.state as string;

  if (!code || !stateStr) {
    return res.status(400).json({ error: 'Invalid callback parameters' });
  }

  let userId: string;
  try {
    const stateObj = JSON.parse(Buffer.from(stateStr, 'base64').toString('ascii'));
    userId = stateObj.userId;
  } catch (error) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  try {
    const url = 'https://slack.com/api/oauth.v2.access';
    const params = new URLSearchParams({
      client_id: config.slack.clientId,
      client_secret: config.slack.clientSecret,
      code,
      redirect_uri: config.slack.redirectUri,
    });

    const slackRes = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = slackRes.data;
    if (!data.ok) {
      console.error('Slack OAuth error:', data.error);
      return res.redirect(`${config.frontendUrl}/dashboard?error=slack_auth_failed`);
    }

    const accessToken = data.access_token;

    await prisma.slackConnection.upsert({
      where: { userId },
      update: { accessToken },
      create: { userId, accessToken },
    });

    res.redirect(`${config.frontendUrl}/dashboard?success=slack_connected`);
  } catch (error) {
    console.error('Slack Callback Error:', error);
    res.redirect(`${config.frontendUrl}/dashboard?error=slack_auth_failed`);
  }
};

export const disconnectSlack = async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await prisma.slackConnection.delete({
      where: { userId }
    });
    res.json({ success: true });
  } catch (error) {
    // If it doesn't exist, it will throw an error, we can ignore or return success
    res.json({ success: true });
  }
};
