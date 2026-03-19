import type { CSSProperties } from 'react';

export function DecisionPreview() {
  return (
    <section data-testid="decision-preview" style={sectionStyle}>
      <h2 style={headingStyle}>Decision Preview</h2>
      <p>Summarized diff and impact analysis placeholder.</p>
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
