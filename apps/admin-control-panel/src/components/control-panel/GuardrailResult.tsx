import type { CSSProperties } from 'react';

export function GuardrailResult() {
  return (
    <section data-testid="guardrail-result" style={sectionStyle}>
      <h2 style={headingStyle}>Guardrail Result</h2>
      <p>Validation checks and risk score placeholder.</p>
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
