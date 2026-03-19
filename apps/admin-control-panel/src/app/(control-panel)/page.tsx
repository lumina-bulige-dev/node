import type { CSSProperties } from 'react';
import { ApproveDialog } from '../../components/control-panel/ApproveDialog';
import { ChangeModulesTabs } from '../../components/control-panel/ChangeModulesTabs';
import { DecisionPreview } from '../../components/control-panel/DecisionPreview';
import { GuardrailResult } from '../../components/control-panel/GuardrailResult';
import { TargetSelector } from '../../components/control-panel/TargetSelector';

export default function ControlPanelPage() {
  return (
    <main data-testid="control-panel-page" style={pageStyle}>
      <h1 style={titleStyle}>Admin Control Panel</h1>
      <div data-testid="control-panel-layout" style={layoutStyle}>
        <aside data-testid="left-pane" style={leftPaneStyle}>
          <TargetSelector />
          <ChangeModulesTabs />
        </aside>

        <section data-testid="right-pane" style={rightPaneStyle}>
          <DecisionPreview />
          <GuardrailResult />
          <ApproveDialog />
        </section>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  padding: 20,
  background: '#f9fafb',
  minHeight: '100vh',
};

const titleStyle: CSSProperties = {
  margin: '0 0 16px',
};

const layoutStyle: CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'stretch',
  minHeight: 'calc(100vh - 120px)',
};

const leftPaneStyle: CSSProperties = {
  flex: '0 0 40%',
  minWidth: 280,
  maxWidth: '75%',
  resize: 'horizontal',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const rightPaneStyle: CSSProperties = {
  flex: 1,
  minWidth: 280,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};
