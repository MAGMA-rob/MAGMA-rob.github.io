---
sidebar_position: 11
title: Coaching and Corrections
---

# Coaching and Corrections

Coaching helps MAGMA-GEN explore a corrected continuation when an agent produces a malformed decision, fails a task, or follows a suboptimal trajectory. It can make recovery examples available for later training. It does not update the agent's model weights during the run.

## Who does what?

| Component | Responsibility |
| --- | --- |
| Scenario and executor | Define and observe success, failure, budgets, and tool results |
| GEN | Select correction opportunities, assemble context, choose allowed restart points, and evaluate new continuations |
| Agent package | Define its own correction logic and how corrections affect internal models, memory, and decisions |
| Configured coaching provider | Supply LLM or human assistance to the correction process |

A verifier deciding whether an answer is acceptable and a coach proposing a better continuation have different roles. The same external model service may support several roles without becoming the agent under evaluation.

## Correction lifecycle

```text
Agent decision → execution / validation → correction opportunity
  → diagnosis and agent-specific repair
  → proposal at an allowed restart point
  → agent processes the corrected input
  → execution / validation of the new continuation
```

A proposal is not proof of success. GEN sends the corrected input through the agent's inference interface so the agent can produce a coherent decision and memory, then checks the new execution. Earlier records remain available along with correction provenance.

Examples include repairing invalid output syntax, replacing a failed action, or revising a plan or memory that caused a poor decision. Each agent decides what can be repaired and how. A summarizing agent might need to correct its summary and rerun its decision model; another agent may replace only one action.

## Optional capabilities

GEN uses the support advertised by the agent. Specialized correction kinds are `format`, `failure`, and `suboptimal`; support for resuming generic text corrections is advertised separately. Do not assume every agent implements every correction route.

Full-history currently implements specialized corrections and replacement decisions. The history-summarized example currently leaves corrections disabled; adding a summarizer requires an appropriate repair strategy, not automatic reuse of full-history's memory edits.

GEN owns the coaching provider configuration and sends effective settings to supported agent coaching sessions. Agent inference/model settings stay in the agent package's configuration. Logs return to GEN for recording; the agent does not need the run's output directory mounted locally.

For operating GEN and interpreting tested interventions, read [Diagnose, propose, validate](../use-magma-gen/coaching-and-generation.md).
