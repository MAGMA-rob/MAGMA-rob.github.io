---
sidebar_position: 3
slug: /use-magma-gen/tutorials/modify-attributes
title: Modify Task Attributes
---

# Modify Task Attributes

Use attribute edits when the agent must add or remove a known value, such as a newly announced delivery location. This changes task vocabulary, not the physical scene.

## 1. Return an attribute log from a tool

The following method belongs inside your concrete `BaseToolsAPI` subclass. Import the shown types in that module.

```python
from magma_core.simulation.data_structures import Log, Observation, ToolExecution, ToolResult
from magma_core.simulation.tools import register_tool

# Method body for your concrete tools class:
@register_tool(
    description="Register a newly announced location.",
    params_spec={"location": {"description": "New location name.", "type": str}},
)
def add_location(self, obs: Observation, env_id: int, params: dict) -> ToolExecution:
    location = params["location"]
    known = obs.task_attributes["target_areas"]
    allowed = obs.add_constants["allowed_locations"]
    if location in known or location not in allowed:
        return ToolExecution(poses=[], verifier=None, reason="Location is already known or unsupported.")

    def verifier(new_obs: dict) -> ToolResult:
        return ToolResult(
            ok=True,
            reason=f"Registered {location}.",
            logs=Log(content=("target_areas", location), action="ADD"),
        )

    return ToolExecution(poses=["OK"], verifier=verifier)
```

Set `tools_constant={"allowed_locations": [...]}` on the task with your allowed physical locations. Validate semantic values in addition to decorator type validation. Avoid mutating `obs.task_attributes` directly as a substitute for the log.

## 2. Verify the requested edit

```python
from magma_core.simulation.data_structures import StageInput, UserInstruction
from magma_core.simulation.stage import ModifAttributesBaseStage

stage = ModifAttributesBaseStage(
    mode="ADD",
    stage_input=StageInput(UserInstruction("Register zone_b."), flag_answer_to_user=False),
    val_name="zone_b",
    att_name="target_areas",
)
```

This template enables additive behavior and verifies the expected log action and content. For a custom stage, set `StageGlobalParameters(additive_stage=True)` and implement the corresponding check. Attribute-edit logs in a non-additive stage are treated as failure.

For removal, emit `action="REMOVE"` and use a removal stage. Validate that the value exists before requesting removal.

## 3. Declare the complete vocabulary

```python
from magma_core.simulation.data_structures import SituationInit

initial = SituationInit(
    attributes={"target_areas": ["zone_a"]},
    all_task_attributes={"target_areas": ["zone_a", "zone_b"]},
)
```

Include other attribute groups used by the task as well. This allows a later value to have a stable randomization mapping from the start.

## 4. Keep procedural construction consistent

An attribute-edit request must also update `TaskState` in `apply_request`, using the same sampled change as its runtime stages. `BaseAttributesModifRequest` applies an attribute snapshot and requests replay of derived constraints. It does not build your stages or sample parameters automatically.

## Validate at the right layer

`test-requests` checks symbolic construction. The shared result context processes attribute-edit logs, but the tool tester does not propagate the updated copy back into the attributes used by subsequent manual calls. Validate the full edit-and-use sequence [in GEN](../first-scenario/generate.md), including an action that refers to the newly added value.

For physical changes, use [environment transitions or state updates](../execution/env-transitions.md), not attribute logs.
