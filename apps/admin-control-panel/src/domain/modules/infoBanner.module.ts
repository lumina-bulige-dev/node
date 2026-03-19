import type { ChangeModule } from './types';

type InfoBannerChange = {
  text: string;
  severity: 'info' | 'warn';
};

export const infoBannerModule: ChangeModule<InfoBannerChange> = {
  key: 'infoBanner',
  label: 'Info Banner',
  supports: ['app', 'ops'],
  defaultChange: () => ({ text: '', severity: 'info' }),
  validate: (change) => (!change.text.trim() ? ['Banner text is required.'] : []),
  Render: () => null,
};
