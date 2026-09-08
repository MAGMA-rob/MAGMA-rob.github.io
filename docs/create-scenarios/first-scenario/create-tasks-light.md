---
sidebar_position: 2
slug: /use-magma-gen/tutorials/building-blocks/create-tasks-light
title: Create a Task Preset
---

# Create a Task Preset

Start from `FirstTask` in [your own package](create-scenarios.md). A preset assembles existing components into an explicit interaction.

In the first task, the tool presses a button and the stage's goal checks that it is depressed. For an action order, record the relevant tool calls and verify their logs. For a judged answer, add a text-only stage. These choices determine what “success” means; [stages and interaction](../../concepts/stages.md) explains them together.

## Minimum declaration

Define `maniskill_env_id`, `Tools_cls`, `situation_init`, and a nonempty `stages` list. Call `super().__init__()` to obtain default metadata, initialization parameters, name, and tool constants.

Create mutable attributes and stage lists per instance. A class-level `SituationInit` mutated by one preset instance can unintentionally affect another.

## Parameterize the interaction

The first tutorial accepts `button` and passes it to its stage. Keep the instruction and verification goal derived from the same argument. Extra `test-tools` CLI arguments are passed to your preset constructor.

## Customize initialization

Inside your preset constructor, after `super().__init__()`:

```python
self.initialization_parameters.env_options = {"use_visual_assets": False}
```

Only use options supported by your chosen environment. For multiple robots, configure `agent_names` in `InitializationParameters` and keep their order aligned with the environment.

`SituationInit.attributes` supplies initial vocabulary; `all_task_attributes` supplies future possible values when vocabulary changes. Memory is a dictionary, for example `memory={"memory_list": ["Keep fragile items separate."]}` when the consuming agent uses that representation.

## Register and test

Add the class reference to your package's manifest `presets`. Run `magma-scenarios show my_buttons`, then `magma-scenarios test-tools my_buttons.FirstTask --nb-env 1`.

A preset is useful before procedural requests exist. You can debug tools and action goals without running a data-generation pipeline.

**Reference:** [task fields and validation](../../reference/scenarios/create-tasks.md).
