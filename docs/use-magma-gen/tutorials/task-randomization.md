---
sidebar_position: 9
title: Randomize Tasks
description: Learn how to randomize tool names, parameter names, and task attributes through a YAML config.
---

# Randomize Tasks

MAGMA task randomization is a wrapper layer. It changes what the model sees without forcing you to rewrite your environment, stages, or tools.

That is why it is configured in a separate YAML file instead of inside your task logic.

## What gets randomized

With one config file, you can randomize:

- tool names
- tool descriptions
- parameter names
- parameter descriptions
- attribute values shown to the model, such as object names or target areas

Your Python code still keeps the real runtime names.

## 1. Create a YAML config

A randomization config has two main sections:

```yaml
tools: # key are current tool name
  launch_cycle: 
    name: # possible tool names
      - execute_full_sorting_cycle
      - run_allocation_sequence
    description: # possible tool description
      - Launch a default cycle to sort all objects to their assigned areas.
      - Execute a sorting sequence to distribute all references to their respective target zones.
      - Start an automatic operation to classify and move every object to its destination.

    parameters: # keys are current parameters name
      assignment:
        name: #possible name for this parameters
          - assignment
          - sorting_map
        description: #possible description for this parameters
          - A dictionary mapping each object to its corresponding target area.
          - Data structure linking object identifiers to their destination areas.

# Currently we mostly support list attributes randomization
attributes: # keys are attributes keys
  objects:
    - ["ref_obj_1", "ref_obj_2", "ref_obj_3"]
    - ["conveyor_belt", "metal_part", "assembly_tool"]

  target_areas:
    - ["area1", "area2", "area3"]
    - ["storage_bin", "inspection_station", "assembly_zone"]
```


## 2. Attach it to the task

Then expose the file from your preset, benchmark, or task definition with `randomized_config_path`:

```python
class NoManuPreset(BaseTask):
    randomized_config_path = str(Path(__file__).parent.joinpath("config.yaml"))
```

This is the only task-side hook you usually need.

:::tip
In generation, randomization is enabled by default through the main MAGMA config. If needed, you can disable it at launch time with `-nr`.
:::

## 3. Let MAGMA handle the translations

At runtime:

- `SpecGenerator` loads the YAML and builds one or more randomization specs
- `Randomizer` wraps these specs
- `RuntimeRandomizer` exposes randomized tools and attributes to the model
- when the model calls a randomized tool, `map_tool_call(...)` translates it back to the real runtime name and parameters

So your stage goals can still use the real names from the environment, while the model interacts with randomized public names.

:::tip
MAGMA handles the traduction in both direction.
:::

## Why this design is useful

- your task logic stays readable
- your env and stage code stay stable
- you can increase language diversity without touching low-level execution
- benchmark mode can reuse the same config to generate several deterministic variations

## One important rule

Do not rewrite your stage code to use randomized names.

Keep real runtime names in:

- env observation keys
- tool implementations
- goal predicates
- stage attributes in code

Randomization is applied around the task, not inside the task logic.

:::tip
Use randomization to create equivalent surface forms, not different meanings. A randomized alias should still describe the same tool or attribute.
:::
