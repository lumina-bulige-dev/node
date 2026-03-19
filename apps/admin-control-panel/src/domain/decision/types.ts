export type DecisionStatus = 'draft' | 'review' | 'approved' | 'rejected';

export interface Reason {
  id: string;
  summary: string;
  detail?: string;
}

export interface Rollback {
  required: boolean;
  plan: string;
  owner?: string;
}

export interface DecisionDraft {
  id: string;
  title: string;
  targetId: string;
  status: DecisionStatus;
  reasons: Reason[];
  rollback: Rollback;
  updatedAt: string;
}
