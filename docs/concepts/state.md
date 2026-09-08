---
sidebar_position: 5
title: State and Observations
---

# State and Observations

Use the state owned by the layer you are changing.

| Object | Owner and purpose |
| --- | --- |
| Environment state | Physical state and extra data needed to save and restore a simulation |
| `Observation` | Tool input: robot selection, task attributes, raw simulation observation, constants, and batch reservations |
| `SituationInit` | Initial agent-facing attributes, memory dictionary, and history |
| `StageInput` | Instruction and interaction flags for one stage |
| `Situation` | Current runtime interaction context |
| `TaskState` | Symbolic state used while constructing requests and stages |

## Visible vocabulary and physical objects

`attributes` contains the currently exposed task vocabulary. `all_task_attributes` contains all values that may appear, so randomization can establish consistent mappings before later additions. It defaults to the initial attributes when the vocabulary does not change.

Adding an attribute does not create a physical object. Removing a known location does not delete its actor. Keep vocabulary edits, physical changes, and symbolic construction changes explicit.

## Three ways to change state

- A tool returns `Log(content=(attribute_name, value), action="ADD" or "REMOVE")` for a runtime attribute edit, in a stage allowing additive changes.
- A tool returns `EnvStateUpdate` entries for executor-applied simulation changes.
- A request applies constraints or other updates to `TaskState` so subsequent requests are constructed consistently.

These operations are related but are not substitutes for each other. An attribute-edit request normally describes runtime stages and separately updates the construction state to reflect the expected outcome.

## Observation shapes

Tools receive `Observation`; their verifier receives the raw post-execution observation dictionary. Goals receive batched observations and return one verification value per environment.

The `extra` schema belongs to the environment. An entry may be a pose tensor or a dictionary containing `pose`, `state`, and other fields. Use your environment's documented schema; do not assume all entries have the same shape.

**Next:** [Modify attributes](../create-scenarios/interactions/modify-attributes.md) or [preserve environment state](../create-scenarios/execution/env-transitions.md).
