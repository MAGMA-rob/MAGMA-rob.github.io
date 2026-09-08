---
sidebar_position: 3
slug: /use-magma-gen/deep-dive/create-stages
title: Stage Contract
---

# Stage Contract

Import stage classes and parameter dataclasses from `magma_core.simulation.stage`; import `StageInput` and instructions from `magma_core.simulation.data_structures`.

```python
BaseTaskStage(
    goals,
    stage_goal_description,
    stage_input,
    global_parameters=None,
    error_parameters=None,
    entry_transition=None,
)
```

## Required fields and budgets

Define `target_tool_calls` and `max_tool_calls` before calling the base initializer. At least one must be non-`None`. Counts must be nonnegative; a target cannot exceed the maximum. If maximum is `None`, it becomes twice the target.

A successful stage is `OPTIMAL` within target, otherwise `ACCEPTABLE`. An unknown target produces `UNASSESSED`. An unfinished stage reaching its maximum is `EXCEEDED`. `BaseTask` passes effective counts after subtracting forgiven calls. Consumer generators can require exact targets even though the base allows an unknown target.

## StageInput

`StageInput(instruction, flag_answer_to_user, linked_to_prev=None)` is the declarative interaction input. `EmptyInstruction()` forces linking to the previous stage. A nonempty instruction defaults to unlinked unless specified.

The stage does not own a complete initial `Situation`; that belongs to the task through `SituationInit`.

## How flag_answer_to_user works

The flag marks a completion-answer boundary. The current GEN preparation turns it into `CompletionAnswerStage`, clears the source flag, and moves the source reset to that stage. Completion is linked to the preceding input and uses `SAY_ONLY`. Registered detection tools can be allowed before the final answer.

A direct input after an action with a false flag can instead trigger delayed-input handling. See [interruptions](../../create-scenarios/interactions/interruption.md).

## Global parameters

| `StageGlobalParameters` field | Default | Meaning |
| --- | --- | --- |
| `reset_at_end` | `False` | Restore reference environment state at the boundary |
| `additive_stage` | `False` | Permit runtime attribute-edit logs |
| `verification_prompt` | `None` | Non-`None` marks a text-only stage |
| `allow_tools_before_answer` | `False` | Permit tools in a text-only stage |
| `allowed_tools` | `[]` | Empty means all tools when enabled |
| `text_only_validation` | `JUDGE` | Semantic judge or `SAY_ONLY` validation mode |

A text-only stage must have no goals and no overridden log verifier. Tool permissions without text-only mode are validated by the base; do not treat them as a general action-stage allowlist.

## Verification

`BaseGoal.verify(obs)` returns a tensor with one `-1`, `0`, or `1` per environment. The default stage goal combination takes the minimum. `verif_log_completion(stage_log, full_log)` operates on one environment's logs. The default combined result propagates failure and requires both checks to succeed.

A stage without goals must supply log verification unless it is text-only. Attribute-edit logs in a non-additive stage fail verification. `ToolResult.ok` and stage completion are separate checks.

## Entry effects and errors

`build_init_state(env_state, env_ids)` delegates to `entry_transition.apply` when present. See [transitions](../../create-scenarios/execution/env-transitions.md).

`StageErrorParameters` holds possible error instances and count bounds. See [errors](errors.md). Error names within a stage must be unique.

## Serialization and unsupported composites

Concrete serializable stages implement `_to_spec_arguments()`; `to_spec()` / `from_spec()` save and reconstruct their declarations. Request-generated stages can carry a `request_type` for attribution.

`BaseStageComposite` is experimental and raises `NotImplementedError` during construction. Use ordinary stage sequences in supported tutorials.

**Guide:** [first stage](../../create-scenarios/building-blocks/create-stages-light.md).
