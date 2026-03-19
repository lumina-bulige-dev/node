import type { CSSProperties } from 'react';

export function TargetSelector() {
  return (
    <section data-testid="target-selector" style={sectionStyle}>
      <h2 style={headingStyle}>Target Selector</h2>
      <p>Select deployment scope, environment, and tenant.</p>
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
