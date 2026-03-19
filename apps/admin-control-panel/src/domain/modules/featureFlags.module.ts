import type { ChangeModule } from './types';

type FeatureFlagsChange = {
  flagKey: string;
  enabled: boolean;
};

export const featureFlagsModule: ChangeModule<FeatureFlagsChange> = {
  key: 'featureFlags',
  label: 'Feature Flags',
  supports: ['app', 'api'],
  defaultChange: () => ({ flagKey: '', enabled: false }),
  validate: (change) => (!change.flagKey.trim() ? ['Flag key is required.'] : []),
  Render: () => null,
};
