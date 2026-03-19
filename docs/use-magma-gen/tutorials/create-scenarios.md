---
sidebar_position: 1
---

# Create a Scenario

Learn how to structure a scenario package, register task definitions and presets, organize reusable files, and connect the scenario to MAGMA-GEN.

For the conceptual explanation, see [Scenarios](../../core-concepts/scenarios.md).

## Create the module

A scenario is a container to define multiples tools, tasks definition, tasks presets and stages. Most of the time it is link to one maniskill environment.

Under `magma_scenarios.scenarios`, create a folder and name it with your desired scenario name.
```bash
mkdir amazing_scenario
```

Inside it, you need at least to define the `__init__.py` file. Its goal is to import three elements.

```python title="__init__.py"

SCENARIO_NAME = "amazing_scenario"

TASK_DEFINITIONS = {
    # The different definition you want to expose to magma_gen
}

TASK_PRESETS = {
    # The task preset you want to expose to magma_gen
    # + 
    # Benchmark tasks (if needed)
}
```

## Create or Select an environment

The next step is to create or to choose from the existing envs `magma_scenarios.env`.
:::tip
To learn how to create a env -> [See this tutorial](./create-envs.md)
:::

## Create your First Tool

## Create a Task Preset

## Create a Task Definition

