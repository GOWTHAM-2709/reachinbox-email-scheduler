import esClient from '../config/elasticsearch';

export const indexEmail = async (email: any) => {
  try {
    await esClient.index({
      index: 'emails',
      id: email.id,
      document: {
        id: email.id,
        campaignId: email.campaignId,
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        status: email.status,
        scheduledAt: email.scheduledAt,
        sentAt: email.sentAt,
      },
    });
  } catch (error: any) {
    console.error(`Failed to index email ${email.id} into Elasticsearch:`, error.message);
    // Non-fatal, app continues
  }
};

export const searchEmails = async (query: string, campaignId?: string) => {
  try {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['recipient', 'subject', 'body'],
          fuzziness: 'AUTO',
        },
      }
    ];

    if (campaignId) {
      must.push({ match: { campaignId } });
    }

    const result = await esClient.search({
      index: 'emails',
      query: {
        bool: {
          must,
        },
      },
    });

    return result.hits.hits.map((hit: any) => hit._source);
  } catch (error: any) {
    console.error('Elasticsearch search failed:', error.message);
    return [];
  }
};
