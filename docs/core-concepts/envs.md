---
sidebar_position: 5
---

# Environments

The environment is the world in which MAGMA [tasks](./tasks.md) are executed.
It provides the physical or simulated state that [tools](./tools.md) read from and modify.

In MAGMA-GEN and current benchmarking workflows, environments are commonly built on top of [ManiSkill](https://maniskill.readthedocs.io/en/latest/), which in turn relies on simulation components such as SAPIEN and Gym-compatible interfaces.

## 🌐 What an Environment Is Responsible For

An environment defines:

- the scene and physical objects
- robot instances and their initial state
- reset and episode initialization logic
- the observation payload available for tools.

It is the execution substrate that connects [tasks](./tasks.md) and [tools](./tools.md) to actual world state.

## 🔗 Relationship to Tasks and Tools

The separation of concerns is:

- the **environment** owns the world state
- the **[tool](./tools.md)** reads that state and produces an executable action
- the **[task](./tasks.md)** decides which tools are available and what counts as progress

This distinction matters because the same environment can often support multiple [tasks](./tasks.md), and the same task logic can sometimes be reused across several environment configurations.

## 👁️ Observation Flow

For MAGMA, the most important environment output is the observation structure that [tools](./tools.md) can consume.
In practice, this often includes an `extra` payload containing domain-specific state such as:

- object poses
- target locations
- robot TCP or end-effector poses
- machine state
- custom metadata required by tool logic

The environment should expose enough structured state for [tools](./tools.md) to ground the agent's abstract requests in the actual scene.

## ⚡ Parallel Execution

MAGMA commonly runs multiple environments in parallel during generation or evaluation.
This is one reason ManiSkill-based environments are a good fit: they support batched simulation and efficient reset/step behavior for large-scale experiments.

From a conceptual point of view, however, parallelism does not change the abstraction.
Each [task](./tasks.md) still runs inside an environment instance with well-defined observations and transitions.

## 🎲 Physical and Semantic Variation

Environments can vary at several levels:

- physical layout
- object positions
- object identities
- robot configuration
- domain-specific state variables

Some of this variation belongs to the environment itself, while semantic variation belongs to [task](./tasks.md) authoring.
A clean MAGMA design keeps those two sources of variation conceptually separate:

- environment variation changes the world
- task variation changes the interaction logic or language surface

## 🧭 Authoring Guidance

When designing a MAGMA-compatible environment, prioritize:

- stable identifiers for objects and regions
- observations that are easy for tools to interpret

The environment should not encode [task](./tasks.md) logic that belongs in [stages](./tasks.md#what-a-stage-is), requests, or constraints.
It should expose state and dynamics cleanly enough for those higher-level components to reason over.

## 🚀 Next Step

This page explains the role of environments.
If you want to implement one for MAGMA-GEN, continue with [Create an Environment](../use-magma-gen/tutorials/create-envs.md).
