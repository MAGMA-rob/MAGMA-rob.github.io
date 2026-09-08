---
sidebar_position: 2
slug: /use-magma-gen/tutorials/building-blocks/create-tools-light
title: Create a Tool
---

# Create a Tool

This example adds a detection tool to your button scenario. It reuses the physical button implementation while explicitly exposing both methods in your concrete API.

```python title="src/my_magma_scenarios/scenarios/buttons/tools.py"
from magma_core.simulation.data_structures import Observation, ToolExecution, ToolResult
from magma_core.simulation.tools import register_tool
from magma_scenarios.scenarios.press_button.helper import tensor_is_button_pressed
from magma_scenarios.scenarios.press_button.tool import Tool as ProvidedButtonTools


class ButtonTools(ProvidedButtonTools):
    @register_tool(
        description="Press a button.",
        params_spec={"id": {"description": "Button name.", "type": str}},
    )
    def press_button(self, obs: Observation, env_id: int, params: dict) -> ToolExecution:
        return super().press_button(obs, env_id, params)

    @register_tool(
        description="Read whether a button is pressed.",
        params_spec={"id": {"description": "Button name.", "type": str}},
        is_detection=True,
    )
    def inspect_button(self, obs: Observation, env_id: int, params: dict) -> ToolExecution:
        button = params["id"]
        if button not in obs.task_attributes["objects"]:
            return ToolExecution(poses=[], verifier=None, reason=f"Unknown button: {button}")

        def verifier(new_obs: dict) -> ToolResult:
            pressed = bool(tensor_is_button_pressed(new_obs["extra"][button][env_id][-1]))
            return ToolResult(ok=True, reason=f"{button}: pressed={pressed}")

        return ToolExecution(poses=["OK"], verifier=verifier)
```

In `preset.py`, replace the provided `Tool` import with `from .tools import ButtonTools`, and set `Tools_cls = ButtonTools`. Then launch the same preset and enter `inspect_button(id="sw0")` or `press_button(id="sw0")`.

## Why explicitly redeclare the physical tool?

`BaseToolsAPI` builds each concrete class's registry from its own decorated methods. Inherited Python behavior remains reusable, but inherited registrations are not automatically exposed. The wrapper intentionally does not enable injected errors; [add them explicitly](../execution/errors.md) when needed.

## Execution versus result

`poses=["OK"]` lets the executor run the verifier without a physical trajectory. `poses=[]` marks a bad/preparation call. The verifier receives the fresh raw observation, not an `Observation` wrapper.

A detection returning `ok=True` means detection succeeded, even if the detected button is not pressed. Whether the task is complete is a separate goal check.

`is_detection=True` also declares no actor changes and identifies this tool for consumers that allow detection before completion answers. Protection is executor-dependent; see [testing limitations](../first-scenario/testing.md#what-the-tool-tester-does-not-validate).

**Next:** [Tool execution options](../../reference/scenarios/create-tools.md) or [compose repeated actions into a skill](../execution/create-cycle.md).
