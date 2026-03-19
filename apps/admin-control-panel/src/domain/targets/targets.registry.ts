export type TargetKey = 'app' | 'api' | 'ops';

export const TARGETS = {
  app: {
    key: 'app',
    label: 'Application',
    supports: ['maintenance', 'featureFlags', 'policyText', 'infoBanner'],
  },
  api: {
    key: 'api',
    label: 'API',
    supports: ['maintenance', 'featureFlags', 'rateLimit'],
  },
  ops: {
    key: 'ops',
    label: 'Operations',
    supports: ['maintenance', 'rateLimit', 'infoBanner'],
  },
} as const satisfies Record<
  TargetKey,
  {
    key: TargetKey;
    label: string;
    supports: readonly string[];
  }
>;
