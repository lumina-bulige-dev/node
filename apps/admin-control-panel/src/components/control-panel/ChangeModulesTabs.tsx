import type { CSSProperties } from 'react';

export function ChangeModulesTabs() {
  return (
    <section data-testid="change-modules-tabs" style={sectionStyle}>
      <h2 style={headingStyle}>Change Modules Tabs</h2>
      <p>Placeholders for module tabs (Policy, Pricing, Notification, etc.).</p>
    </section>
  );
}

const sectionStyle: CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: 12,
  background: '#fff',
};

const headingStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 8,
  fontSize: '1rem',
};
