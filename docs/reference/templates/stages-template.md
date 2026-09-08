---
sidebar_position: 1
slug: /use-magma-gen/templates-to-use/stages-template
title: Stage Templates
---

# Stage Templates

Core templates are exported from `magma_core.simulation.stage`.

| Template | Use when |
| --- | --- |
| `BaseTaskStage` | Define custom goals or log checks |
| `AskingBaseStage(question, answer, ...)` | Semantically validate an answer, optionally after tools |
| `ConstraintBaseStage(constraint, ...)` | Present and acknowledge a persistent rule |
| `ModifAttributesBaseStage(mode, stage_input, val_name, att_name, ...)` | Verify an `ADD` or `REMOVE` attribute log |
| `CompletionAnswerStage(allowed_tools=None, reset_at_end=False)` | Require a user-facing completion message with `SAY_ONLY` validation |

`magma_scenarios.templates.stages` exports `MissingInformationStage` and `ForbiddenElemStage` for domain-oriented clarification/refusal interactions. Inspect their constructors before reusing them in another domain.

The old sorting `Cycle` stage template is not exported by the current module. Use explicit stage goals for progress and a skill for repeated tool orchestration. Composite stages remain unsupported/experimental.

See [stage contract](../scenarios/create-stages.md) and [interaction guides](../../create-scenarios/interactions/multi-stages.md).
