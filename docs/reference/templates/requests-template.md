---
sidebar_position: 3
slug: /use-magma-gen/templates-to-use/requests-template
title: Request Building Blocks
---

# Request Building Blocks

`BaseRequest[ParametersT]` lives in `magma_core.simulation.requests`. Concrete requests must sample parameters and create stages.

`magma_scenarios.templates.requests.interact_request` provides:

| Type | Purpose |
| --- | --- |
| `ConstraintParameters` | Sampled constraints and instruction |
| `BaseConstraintRequest` | Create an acknowledgement stage and apply sampled constraints |
| `AttributesModificationParameters` | Copied attribute snapshot |
| `BaseAttributesModifRequest` | Apply an attribute snapshot and request constraint replay |

`BaseConstraintRequest` creates a `ConstraintBaseStage` from the sampled instruction and applies the sampled constraints to `TaskState`. Concrete subclasses provide parameter sampling. Its `reset_at_end` setting defaults to `True`; override it when the next interaction needs the resulting physical state.

The `magma_scenarios.templates.requests` package exports relation-assignment request bases (`GiveRelationAssignmentRequest`, `GiveObjectAssignmentRequest`, `GiveObjectCategoryRequest`, `GiveCategoryAssignmentRequest`) and list-attribute bases (`AddValueToListRequest`, `RemoveValueToListRequest`). These are reusable building blocks, not a guarantee that every exported class is directly runnable without specialization.

Start with [a complete request](../../create-scenarios/procedural-tasks/requests.md), then inspect the constructor and hooks of the template matching your domain.
