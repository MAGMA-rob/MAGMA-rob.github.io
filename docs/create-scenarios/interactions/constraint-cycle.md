---
sidebar_position: 2
slug: /use-magma-gen/tutorials/constraint-cycle
title: Introduce Persistent Rules
---

# Introduce Persistent Rules

A persistent rule has a construction-side effect and an interaction-side presentation. Keep those two parts consistent.

## A symbolic assignment

```python
from magma_core.simulation.state import TaskState
from magma_scenarios.templates.constraints import RelationAssignmentConstraint

state = TaskState()
state.attributes = {"objects": ["cup"], "target_areas": ["zone_a", "zone_b"]}
constraint = RelationAssignmentConstraint(
    "cup", "zone_a", "object_area",
    source_attribute_key="objects",
    target_attribute_key="target_areas",
)
constraint.apply(state)
```

This records the assignment and constraint history. It does not move the cup or send a message to the agent.

## Present the rule

```python
from magma_core.simulation.stage import ConstraintBaseStage

stage = ConstraintBaseStage("From now on, place the cup in zone_a.", reset_at_end=False)
```

This checks the response to the new rule. A later action stage should use the assignment to construct the expected goal. Acknowledging a rule and complying with it are separate checkpoints.

In a request, sample the assignment once, construct the rule stage from it, and apply the corresponding constraint in `apply_request`. `BaseConstraintRequest` with `ConstraintParameters` implements that common split, but concrete requests still provide parameter sampling.

## Attribute changes and replay

When a referenced object or area disappears from the symbolic vocabulary, constraints can become outdated. Requests that modify attributes can request state replay. Preserve constraints in history and implement `outdated` correctly rather than relying on unrecorded relation mutations.

**Next:** [Modify attributes](modify-attributes.md). See [requests and constraints](../../concepts/requests.md) for the full construction cycle.
