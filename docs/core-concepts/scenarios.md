---
sidebar_position: 2
---

# Scenarios

A scenario is the top-level package used to describe one application domain in MAGMA.
It groups together the components needed to generate or evaluate [tasks](./tasks.md) in a consistent setting.

In most projects, a scenario corresponds to a domain such as warehouse sorting, table organization, coffee making, or assembly assistance.

## 📦 What a Scenario Contains

A scenario typically bundles:

- one [environments](./envs.md)
- one or more [tool APIs](./tools.md)
- reusable [task](./tasks.md) components
- task presets for fixed interactions
- task definitions for generated interactions
- optional benchmark registration or configuration files

The purpose of the scenario abstraction is reuse.
Instead of redefining tools, stages, and environment bindings for every experiment, you keep related components together in one domain package.

:::danger
We **highly recommend** to define the env outside of the scenario module. Allowing the reuse of the environment by different scenarios. You can define it in `magma_scenarios.envs`.
:::

## 🌍 Why Scenarios Matter

Scenarios make it possible to:

- share the same [environment](./envs.md) and [tool](./tools.md) interfaces across many [tasks](./tasks.md)
- compare agents on a coherent family of problems
- keep generation logic and evaluation logic aligned
- scale a project without mixing unrelated domain code

For research, this improves reproducibility and experiment design.
For industry, it helps keep task authoring maintainable as the number of workflows grows.

## 🔗 Conceptual Relationship to Other Objects

The relationship is:

```text
Scenario
  -> defines reusable domain components
  -> exposes tasks to MAGMA-GEN or MAGMA-BENCH

Task
  -> selects stages, tools, attributes, and metadata

Stage
  -> defines a local objective or interaction checkpoint
```

A scenario does not represent one run or one prompt.
It represents the domain package from which many [tasks](./tasks.md) can be created.

## 🗂️ Scenario Registry

MAGMA loads scenarios through a lightweight registry in each scenario package's `__init__.py`.
That registry tells the framework which [task definitions](./tasks.md#task-definitions) and [task presets](./tasks.md#task-presets) the scenario exports.

Typical fields are:

- `SCENARIO_NAME`: the public name of the scenario
- `TASK_DEFINITIONS`: generation-oriented task definitions
- `TASK_PRESETS`: fixed or parameterized task presets

```python title="Example scenario registry"
SCENARIO_NAME = "warehouse_sorting"

TASK_DEFINITIONS = {
    "SimpleSortingDefinition": "definitions:SimpleSortingDefinition",
}

TASK_PRESETS = {
    "WarehouseSortingPreset": "preset:WarehouseSortingPreset",
    "WarehouseSortingNoOrders": "no_manu_preset:WarehouseSortingNoOrders",
}
```

With this structure, MAGMA can discover tasks from the scenario without importing every implementation detail eagerly.

## 🏗️ Recommended Structure

There is no single mandatory file layout, but scenarios are easier to maintain when components stay clearly separated.
A common structure is:

```text
warehouse_sorting/
├── __init__.py
├── benchmark.py          # optional
├── config.yaml           # optional semantic randomization
├── definitions.py
├── preset.py
├── requests.py
├── constraints.py
├── stages.py
├── tools.py
└── env.py
```

This separation is useful because many components are reused:

- the same [tools](./tools.md) may support several [tasks](./tasks.md)
- the same [stages](./tasks.md#what-a-stage-is) may appear in different task presets
- the same [requests](tasks.md#requests) and [constraints](./tasks.md#constraints) may feed several [task definitions](./tasks.md#-task-definitions)

## 🧪 Environment Placement

Environments are often shared across scenarios or reused broadly enough that they should live in a dedicated env module namespace.
The important design principle is not the exact path, but the separation of concerns:

- [environments](./envs.md) define world state and physics
- [tools](./tools.md) define action interfaces
- [tasks](./tasks.md) define objectives and progression logic
- scenarios package those pieces together

## 🧩 Templates and Reuse

MAGMA also provides reusable template components in `magma_scenarios.template`.
These templates are useful when you want to preserve a common interaction pattern while specializing only the domain-specific parts.

Use templates when they reduce repeated logic.
Create custom components when the scenario needs a genuinely different abstraction.

## 🚀 Next Step

This page explains what a scenario is.
If you want to author one in MAGMA-GEN, continue with [Create a Scenario](../use-magma-gen/tutorials/create-scenarios.md).
