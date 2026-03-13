---
sidebar_position: 1
---

# Overview

MAGMA is a framework for building, generating, and evaluating reasoning-heavy robotic tasks.
It separates high-level decision making from low-level robot execution:

> The agent decides what to do. The robotic stack decides how to do it.

In practice, an agent does not produce joint trajectories or control commands directly.
Instead, it observes the current state of a [task](./tasks.md), selects from a set of available [tools](./tools.md), and uses those tools to complete a sequence of [stages](./tasks.md#what-a-stage-is) inside an [environment](./envs.md).

## 🎯 What MAGMA Focuses On

MAGMA is designed for settings where robotic intelligence is primarily about:

- long-horizon planning
- sequencing multiple actions correctly
- following persistent rules and constraints
- adapting when the user changes the task during execution
- coordinating with structured system interfaces instead of raw motor control

This makes MAGMA well suited for research and industrial workflows in which success depends on reasoning quality, interface design, and reliable task structure.

## 🧱 Core Building Blocks

MAGMA is easier to understand if you read it from the outside in:

1. A [scenario](./scenarios.md) defines a reusable application domain.
2. A [task](./tasks.md) defines one concrete problem for the agent to solve.
3. A task is made of one or more [stages](./tasks.md#what-a-stage-is), which act as checkpoints in the interaction.
4. The agent acts through [tools](./tools.md), which expose the system's capabilities.
5. Tools operate inside an [environment](./envs.md), such as a ManiSkill simulation or a real deployment backend.

## 🔄 How the Components Interact

The conceptual flow looks like this:

```text
Scenario
  ├─ Environment
  ├─ Tool API
  ├─ Task Definitions
  └─ Task Presets

Task
  ├─ Attributes and metadata
  ├─ Sequence of stages
  └─ Available tools

Stage
  ├─ User-facing instruction or constraint
  └─ Success condition

Tool call
  ├─ Structured action selected by the agent
  └─ Executed by planners, policies, or robot services
```

Each layer serves a different purpose:

- A [scenario](./scenarios.md) packages reusable domain components.
- A [task](./tasks.md) assembles those components into a solvable interaction.
- A [stage](./tasks.md#what-a-stage-is) defines what must happen before the task can progress.
- A [tool](./tools.md) gives the agent a controlled way to act.
- An [environment](./envs.md) provides the state that tools read from and modify.

## ⚖️ What MAGMA Is and Is Not

### MAGMA is

- a framework for reasoning agents that use robotic capabilities through structured interfaces
- a way to study long-horizon instruction following, task decomposition, and constraint handling
- a shared abstraction for data generation in MAGMA-GEN and evaluation in MAGMA-BENCH

### MAGMA is not

- a low-level robot controller
- an end-to-end visuomotor policy by itself
- a replacement for motion planning, control, perception, or execution middleware

MAGMA depends on those lower layers. Its contribution is the reasoning interface that sits above them.

## 🧪 Generation and Evaluation

The same conceptual objects appear in both authoring workflows:

- **MAGMA-GEN** uses scenarios and task definitions or presets to generate trajectories and datasets.
- **MAGMA-BENCH** uses scenarios and benchmark-ready tasks to evaluate agents consistently.

The core concepts in this section stay the same across both packages.
What changes is how those concepts are instantiated, sampled, and measured.

## 🧭 Reading Path

If you are new to MAGMA, read the pages in this order:

1. [Scenarios](./scenarios.md)
2. [Tasks and stages](./tasks.md)
3. [Tools](./tools.md)
4. [Environments](./envs.md)

If you already understand the concepts and want implementation guidance, continue with:

- [MAGMA-GEN tutorials overview](../use-magma-gen/tutorials/overview.md)
- [MAGMA-GEN overview](../use-magma-gen/overview.md)
- [Custom planner integration](../customization/create-planner.md)
