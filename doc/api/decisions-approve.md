# `POST /api/decisions/approve` server-authoritative approval specification

## Purpose

Define approval requirements that are **independent from UI behavior** and always enforced on the server, including direct API invocations.

## Authorization requirements (server-side)

The server MUST evaluate authorization using request context and policy rules, and MUST NOT delegate final approval decisions to client/UI input.

### Required policy

An approval request is authorized only when all of the following are satisfied:

1. `role=admin_approver`
2. `mfa_recent=true` (derived by server from `mfa_verified_at` and policy window)

If either check fails, return `403 Forbidden`.

## Required request context

The following context values are mandatory for every approval attempt:

- `approver_user_id`
- `session_id`
- `authn_method`
- `mfa_verified_at`

If any value is missing, malformed, or semantically invalid, return `422 Unprocessable Entity`.

## Decision state and conflict semantics

- `decision_id` is the target decision identifier.
- If `decision_id` does not exist, return `422 Unprocessable Entity`.
- If `decision_id` is already approved (idempotency/conflict policy), return `409 Conflict`.

## Audit logging and tamper detection

For every successful approval (`2xx`), the system MUST persist an append-only audit record keyed by `decision_id`, including:

- `approved_by`
- `approved_at`
- `approval_evidence_hash`

### Hash-chain requirement

Audit records MUST be linked by hash chain to enable post-hoc tamper detection.

Recommended canonical hash input:

```text
hash_i = SHA-256(
  hash_{i-1} || decision_id || approved_by || approved_at || session_id || authn_method || mfa_verified_at
)
```

- `hash_0` is a fixed genesis value configured by environment.
- `approval_evidence_hash` stores `hash_i`.
- Verification tooling MUST be able to recompute the chain and detect divergence.

## UI confirm phrase handling

`confirm_phrase` (or equivalent UI text input) is optional and auxiliary.

- It MAY be recorded for UX telemetry.
- It MUST NOT be a sufficient condition for approval.
- Final approval result MUST be determined only by server-side authorization and validation logic.

## OpenAPI contract requirements

The contract MUST explicitly document `403`, `409`, and `422` outcomes for this endpoint.

### OpenAPI example fragment

```yaml
paths:
  /api/decisions/approve:
    post:
      operationId: approveDecision
      summary: Approve a decision using server-side authorization policy
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - decision_id
                - approver_user_id
                - session_id
                - authn_method
                - mfa_verified_at
              properties:
                decision_id:
                  type: string
                approver_user_id:
                  type: string
                session_id:
                  type: string
                authn_method:
                  type: string
                mfa_verified_at:
                  type: string
                  format: date-time
                confirm_phrase:
                  type: string
                  description: Optional UI helper input; not used for final approval authorization.
      responses:
        '200':
          description: Approved and audit log persisted
        '403':
          description: Authorization policy failed (e.g. role or recent MFA requirement)
        '409':
          description: Decision approval state conflict (already approved)
        '422':
          description: Validation failure (missing/invalid context or decision)
```
