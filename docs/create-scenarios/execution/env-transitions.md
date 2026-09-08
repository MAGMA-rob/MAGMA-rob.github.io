---
sidebar_position: 2
title: Change and Preserve Environment State
slug: /create-scenarios/env-transitions
---

# Change and Preserve Environment State

Choose the mechanism matching the cause of the change.

| Change | Mechanism |
| --- | --- |
| Initial object placement | Environment episode initialization |
| An external event before a stage | `entry_transition` |
| Reset after a completed interaction | `reset_at_end` |
| Explicit effect of a tool | `ToolResult.state_updates` |
| Extra state needed for replay | Environment extra-state hooks |

## Add an entry transition

This transition targets the `cube` actor in the [cube environment](../building-blocks/create-envs.md). Its standard actor-state layout starts with XYZ coordinates.

```python title="src/my_magma_scenarios/scenarios/cube_transitions.py"
import torch
from magma_core.simulation.stage.environment_transition import BaseStageEnvironmentTransition


class MoveCubeAtEntry(BaseStageEnvironmentTransition):
    def __init__(self, x: float) -> None:
        self.x = x

    def apply(self, env_state: dict, env_ids: torch.Tensor) -> dict:
        actor = env_state["actors"]["cube"]
        indices = env_ids.to(actor.device)
        actor[indices, 0] = self.x
        return env_state

    def _to_spec_arguments(self) -> dict:
        return {"x": self.x}
```

Pass `entry_transition=MoveCubeAtEntry(x=0.1)` to your cube stage's base constructor. It changes only selected environment slots. For a full relocation, define orientation and velocity behavior as appropriate; this example only changes X.

Prefer a transition object for reusable automatic effects. `build_init_state` delegates to its `apply` method. Preserve state layout and tensor shapes.

## Return explicit tool effects

A tool can return updates through its verifier. This fragment assumes your environment exports a tensor named `machine_on` under `magma_extra_state`:

```python
from magma_core.simulation.data_structures import EnvStateUpdate, ToolResult

result = ToolResult(
    ok=True,
    reason="Machine switched on.",
    state_updates=[EnvStateUpdate(path=("magma_extra_state", "machine_on"), value=True)],
)
```

Paths address the **saved environment state**, not the observation's `extra` dictionary. The executor applies each update to the current environment index; the leaf must be a tensor. Ensure the path exists and has a compatible shape and dtype.

Verification produces the updates before the executor applies them. Stage checks in the consuming executor can then see the refreshed observation. Do not assume the same verifier has already observed its own returned update.

Actor updates also interact with `allowed_moving_actors`: a subsequent protection pass can restore an actor whose update was not allowed.

## Preserve custom world data

Inside your environment class, for an existing batched `self.machine_on` tensor:

```python
 def get_magma_extra_state(self) -> dict:
     return {"machine_on": self.machine_on.clone()}

 def set_magma_extra_state(self, state: dict) -> None:
     self.machine_on = state["machine_on"].clone()
```

Create and initialize that tensor as part of your environment lifecycle. `DefaultEnv` includes it under `magma_extra_state` during snapshot save/restore. Expose it separately in observations if tools need to read it.

Validate save → modify → restore, including a selected environment in a batch. Without these hooks, a physics snapshot can look correct while hidden machine state is wrong.
