import axios from 'axios';
import { config } from '../config/env';
import prisma from '../config/db';

export const getGoogleAuthUrl = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: config.google.callbackUrl,
    client_id: config.google.clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

export const getGoogleUser = async (code: string) => {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    redirect_uri: config.google.callbackUrl,
    grant_type: 'authorization_code',
  };

  try {
    const res = await axios.post(url, new URLSearchParams(values).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { id_token, access_token } = res.data;
    
    // Get user info
    const googleUserRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    
    return googleUserRes.data;
  } catch (error: any) {
    console.error('Error fetching Google user', error.response?.data || error.message);
    throw new Error('Failed to fetch Google user');
  }
};

export const findOrCreateUser = async (googleUser: any) => {
  let user = await prisma.user.findUnique({
    where: { googleId: googleUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
      },
    });
  } else {
    // Optionally update name/avatar if changed
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: googleUser.name,
        avatar: googleUser.picture,
      }
    });
  }

  return user;
};
