import { Client } from '@elastic/elasticsearch';
import { config } from './env';

const esClient = new Client({
  node: config.elasticsearchUrl,
  maxRetries: 3,
  requestTimeout: 3000,
});

export const initElasticsearch = async () => {
  try {
    const index = 'emails';
    const exists = await esClient.indices.exists({ index });
    if (!exists) {
      await (esClient.indices.create as any)({
        index,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              campaignId: { type: 'keyword' },
              recipient: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              subject: { type: 'text' },
              body: { type: 'text' },
              status: { type: 'keyword' },
              scheduledAt: { type: 'date' },
              sentAt: { type: 'date' },
            },
          },
        },
      });
      console.log('Elasticsearch index "emails" created.');
    }
  } catch (error) {
    console.error('Elasticsearch initialization failed (non-fatal):', (error as any).message);
  }
};

export default esClient;
