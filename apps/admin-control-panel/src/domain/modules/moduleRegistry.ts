import type { TargetKey } from '../targets/targets.registry';

import { featureFlagsModule } from './featureFlags.module';
import { infoBannerModule } from './infoBanner.module';
import { maintenanceModule } from './maintenance.module';
import { policyTextModule } from './policyText.module';
import { rateLimitModule } from './rateLimit.module';
import type { ChangeModule } from './types';

export const RESPONSIBILITY_BOUNDARY_MESSAGE =
  'このターゲットは責任境界外のため、当該モジュールの変更はできません。';

export const MODULE_REGISTRY = [
  maintenanceModule,
  featureFlagsModule,
  policyTextModule,
  rateLimitModule,
  infoBannerModule,
] as const satisfies readonly ChangeModule[];

export type ModuleKey = (typeof MODULE_REGISTRY)[number]['key'];

export const MODULE_BY_KEY = Object.fromEntries(
  MODULE_REGISTRY.map((module) => [module.key, module]),
) as Record<ModuleKey, ChangeModule>;

export const getModulesForTarget = (target: TargetKey): ChangeModule[] =>
  MODULE_REGISTRY.filter((module) => module.supports.includes(target));

export const getRegistryTabsForTarget = (target: TargetKey) =>
  MODULE_REGISTRY.map((module) => {
    const supported = module.supports.includes(target);

    return {
      key: module.key,
      label: module.label,
      disabled: !supported,
      disabledReason: supported ? undefined : RESPONSIBILITY_BOUNDARY_MESSAGE,
    };
  });
