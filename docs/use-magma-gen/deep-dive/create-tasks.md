---
sidebar_position: 8
title: Create a Task Preset
description: Detailed guide to defining and registering MAGMA task presets with BaseTask.
---

# Create a Task Preset

This page explains how to create a MAGMA task preset. For the conceptual explanation, see [Tasks and Stages](../../core-concepts/tasks.md).

It only covers preset tasks based on `BaseTask`.
For task definitions, request systems, task state builders, or constraint-generation pipelines, check the advanced-only [**Task Definitions**](create-tasks-definition.md).

If you want the shortest path first, start with [Create a Task Preset (Lightweight)](../tutorials/building-blocks/create-tasks-light.md).
This page keeps the fuller assembly model and optional task fields.

If you already have:
- an environment
- a tools API
- a set of stages
- a precise idea of the scenario you want to train your agent with

then the task preset is the class that binds them together into one runnable task.

## What a task preset is

A task preset is a concrete subclass of `BaseTask`.

Its role is simple:

- choose which environment to use
- choose which tools API to expose
- define the sequence of stages
- provide some task metadata

So, if tools are the available actions and stages are the objectives, the task preset is the class that assembles both into a complete scenario.

## The base class

Preset tasks inherit from `BaseTask`:

```python
from magma_core.base.tasks import BaseTask
```

`BaseTask` is the connection point between:

- the executor
- the environment
- the stages
- the tools API

## What `BaseTask` does for you

At runtime, `BaseTask` handles the wiring:

1. it initializes the environment selected by `env_id`
2. it receives the real environment agents
3. it instantiates `Tools_cls`
4. it checks and validates every stage
5. when a tool is called, it builds an `Observation` using the current stage attributes
6. when a stage must be verified, it delegates to stage predicates and logs

So the preset itself stays lightweight: it mainly declares configuration and builds `self.stages`.

## Required task attributes

A valid preset requires the following attributes:

| Attribute | Role |
| --- | --- |
| `env_id` | Gym / ManiSkill environment ID to use |
| `name` | Human-readable task name |
| `stages` | Ordered list of stage instances |
| `all_task_attributes` | Full task attribute catalog |
| `Tools_cls` | Tools API class for this task |
| `styles` | Task metadata for categorization |
| `approximal_difficulty` | Estimated difficulty label |
| `env_options` | Options passed to environment reset/init |
| `planner_options` | Motion planner options |

### Which ones are usually class attributes?

Most preset tasks define these at class level:

- `name`
- `env_id`
- `Tools_cls`
- `styles`
- `all_task_attributes`

### Which ones are usually built in `__init__`?

Most preset tasks build these in `__init__`:

- `self.stages`
- sometimes `self.approximal_difficulty`
- sometimes `self.env_options`
- sometimes `self.planner_options`

## The most important fields

### `env_id`

This is the environment name that will be passed to `gym.make(...)`.

Example:

```python
env_id = "SortingCubesWarehouse-v1"
```

It must match a registered environment from your env tutorial setup.

### `Tools_cls`

This is the tools API class used by the task.

Example:

```python
Tools_cls = WithoutManufacturingOrder
```

It must be a subclass of `BaseToolsAPI`.

### `stages`

This is the ordered list of stage instances that define the task progression.

Example:

```python
self.stages = [
    ConstraintSorting(...),
    ObjectToZone(...),
    Cycle(...),
]
```

This is the heart of the preset.

### `all_task_attributes`

This is the full task-level catalog of attributes.

Example:

```python
all_task_attributes = {
    "objects": OBJECTS,
    "target_areas": AREAS,
}
```

This is not the same thing as the stage attributes.
- `all_task_attributes` describes the full task space
- each stage uses its own `situation.attributes`

:::tip
`all_task_attributes` is different from `task_attributes` only if your task implies dynamic attributes modification. In that case, `all_task_attributes` contains all possible values for each attributes.
:::

### `styles`

`styles` is metadata used to characterize the task.

Example:

```python
styles = [
    TaskStyle.CONSTRAINED,
    TaskStyle.LONG_STAGE,
]
```

This is mostly useful for task categorization, curriculum logic, and dataset analysis.

### `approximal_difficulty`

This is a coarse difficulty label such as:

- `"Easy"`
- `"Medium"`
- `"Hard"`

It is metadata, not a verification rule.

## Defaults already provided by `BaseTask`

When you call `super().__init__()`, `BaseTask` already initializes:

- `self.env_options = {}`
- default `self.planner_options`
- a deep copy of `all_task_attributes`
- `self.tools_constant = {}` if not defined
- `self.agent_names = ["default"]` if not defined

This means many preset tasks only need to:

1. call `super().__init__()`
2. build `self.stages`
3. optionally adjust difficulty or options

## Minimal preset example

Here is a compact preset example:

```python
from magma_core.base.tasks import BaseTask
from magma_core.base.tasks_style import TaskStyle

from .tools import SimpleTools
from .stages import PutValveInArea3


class SimpleSortingPreset(BaseTask):
    name = "Simple Sorting Preset"
    env_id = "SortingCubesWarehouse-v1"

    Tools_cls = SimpleTools

    styles = [TaskStyle.CONSTRAINED]
    approximal_difficulty = "Easy"

    all_task_attributes = {
        "objects": ["valve"],
        "target_areas": ["area1", "area2", "area3"],
    }

    def __init__(self):
        super().__init__()
        self.stages = [
            PutValveInArea3(),
        ]
```

This is already a valid preset pattern.

## Example from warehouse sorting

`NoManuPreset` in `warehouse_sorting/no_manu_preset.py` is a good real example.

At class level, it declares:

- `name`
- `env_id`
- `Tools_cls`
- `styles`
- `randomized_config_path`
- `all_task_attributes`

Then, inside `__init__`, it:

- calls `super().__init__()`
- computes the known objects and areas
- builds `self.stages`
- sets `self.approximal_difficulty`

That is exactly the expected role of a preset task.

## How the preset connects stages and tools

This is the one important connection to understand.

When the executor asks the task to run a tool:

1. `BaseTask.execute_tools(...)` looks up the current stage
2. it reads that stage's `situation.attributes`
3. it builds an `Observation`
4. it dispatches the call to `Tools_cls`

So the current stage directly controls which attributes the tools see.

This is why presets matter:

- the preset chooses the stage sequence
- the stage sequence controls the current objective and current attributes
- the tools run inside that stage context

That is the main bridge between objectives and actions.

## Multi-robot presets

If your task uses several robots, you can also define:

```python
agent_names = ["arm1", "arm2"]
```

This lets you override the real environment robot names with logical names used by the task and tools.

If you do not define it, `BaseTask` defaults to `["default"]` and may auto-fill the real agent names during initialization.

For many single-agent presets, you do not need to touch this.

## Optional useful fields

These are not always needed, but can be useful:

| Attribute | Role |
| --- | --- |
| `tools_constant` | Constant values injected into tool observations |
| `agent_names` | Custom logical robot names |
| `randomized_config_path` | Path to randomization config |
| `env_options` | Reset/init options for the environment |
| `planner_options` | Planner configuration |

## Keep the preset simple

A good preset should stay focused on assembly.

In general:

- environment logic belongs in the env class
- action logic belongs in the tools API
- objective logic belongs in the stages
- assembly belongs in the preset

So avoid placing too much execution logic directly inside the task preset.

## Registering the preset in the scenario `__init__.py`

Once your preset class exists, you must register it in the scenario package.

Example from `warehouse_sorting/__init__.py`:

```python
TASK_PRESETS = {
    "NoManuPreset": "no_manu_preset:NoManuPreset",
    "WarehouseSortingSimpPreset1": "no_manu_preset:WarehouseSortingSimpPreset1",
}
```

The format is:

```python
"PublicName": "module_name:ClassName"
```

For example:

```python
"SimpleSortingPreset": "preset:SimpleSortingPreset"
```

means:

- public registry name inside the scenario: `SimpleSortingPreset`
- Python module: `preset`
- class inside that module: `SimpleSortingPreset`

## How the final registry name is built

The scenario loader combines:

- `SCENARIO_NAME`
- the local preset name from `TASK_PRESETS`

So if:

```python
SCENARIO_NAME = "warehouse_sorting"
```

and:

```python
TASK_PRESETS = {
    "NoManuPreset": "no_manu_preset:NoManuPreset",
}
```

then the final registry key becomes:

```python
warehouse_sorting.NoManuPreset
```

This is the name used by the scenario registry loader.

## Recommended workflow

When creating a new preset, a good workflow is:

1. create and register the environment
2. create the tools API
3. create the stages
4. create the preset task that assembles them
5. register the preset in `TASK_PRESETS`

That is also the cleanest mental model:

- env = physical world
- tools = available actions
- stages = objectives
- task preset = runnable assembly

## Common pitfalls

#### 1. Forgetting `super().__init__()`

If you skip it, defaults like `env_options`, `planner_options`, and copied task attributes will not be initialized correctly.

#### 2. Forgetting to define `self.stages`

A task preset must have at least one stage.

#### 3. Mixing `all_task_attributes` and stage attributes

`all_task_attributes` is the full catalog.
Stage attributes live inside each stage's `Situation`.

#### 4. Registering the wrong module path in `TASK_PRESETS`

The format must be exactly:

```python
"Name": "module:Class"
```

#### 5. Putting too much logic in the preset

If something feels like:

- environment construction
- tool behavior
- stage verification

it probably belongs in another layer.

## Summary

To declare a MAGMA task preset:

1. inherit from `BaseTask`
2. define the required metadata (`env_id`, `Tools_cls`, `styles`, `all_task_attributes`, ...)
3. call `super().__init__()`
4. build `self.stages`
5. register the preset in the scenario `TASK_PRESETS` dict

The preset is the lightweight class that ties together:

- the environment from the env tutorial
- the tools API from the tools tutorial
- the objectives from the stages tutorial

That is all a preset task should do, and that is usually enough.
