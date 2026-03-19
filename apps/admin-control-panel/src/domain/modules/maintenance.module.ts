import type { ChangeModule } from './types';

type MaintenanceChange = {
  enabled: boolean;
  message: string;
};

export const maintenanceModule: ChangeModule<MaintenanceChange> = {
  key: 'maintenance',
  label: 'Maintenance',
  supports: ['app', 'api', 'ops'],
  defaultChange: () => ({ enabled: false, message: '' }),
  validate: (change) =>
    change.enabled && !change.message.trim() ? ['Message is required when enabling maintenance mode.'] : [],
  Render: () => null,
};
