---
sidebar_position: 3
title: On-policy Collection and Branching
---

# On-policy Collection and Branching

A GEN run repeatedly asks an agent what to do, executes the proposed actions, and checks task progress. The important unit is the interaction: an instruction or tool result, the context available to the agent, its decision, and the consequences of that decision.

## One trajectory

For a button task, the interaction might be:

```text
User: Press sw0, then sw1.
  → agent calls press_button(sw0)
  → simulator executes the tool and returns its status
  → task checks whether the checkpoint is satisfied
  → agent receives the next input with its updated memory
  → agent calls press_button(sw1)
  → the next checkpoint is evaluated
```

The agent receives the task's public input, available tool descriptions, attributes, and its own memory. It proposes tool calls or a user-facing answer. The simulator and scenario evaluate the effect.

A stage can verify physical conditions, execution logs, or a textual answer. The configured semantic judge is used where the stage requires one. An intermediate checkpoint may continue the same instruction, introduce another request, or end the interaction with a completion answer. See [stages and interaction](../concepts/stages.md) for these meanings.

## What on-policy means in this workflow

Ordinary decisions are sampled from the connected agent. Later inputs depend on the states those decisions reached and the memory that candidate returned. Consequently, collection includes contexts arising from the agent's behavior, including its mistakes; it is not limited to replaying a supplied successful solution.

This describes how experience is collected. It does not mean an optimizer updates weights online. Training must be done after using the data generated.

## Explore more than one continuation

GEN can request several candidates from the same situation:

```text
Situation S: instruction + context + memory + saved environment
  ├─ candidate A → execution result A → situation S_A
  └─ candidate B → execution result B → situation S_B
```

Each branch keeps its own memory and execution state. Subsequent outcomes can therefore be compared from a shared starting situation without one branch inheriting another's actions. The graph also retains alternatives created by coaching.

The branch count controls candidate exploration. It does not guarantee distinct answers: deterministic decoding can return identical candidates. A wider graph may reveal more successful continuations, but also costs more inference, simulation, and validation work. This can be set with the `nb_branch` cli and config parameters.

## Parallel simulation is a resource pool

The environment count controls how many physical executions can be processed concurrently. It is independent of the number of candidates requested from the agent.

GEN restores a branch's saved state into an available simulation slot, executes its tools, and records the resulting state. Slots can then serve other branches. The graph can contain many more trajectories than there are simultaneous environments; each branch does not need its own permanently occupied simulator.

Snapshots and runtime context preserve the state needed for continuation, including task progress and execution logs. A scenario's custom state must be covered by its save/restore contract. This is also what makes the [counterfactual re-execution](coaching-and-generation.md#counterfactual-re-execution) meaningful.

## Interpret outcomes at the right level

| Observation | What it establishes |
| --- | --- |
| Valid agent response | The decision obeyed the response format |
| Successful tool status | That tool's execution/verifier reported success |
| Completed stage | The stage's configured checks were satisfied |
| Optimal/suboptimal classification | Efficiency relative to the stage's declared accounting and target |
| Completed task trajectory | The required stage sequence was traversed successfully |
| Selected export example | The candidate also passed the exporter workflow's selection criteria |

These are different claims. A tool can run successfully without completing the goal. A stage can succeed using more calls than its target. “Optimal” is a local task-defined classification, not a proof of the globally shortest plan. Tool retries, injected failures, and forgiven calls can affect effective accounting.

An unfinished branch can continue while it remains eligible and within budget. Failed or exhausted trajectories can stop, receive an eligible coaching attempt, or remain as recorded evidence. GEN does not continue every branch indefinitely, and stopping a run does not imply every sampled trajectory solved the task.

## Choose collection settings by their effect

| Setting or input | Effect on the collected run |
| --- | --- |
| Preset | Explicit task/stage sequence |
| Definition | Task constructed from sampled requests |
| Branch count | Alternative agent candidates per sampled situation |
| Environment count | Physical execution concurrency |
| Stage launch/continuation limits | Bounds on exploration within stages |
| Target/max tool calls | Expected efficiency and execution budget declared by the task |
| Coaching enabled and available | Whether supported corrections can add continuations |

For definitions, the generated-task target budget controls how much work is assembled; it is not a direct limit on total wall time or all model calls in the exploration graph. See [run configuration](quickstart/configuration.md) for a starting configuration and `magma-gen run --help` for available command-line options.

## Preserve evidence, then select data

The saved graph retains inputs, decisions, internal model records supplied by the agent, outcomes, and coaching provenance. Some nodes will be invalid, unsuccessful, unassessed, or unsuitable for training. Inspect these in the [viewer](viewer.md) before interpreting the final [export](export.md).

Collection is valuable precisely because it exposes what the policy did and what followed. Whether those experiences improve a trained model is an empirical question; the [MAGMA-GEN paper](https://openreview.net/pdf?id=r7ZN8cPEcj) is the scientific reference for the method and evaluation.
