---
sidebar_position: 1
slug: /use-magma-gen/tutorials/create-cycle
title: Compose Tools into a Skill
---

# Compose Tools into a Skill

Use a skill when one action should orchestrate several tool calls, inspect intermediate results, and retain progress. The current API replaces the old `ToolExecution(..., redo=...)` pattern with explicit skill execution.

## A two-button skill

```python title="src/my_magma_scenarios/scenarios/buttons/skills.py"
from magma_core.simulation.data_structures import RobotToolStatus, ToolErrorFlag
from magma_core.simulation.skills import BaseSkill, CallTick, MessTick, SkillSpec, SkillTick


class PressPairSkill(BaseSkill):
    spec = SkillSpec(
        name="press_pair",
        description="Press two buttons in order.",
        required_tools=["press_button"],
        argument_schema={
            "first": {"type": "str", "description": "First button."},
            "second": {"type": "str", "description": "Second button."},
        },
    )

    def __init__(self, arguments: dict) -> None:
        super().__init__(arguments)
        self.index = 0
        self.buttons = [arguments.get("first"), arguments.get("second")]

    def start(self) -> SkillTick:
        if any(button not in {"sw0", "sw1", "sw2", "sw3", "sw4"} for button in self.buttons):
            return MessTick("Provide two valid button names.", False, ToolErrorFlag.BAD_CALL)
        return CallTick("press_button", {"id": self.buttons[0]})

    def tick(self, status: RobotToolStatus) -> SkillTick:
        if not status.result:
            return MessTick(status.mess, False, status.error_flag)
        self.index += 1
        if self.index == len(self.buttons):
            return MessTick("Both button actions completed.", True, ToolErrorFlag.NONE)
        return CallTick("press_button", {"id": self.buttons[self.index]})
```

`start` returns the first tool call. `tick` receives each result and either continues or terminates. This example stops on failure; a more advanced skill can retry with a bounded counter. Each invocation owns its own index and arguments.

## Register and use it

Add to your manifest:

```python
skills={
    "PressPair": "my_magma_scenarios.scenarios.buttons.skills:PressPairSkill",
},
```

`PressPair` is the registry key; `press_pair` is the public skill name in its spec. A skill-aware consumer loads and enables it, for example using `load_skills("my_buttons.FirstTask", ["PressPair"])`. For GEN, [pass the registered skill key with `--skills PressPair`](../first-scenario/generate.md#check-answers-and-multi-stage-interactions). Registration alone does not enable the skill in every consumer, and `test-tools` does not accept skill calls.

The task still needs matching goals and stage boundaries. A skill does not define stage success. For repeated presses of an already-depressed button, arrange appropriate stage resets or an environment/tool capable of repeated presses.

## Why keep loops here?

A long opaque tool hides intermediate results. A skill makes each call observable and gives the runtime opportunities to handle errors and [interruptions](../interactions/interruption.md). The manager can preserve a next tick while a new instruction is processed; cancellation and resumption remain explicit runtime operations.

For a complete sorting example, the installed warehouse scenario provides `CycleSkill`, which alternates pick and place. See the [skill reference](../../reference/scenarios/skills.md) for the contract.
