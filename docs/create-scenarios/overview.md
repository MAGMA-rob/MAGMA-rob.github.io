---
sidebar_position: 1
title: Create Scenarios and Tasks
description: Build a first task in your own package, then add only the components and interactions you need.
---

import DocCardList from '@theme/DocCardList';

# Create Scenarios and Tasks

A scenario brings together an environment, the actions available to an agent, and the tasks it must solve. You can start with a provided environment and a single task, then add your own components as your application grows.

Your code lives in **your own Python package**. Install `magma_core[simulation]` and `magma_scenarios` as dependencies through your usual MAGMA installation method; you do not need to modify the provided scenarios package.

## What belongs in your package?

Your scenario defines the world, available tools, instructions, success and failure conditions, and optional procedural variations. GEN and BENCH execute and evaluate these interactions according to their respective modes. The agent package owns decision making and its internal memory and history management.

`TaskState` is the symbolic state used to construct tasks. It does not represent the agent's reasoning or internal memory. Scenario skills can orchestrate domain tools; the agent decides when to call the exposed capabilities. Implementing an agent belongs in a separate guide.

## Start with one working task

If this is your first scenario, follow [Create Your Own Scenario Package](first-scenario/create-scenarios.md). You will register a task that presses a button, reuse an existing environment and tools, and try it manually without connecting an LLM. The guide states the simulation and planner prerequisites.

That first result is enough to understand how the pieces fit together. Requests and skills can be added later.

## What do you want your task to express?

Start with the behavior you want to observe. You can combine these mechanisms as your task grows; you do not need all of them in a scenario.

| I want to… | Use… | Example to follow |
| --- | --- | --- |
| Finish when all objects are sorted | An action stage with physical goals | [Color-sorting checkpoints](building-blocks/make-reusable-stages.md) |
| Require a particular order or particular tool arguments | Logs emitted by tools and a stage log verifier | [Verify execution logs](building-blocks/log-verification.md) |
| Announce a rule, then check its application | A text-only acknowledgement followed by action stages | [Persistent rules](interactions/constraint-cycle.md) |
| Let the agent register a new known location | An attribute-edit tool and an additive stage | [Modify task attributes](interactions/modify-attributes.md) |
| Partially reset the env before a new goal | An environment entry transition | [Change the world between stages](execution/env-transitions.md) |
| Scale my task | A definition with requests that sample parameters | [Build task variations](procedural-tasks/requests.md) |
| Compose tool that take multiple interaction (pick-and-place) | A skill that orchestrates tools | [Compose a skill](execution/create-cycle.md) |

“Sort all objects” can be **one stage** checking the final arrangement. Use several stages when you want intermediate checkpoints or an instruction/event between actions. A transition is needed only for an automatic world change; ordinary robot actions belong in tools.

## Browse the guides

The first group takes you from a package to a tested task. **Build Your Components** explains how to implement its pieces; **Design Interactions** explains how to combine them into user-facing behavior. The remaining groups cover procedural variations and optional execution and reconstruction capabilities.

<DocCardList />

## When you need more detail

The [concepts](../concepts/overview.md) explain why each object exists and which state it owns. The [reference](../reference/overview.md) gives exact fields and contracts. Each guide links to the relevant explanation when you need it; neither section is prerequisite reading for the first tutorial.
