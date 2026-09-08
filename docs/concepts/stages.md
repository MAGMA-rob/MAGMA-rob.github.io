---
sidebar_position: 4
title: Stages and Interaction
---

# Stages and Interaction

A stage declares the next checkpoint of an interaction. Tools describe available actions; goals and stage verification determine whether those actions accomplished the objective.

## Completion and efficiency

An action stage checks environment goals, execution logs, or both. Verification returns `1` for success, `0` for ongoing, and `-1` for failure. The default combination requires all checks to succeed and propagates failure.

A text-only stage has a `verification_prompt` and no environment goals or custom log verifier. `JUDGE` requests semantic validation; `SAY_ONLY` is used for a direct completion message. A text-only stage may explicitly allow tools before the answer.

`target_tool_calls` describes expected efficiency; `max_tool_calls` limits execution. They are absolute counts, not target plus tolerance. A stage with no known target can be `UNASSESSED`, although some task generators require exact targets. Success and efficiency are separate results.

## One instruction, several stages

The first stage carries `UserInstruction(...)`. A following `EmptyInstruction()` continues from the preceding tool status without introducing another user instruction. Empty inputs automatically set `linked_to_prev=True`; an explicit instruction can also be linked when it belongs to the same interaction.

`flag_answer_to_user=True` marks a point where the author expects a user-facing completion answer. In the current GEN preparation path, it is materialized as a separate `CompletionAnswerStage`; the action stage's reset is deferred until that answer stage. The flag remains part of the authoring contract. Do not add both a flag and an explicit completion stage for the same answer.

## Interrupting an unfinished interaction

An explicit instruction after an action stage whose answer flag is false can introduce an interruption. The runtime first delivers the last tool result, captures the continuation of the previous work, and then exposes the pending instruction. A skill may still be running; interruption is not automatic cancellation.

This creates an opportunity to suspend, adjust, cancel, or resume the previous work. It is not arbitrary preemption at any physics timestep: the declared stage boundary and runtime result handling determine when the instruction is delivered.

See the [interruption guide](../create-scenarios/interactions/interruption.md) for the sequence and the difference between a linked interruption and a new independent request.

## Automatic environment changes

A stage can declare an `entry_transition` to change the environment before the agent acts. This models an external event, such as new objects arriving. A transition is distinct from an agent tool call and from `reset_at_end`.

**Next:** [Create a stage](../create-scenarios/building-blocks/create-stages-light.md). Complete contract: [stage reference](../reference/scenarios/create-stages.md).
