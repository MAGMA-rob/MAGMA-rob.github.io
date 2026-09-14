---
pagination_next: null
sidebar_position: 6
slug: /use-magma-gen/running-generation/key-systems
title: Coaching — Diagnose, Propose, Validate
---

# Coaching — Diagnose, Propose, Validate

Coaching attempts to turn an observed difficulty into a tested alternative continuation. GEN gathers execution evidence and coordinates the intervention; the agent owns the logic that repairs its decisions or internal state. The resulting proposal must pass through execution and task checks before it can count as a successful continuation.

## Why a failure needs diagnosis

A failed action does not necessarily identify the decision that caused the failure. The agent may have used a wrong argument, missed an earlier prerequisite, retained a wrong assumption, or encountered a declared environment error. Replacing only the last action can miss the actual source of the problem. Conversely, a valid grasp attempt may fail because of execution uncertainty: useful supervision may teach recovery from the resulting state, without treating the original choice as a decision error.

The useful supervision is therefore more than “this answer is wrong.” It connects the context in which a decision was made, a proposed correction, and its observed consequence. For the scientific treatment of ambiguous failures and recovery supervision, see the [MAGMA-GEN paper](https://openreview.net/pdf?id=r7ZN8cPEcj). This page explains how to interpret that process in the current software.

## Diagnose: select a decision worth revisiting

GEN recognizes correction opportunities such as a failed stage, absence of useful action, exhausted budget, invalid response format, or a completed but suboptimal trajectory. Requests are constrained by routing rules, available agent capabilities, and collection budgets; not every unsuccessful tool call causes coaching.

For trajectory-level failure diagnosis, GEN supplies the stage objective, relevant decisions and execution feedback, plus available error descriptions and hints. Diagnosis identifies a candidate root-cause decision and explains why revisiting it may help. In the current implementation, a trajectory with only one diagnosable decision can use a deterministic diagnosis without a model call. Format repair and text-only rewriting also have their own paths; the three conceptual phases do not require three LLM calls every time.

Suboptimal diagnosis asks whether a defensible inefficiency can be identified. It may decline to propose a repair. An explanation from a judge or coach remains a hypothesis about the behavior, not execution evidence of improvement.

## Propose: let the agent repair its own behavior

GEN passes the selected context and permitted restart points to the agent's specialized coaching service. The agent may propose an alternative action, repair an internal summary or plan, or use another correction strategy appropriate to its architecture.

The proposal selects an allowed point and carries the correction information needed by that agent. GEN sends that information back through the normal agent response endpoint. The agent produces a decision and consistent updated memory before physical execution resumes. This prevents GEN from editing an action while leaving the agent's internal state inconsistent with it.

Full-history currently supports replacement decisions and text responses. An agent with other components must implement its own repair strategy and advertise what it supports. Configuration alone does not add those capabilities. The [coaching concepts](../concepts/coaching.md) describe these responsibilities; the [custom-agent guide](../custom-agent/coaching.md) is only needed when implementing a new strategy.

## Counterfactual re-execution

A replacement asks: **what happens if the agent makes a different decision from this saved point?** GEN preserves the original branch and creates an alternative input at the selected point. The associated simulator state and execution context are reused, the repaired input passes through the agent, and the new decision is executed and evaluated.

```text
Saved situation S
  ├─ original decision → observed failure
  └─ diagnosis + proposed intervention
       → agent produces corrected decision and memory
       → execution from S → new feedback and task checks
```

For example, an agent attempts to place an object it has not picked up. A diagnosis may select that decision; the agent proposes picking up the object first. Re-execution tests this alternative from the saved situation. If picking succeeds, the continuation still has to place the object and satisfy the task's checks. The coach's assertion that the repair is correct is insufficient.

The current failure path can also offer a recovery point after suitable invalid tool-call feedback. That asks a different question: **what should the agent do now that it has observed this failure?** It retains the feedback instead of replacing the earlier decision. The allowed anchors determine which intervention is being tested; a recovery is not interchangeable with a rewind to an earlier state.

## Validate: observe the revised continuation

GEN routes the repaired decision through its usual execution and validation machinery: tool results, physical/log conditions, applicable text validation, and call budgets. The repaired branch may succeed, remain ongoing, fail again, or be terminated by exploration limits.

Keep these three outcomes distinct:

| Outcome | Meaning |
| --- | --- |
| Proposal returned as corrected | The agent produced a repair proposal |
| Reinjected candidate produced/executed | The intervention became a real candidate continuation |
| Successful evaluated continuation | The relevant task checks were satisfied after execution |

A `coached` marker identifies origin, not success. Inspect the candidate's status and descendants. A successful local correction also does not certify all later stages of the task. The graph keeps correction source/attempt information so successful, failed, and unresolved interventions remain distinguishable.

## From validation to supervision

After the local intervention, the current agent continues the branch. A correction is useful because of the downstream progress it enables. Policy-sampled candidates and coach-proposed candidates are compared using observed continuations. A failed context can therefore contribute a successful recovery target, while an unsupported coach suggestion need not become a training label.

:::info
See [export](export.md) for more details on how the graph is transformed into a supervised dataset.
:::

## Configure assistance and read its logs

Coaching settings belong to GEN's top-level `coaching` configuration and its backend definitions. GEN supplies effective settings to supported agent sessions. Providers can be LLM-based or human; their network addresses must be reachable from the process using them. The graph viewer is separate from the human coaching interface.

Follow [backend configuration](quickstart/configuration.md#add-a-language-model-backend-later) to enable coaching on a working run. Use `--no-coaching` to collect without coaching. When coaching is enabled, GEN reads the agent's advertised kinds and generic text-resume support. Unsupported corrections are unavailable even if a provider is configured.

Diagnostics and remote coaching logs are recorded under the run's `_coaching_logs/` directory. Use them alongside the [graph viewer](viewer.md) to follow a diagnosis, its proposal, and the actual continuation. Optional successful-coaching example registration/reuse can provide cases to later diagnosis; these settings are separate from exporting a training dataset and do not train the agent during the run.
