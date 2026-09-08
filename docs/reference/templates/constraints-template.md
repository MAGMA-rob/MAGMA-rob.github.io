---
sidebar_position: 4
slug: /use-magma-gen/templates-to-use/constraints-template
title: Constraint Building Blocks
---

# Constraint Building Blocks

Core classes live in `magma_core.simulation.constraints`:

- `BaseConstraint`: symbolic update recorded in `constraints_history`.
- `AttributesModifConstraint`: replaces the symbolic attribute snapshot.

The installed `magma_scenarios.templates.constraints` exports:

- `RelationAssignmentConstraint`: assigns a source to a target in a selected relation, with optional source/target vocabulary checks.
- `RelationDefaultConstraint`: declares a fallback target and clears relation exceptions.

Call the base `apply` when implementing a replayable custom constraint, and implement `outdated` when changes can invalidate it. Do not confuse a construction constraint with a physical goal or the stage that communicates the rule.

See [persistent rules](../../create-scenarios/interactions/constraint-cycle.md).
