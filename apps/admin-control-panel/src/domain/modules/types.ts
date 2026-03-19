import type { ComponentType } from 'react';

import type { TargetKey } from '../targets/targets.registry';

export interface ChangeModule<TChange = unknown> {
  key: string;
  label: string;
  supports: readonly TargetKey[];
  defaultChange: () => TChange;
  validate: (change: TChange) => string[];
  Render: ComponentType<{
    value: TChange;
    onChange: (next: TChange) => void;
    target: TargetKey;
  }>;
}
