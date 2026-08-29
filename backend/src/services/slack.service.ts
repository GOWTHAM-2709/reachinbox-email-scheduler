import axios from 'axios';
import prisma from '../config/db';
import redis from '../config/redis';

export const sendRateLimitNotification = async (userId: string, currentHour: string) => {
  try {
    // Deduplicate logic
    const dedupKey = `slack-notified:${userId}:${currentHour}`;
    
    // setnx returns 1 if key was set (meaning we are the first to notify this hour)
    const isFirstNotification = await redis.setnx(dedupKey, '1');
    if (isFirstNotification) {
      // Set expiry for 1 hour to clean up Redis
      await redis.expire(dedupKey, 3600);
      
      const connection = await prisma.slackConnection.findUnique({
        where: { userId }
      });

      if (!connection) {
        return; // Silently skip if slack is not connected
      }

      // Fetch user to know their email/name
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const userName = user?.name || 'User';

      const message = `Hello ${userName}, you have reached your hourly email sending limit (${currentHour}). Further scheduled emails will be delayed until the next hour.`;

      // Find the user's IM channel or just post to a default channel if token allows.
      // Easiest is to chat.postMessage with the user's own token (it will send as them or Slackbot to them depending on auth).
      // Since we requested `chat:write` scope, we can send a message. But we need a channel ID.
      // Often, a DM to the user themselves works if channel is their own Slack User ID.
      // Alternatively, we can use the `auth.test` endpoint to get their Slack user ID.
      
      const authRes = await axios.post('https://slack.com/api/auth.test', null, {
        headers: { Authorization: `Bearer ${connection.accessToken}` }
      });
      
      if (authRes.data.ok) {
        const slackUserId = authRes.data.user_id;
        
        await axios.post('https://slack.com/api/chat.postMessage', {
          channel: slackUserId, // send DM to self
          text: message
        }, {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    // Do not crash the application
  }
};
