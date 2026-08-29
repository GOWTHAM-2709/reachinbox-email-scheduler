import { Request, Response } from 'express';
import { config } from '../config/env';
import { getGoogleAuthUrl, getGoogleUser, findOrCreateUser } from '../services/auth.service';

export const googleAuth = (req: Request, res: Response) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }

  try {
    const googleUser = await getGoogleUser(code);
    const user = await findOrCreateUser(googleUser);
    
    // Set user in session
    req.session = {
      userId: user.id
    };
    
    // Redirect to frontend dashboard
    res.redirect(`${config.frontendUrl}/dashboard`);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
  }
};

export const me = async (req: Request, res: Response) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const prisma = (await import('../config/db')).default;
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        slackConnections: {
          select: { id: true }
        }
      }
    });
    
    if (!user) {
      req.session = null;
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({
      ...user,
      slackConnected: user.slackConnections.length > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session = null;
  res.json({ success: true });
};
