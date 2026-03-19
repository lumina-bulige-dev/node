import type { ChangeModule } from './types';

type RateLimitChange = {
  requestsPerMinute: number;
};

export const rateLimitModule: ChangeModule<RateLimitChange> = {
  key: 'rateLimit',
  label: 'Rate Limit',
  supports: ['api', 'ops'],
  defaultChange: () => ({ requestsPerMinute: 60 }),
  validate: (change) =>
    change.requestsPerMinute < 1 ? ['Rate limit must be at least 1 request per minute.'] : [],
  Render: () => null,
};
