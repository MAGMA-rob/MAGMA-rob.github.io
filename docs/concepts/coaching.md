---
sidebar_position: 12
title: Coaching and Corrections
---

# Coaching and Corrections

Coaching lets MAGMA-GEN explore a corrected continuation when an agent produces
a malformed decision, fails a task, or follows a suboptimal trajectory. It can
make recovery examples available for later training. The agent's model weights
remain fixed during generation.

## Who does what?

| Component | Responsibility |
| --- | --- |
| Scenario and executor | Define and observe success, failure, budgets, and tool results |
| GEN | Select opportunities, assemble evidence, choose allowed restart points, and evaluate continuations |
| Agent package | Define its repair strategy and render corrected decisions with consistent memory |
| Configured LLM backends | Assist automatic diagnosis and agent-specific repair |
| Human in the viewer | Select an executed decision, supply a diagnosis, and propose its replacement |

## Diagnosis and repair

A failed action does not necessarily identify the decision that caused the
failure. The agent may have used a wrong argument, missed a prerequisite,
retained an incorrect assumption, or encountered an injected environment error.
A valid physical action can also fail during execution. Useful supervision must
connect the observed context, the proposed correction, and its consequences.

Automatic coaching can start after a failed stage, invalid format, exhausted
budget, lack of useful action, or suboptimal completed trajectory. Routing,
agent capabilities, and collection budgets determine which opportunities are
eligible; each unsuccessful tool call does not necessarily trigger a correction.

GEN supplies stage objectives, decisions, feedback, and relevant error
information. Diagnosis identifies a decision worth revisiting and explains the
suspected cause. For a trajectory with only one diagnosable decision, diagnosis
can be deterministic. Format repair and text rewriting have their own routes;
the process does not require three LLM calls for every correction. A suboptimal
diagnosis can decline to propose a repair.

The agent owns the strategy appropriate to its architecture. It might replace
an action, repair a summary, or revise a plan. GEN sends the resulting correction
through the normal agent response endpoint so the new decision and memory stay
consistent before execution resumes.

## Counterfactual re-execution

A replacement tests **what happens if the agent makes a different decision from
this saved point**. GEN preserves the original branch and creates an alternative
using the saved input, simulator state, and execution context.

```text
Saved situation S
  ├─ original decision → original outcome
  └─ diagnosis + intervention
       → agent renders corrected decision and memory
       → execution from S → new feedback and task checks
```

For example, an agent tries to place an object before picking it up. A diagnosis
can select that decision and propose picking up the object first. Re-execution
checks the pick from the saved situation; the continuation still has to place
the object and satisfy the task's conditions.

An automatic failure route can also offer recovery after suitable invalid
call feedback. This retains the failure feedback and asks what to do next.
Restart anchors distinguish recovery from replacement of an earlier decision.

## Human corrections in the viewer

It is also possible to a human to propose correction directly through the viewer. Take a look at [the viewer guide](../use-magma-gen/viewer.md#coach-an-active-run).

## Validation and training evidence

GEN checks the new continuation using tool feedback, physical/log goals,
applicable semantic validation, and execution budgets. The new branch can
succeed, remain ongoing, fail again, or stop at an exploration limit.

| Outcome | What it establishes |
| --- | --- |
| Proposal produced or correction accepted | An intervention is available for reinjection |
| Candidate rendered and executed | The intervention became a real continuation |
| Successful evaluated continuation | The relevant task checks were satisfied |

A `coached` marker identifies origin. A successful local correction does not
certify the rest of the task, and acceptance does not guarantee a training row.
The [exporter](../use-magma-gen/export.md) selects candidates using observed
downstream outcomes. Validated examples can also be registered for later
automatic coaching; that cache reuse does not train the agent during a run.

## Capabilities and budgets

GEN uses the support announced by the agent. Specialized correction kinds are
`format`, `failure`, and `suboptimal`; generic text-resume support is advertised
separately. Agents may implement only some routes. Adding a new internal model
or memory component does not automatically provide a suitable repair strategy.

GEN owns backend configuration and supplies effective settings to supported
agent coaching sessions. Those sessions use LLM backends and optional log
capture. Human interventions use viewer controls rather than a separate provider.
Inference and coaching share Core's HTTP protocol `2.0`. Returned logs are saved
by GEN; the agent does not need the output directory mounted locally.

Automatic work has per-stage pending and unproven limits, both defaulting to
five. Pending includes queued, running, and answered requests awaiting reinjection.
Unproven work counts pending plus completed attempts minus attempts that led to
stage success. Human interventions are exempt from those two limits, while
normal stage/exploration budgets still apply.

To enable assistance and reuse examples, follow [Configure Coaching](../use-magma-gen/coaching-and-generation.md).
