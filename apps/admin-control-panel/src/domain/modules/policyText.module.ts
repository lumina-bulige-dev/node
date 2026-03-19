import type { ChangeModule } from './types';

type PolicyTextChange = {
  locale: string;
  markdown: string;
};

export const policyTextModule: ChangeModule<PolicyTextChange> = {
  key: 'policyText',
  label: 'Policy Text',
  supports: ['app'],
  defaultChange: () => ({ locale: 'ja-JP', markdown: '' }),
  validate: (change) => (!change.markdown.trim() ? ['Policy text cannot be empty.'] : []),
  Render: () => null,
};
