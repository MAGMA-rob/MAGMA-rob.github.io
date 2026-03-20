---
sidebar_position: 3
---

# Tasks and Stages

A task is the unit of work an agent must solve in MAGMA.
It combines the goal of the interaction, the available [tools](./tools.md), the [task-specific attributes](#️-task-attributes), and the sequence of [stages](./tasks.md#what-a-stage-is) that determines how progress is measured.

If a [scenario](./scenarios.md) defines a domain, a task defines one concrete problem inside that domain.

## 📋 What a Task Includes

A task usually specifies:

- the [environment](./envs.md) it runs in
- the [tool API](./tools.md) exposed to the agent
- the task attributes visible to the agent
- metadata used by the framework
- an ordered sequence of stages

This is the object that MAGMA-GEN executes during generation and that MAGMA-BENCH use as support during benchmarking.

## 🪜 What a Stage Is

A stage is the smallest progression unit inside a [task](./tasks.md).
It describes one local objective that must be satisfied before the task can continue.

MAGMA commonly uses two kinds of stages:

- **Action stage**: the agent must change the [environment](./envs.md) through one or more [tool](./tools.md) calls.
- **Text-only stage**: the agent must answer, acknowledge, remember, or adapt to information without directly changing the environment.

This distinction is important because many realistic interactions alternate between acting and reasoning.
For example, a user may first introduce a new rule, then ask the agent to apply it in the next physical step.

## 🎯 Why Stages Matter

Stages allow MAGMA to represent tasks that are:

- long horizon rather than single-step
- interactive rather than static
- constrained by memory, rules, and context
- robust to partial failures or mid-task changes

Instead of judging the whole interaction as one monolithic episode, MAGMA checks whether the agent can keep making correct progress over time.

## ✅ Stage Success Conditions

Each stage defines how success is recognized.
Depending on the stage type, that may involve:

- goal predicates over the [environment](./envs.md) state
- a verification prompt for a text-only response
- target and acceptance step budgets
- catastrophic failure conditions

Conceptually, the stage answers one question:

> What must be true before the task is allowed to move forward?

## 🏷️ Task Attributes

Task attributes are structured pieces of information exposed to the agent alongside the [tool](./tools.md) schema.
They provide context that is not itself a tool.

Examples include:

- robot names or roles
- known zones or workstations
- object classes or identifiers
- battery level or system state
- user-defined rules collected earlier in the interaction

Some tasks allow the agent to update parts of this state indirectly through [tool](./tools.md) calls or logged events.
This is how MAGMA models interactions in which the agent learns, registers, or modifies working knowledge over time.

## ⚙️ Task Presets

A task preset is a fixed or parameterized task instance.
It explicitly selects the [stages](./tasks.md#what-a-stage-is), attributes, [tool API](./tools.md#tool-apis), and metadata that make up the task.

Use a preset when:

- you want a stable, reproducible interaction
- the stage sequence is known in advance
- you are preparing evaluation cases or carefully controlled generation runs

Presets are the most direct way to define a task.

## 📚 Task Definitions

A task definition is a higher-level specification used to generate many tasks from the same logic.
It is primarily a **MAGMA-GEN** authoring abstraction.

Where a preset lists a concrete sequence of [stages](./tasks.md#what-a-stage-is), a definition describes how valid stage sequences should be created from reusable components.
This lets MAGMA generate diverse tasks without hardcoding every interaction by hand.

## 🧠 Generation-Time Components

Task definitions usually rely on three additional concepts:

- **Task state**: the current symbolic state of the task, including entities, relations, memory, and active properties
- **Requests**: candidate user events or interaction units that can create new [stages](./tasks.md#what-a-stage-is)
- **Constraints**: updates applied to the task state when a request changes the interaction

These objects are generation-time abstractions.
They help MAGMA-GEN build coherent tasks that stay consistent with the evolving context.

### Task state

Task state tracks what is currently true from the task author's point of view.
That can include:

- available objects, zones, and types
- assignments between entities
- remembered instructions
- active prohibitions or requirements
- attributes that must persist across stages

Task state is what allows future stages to depend on earlier interaction history.

### Requests

A request represents a possible user-side event that can introduce one or more stages.
Examples include:

- asking to move an object
- adding a new rule
- changing a target zone
- requesting clarification

The generator samples from requests that are valid under the current task state.

### Constraints

Constraints modify the task state after a request is selected.
They encode the lasting effect of what just happened.

For example, a constraint may:

- assign an object to a zone
- mark a zone as restricted
- preserve a new rule for later stages
- update the list of valid future requests

This is how generated tasks remain logically consistent over long interactions.

## 🎲 Semantic Randomization

MAGMA can randomize more than the physical scene.
It can also randomize how the task is described to the agent.

Common randomized elements include:

- tool names
- tool descriptions
- parameter names
- parameter descriptions
- task attribute values

This semantic randomization helps reduce overfitting to one surface form and makes generated data more robust.

## 🧭 Design Principle

The key distinction is:

- a **[scenario](./scenarios.md)** packages reusable domain components
- a **[task](./tasks.md)** assembles those components into one solvable interaction
- a **[stage](./tasks.md#what-a-stage-is)** defines the next checkpoint in that interaction

Keeping those levels separate makes authoring cleaner and evaluation easier to reason about.

## 🚀 Next Steps

For implementation guidance in MAGMA-GEN, continue with:

- [Create a Scenario](../use-magma-gen/tutorials/create-scenarios.md)
- [Create a Stage (Lightweight)](../use-magma-gen/tutorials/create-stages-light.md)
- [Create a Task Preset (Lightweight)](../use-magma-gen/tutorials/create-tasks-light.md)
