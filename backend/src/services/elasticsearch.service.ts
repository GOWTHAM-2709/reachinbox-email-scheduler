import esClient from '../config/elasticsearch';

export const indexEmail = async (email: any) => {
  try {
    await (esClient.index as any)({
      index: 'emails',
      id: email.id,
      body: {
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
  } catch (error) {
    console.error(`Failed to index email ${email.id} into Elasticsearch:`, (error as any).message);
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

    const result: any = await (esClient.search as any)({
      index: 'emails',
      body: {
        query: {
          bool: {
            must,
          },
        },
      },
    });

    return result.hits.hits.map((hit: any) => hit._source);
  } catch (error) {
    console.error('Elasticsearch search failed:', (error as any).message);
    return [];
  }
};
