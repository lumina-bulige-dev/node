import type { CSSProperties } from 'react';

export function ApproveDialog() {
  return (
    <section data-testid="approve-dialog" style={sectionStyle}>
      <h2 style={headingStyle}>Approve Dialog</h2>
      <p>Approval confirmation modal placeholder.</p>
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
