---
pagination_next: create-scenarios/first-scenario/create-scenarios
pagination_prev: null
sidebar_position: 1
title: Create Scenarios and Tasks
description: Build a first task in your own package, then add only the components and interactions you need.
---

import DocCardList from '@theme/DocCardList';

# Create Scenarios and Tasks

A scenario brings together an environment, the actions available to an agent, and the tasks it must solve. You can start with a provided environment and a single task, then add your own components as your application grows.

Your code lives in **your own Python package**. Follow the [installation guide](../use-magma-gen/quickstart/installation.md) to install simulation support and the provided scenarios; you do not need to modify the provided scenarios package.

## What belongs in your package?

Your scenario defines the world, available tools, instructions, success and failure conditions, and optional procedural variations. MAGMA-GEN runs these interactions and checks their outcomes. The agent package handles decisions, memory, and interaction history.

Scenario skills can orchestrate domain tools; the agent decides when to call the exposed capabilities. Implementing an agent belongs in a separate guide.

## Start with one working task

If this is your first scenario, follow [Create Your Own Scenario Package](first-scenario/create-scenarios.md). You will register a task that presses a button, reuse an existing environment and tools, and try it manually without connecting an LLM. The guide states the simulation and planner prerequisites.

Then [check your task](first-scenario/testing.md) and [run it with an agent to generate data](first-scenario/generate.md). You can complete this path without adding requests, skills, or a custom environment.

## Extend a working task

Once your first task works, choose the behavior you want to add. These guides are optional extensions; follow only the ones your task needs.

| I want to… | Use… | Example to follow |
| --- | --- | --- |
| Finish when all objects are sorted | An action stage with physical goals | [Color-sorting checkpoints](building-blocks/make-reusable-stages.md) |
| Require a particular order or particular tool arguments | Logs emitted by tools and a stage log verifier | [Verify execution logs](building-blocks/log-verification.md) |
| Announce a rule, then check its application | A text-only acknowledgement followed by action stages | [Persistent rules](interactions/constraint-cycle.md) |
| Let the agent register a new known location | An attribute-edit tool and an additive stage | [Modify task attributes](interactions/modify-attributes.md) |
| Change the scene before a new goal | An environment entry transition | [Change the world between stages](execution/env-transitions.md) |
| Generate varied task sequences | A definition with requests that sample parameters | [Build task variations](procedural-tasks/requests.md) |
| Combine several tool calls into one capability | A skill that orchestrates tools | [Compose a skill](execution/create-cycle.md) |

“Sort all objects” can be **one stage** checking the final arrangement. Use several stages when you want intermediate checkpoints or an instruction/event between actions. A transition is needed only for an automatic world change; ordinary robot actions belong in tools.

## Browse the guides

The first group takes you from a package to a task executed by an agent. **Build Your Components** explains how to implement its pieces; **Design Interactions** explains how to combine them into user-facing behavior. The remaining groups cover procedural variations and optional execution and reconstruction capabilities.

<DocCardList />

## When you need more detail

The [concepts](../concepts/overview.md) explain why each object exists and which state it owns. The [reference](../reference/overview.md) gives exact fields and contracts. Each guide links to the relevant explanation when you need it; neither section is prerequisite reading for the first tutorial.
