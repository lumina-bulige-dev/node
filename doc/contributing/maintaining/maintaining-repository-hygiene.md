# Maintaining repository hygiene

Keeping the repository tidy is useful, but maintainers should optimize for safe changes over aggressive cleanup.

## Principles

1. Preserve behavior first.
2. Remove duplication second.
3. Standardize naming incrementally.
4. Delete unused files only after proving they are not referenced.

## Recommended workflow

### 1. Baseline behavior before cleanup

Collect baseline signals so that cleanup can be measured against known behavior:

* Run targeted tests for the area being changed.
* Record lint and type-check output for the touched paths.
* Note build artifacts or generated files that should not be committed.

### 2. Remove duplication with shared abstractions

When two or more files share logic:

* Extract the shared behavior into one internal helper or module.
* Keep public interfaces unchanged unless there is a separate consensus change.
* Prefer small, reviewable commits over broad rewrites.

### 3. Standardize file names

Use consistent, descriptive naming conventions:

* Use lowercase-with-dashes for Markdown files.
* Follow existing subsystem conventions for C++, JavaScript, and build files.
* Rename in isolated commits to keep history readable.

### 4. Remove extra files and directories safely

Before deleting a file or directory:

* Confirm it is not imported, required, included, or referenced in build metadata.
* Verify it is not used by tooling, docs links, or release scripts.
* Delete generated clutter locally, but avoid committing ignore-rule changes unless they help all contributors.

### 5. Validate after cleanup

After refactoring and deletions:

* Re-run the same targeted tests from the baseline.
* Run related lints.
* Confirm no user-facing behavior changed unintentionally.

## What is "best" for Node.js

For Node.js, the best approach is gradual and verifiable cleanup:

* Make functionality-preserving refactors first.
* Keep changes scoped by subsystem.
* Prefer evidence-driven deletions over speculative pruning.

This gives maintainers a cleaner codebase while preserving reliability, reviewability, and release safety.
