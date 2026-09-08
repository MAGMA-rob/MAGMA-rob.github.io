---
sidebar_position: 2
slug: /use-magma-gen/deep-dive/create-tasks
title: Task Preset Contract
---

# Task Preset Contract

Import `BaseTask`, `InitializationParameters`, and `TaskMetadata` from `magma_core.simulation.tasks`.

| Field | Requirement |
| --- | --- |
| `maniskill_env_id: str` | Required registered environment ID |
| `Tools_cls: type[BaseToolsAPI]` | Required tool API class |
| `situation_init: SituationInit` | Required initial interaction data |
| `stages: list[BaseTaskStage]` | Required nonempty stage sequence |
| `initialization_parameters` | Default `InitializationParameters()` from base initializer |
| `task_metadata` | Default `TaskMetadata()` from base initializer |
| `tools_constant: dict` | Defaults to a fresh empty dictionary |
| `name: str` | Defaults to concrete class name |
| `randomized_config_path: str` | Defaults to an empty string |

Call `super().__init__()` and create mutable task data per instance. Fields may be class attributes where appropriate, but avoid sharing mutable initial situations between instances.

## Initial situation

`SituationInit(attributes, all_task_attributes=None, memory=None, history=None)` requires the initial attributes. Memory defaults to a dictionary; history defaults to a list. The complete vocabulary defaults to `attributes`. Supply it explicitly when runtime attribute values can be added later.

## Initialization parameters

`InitializationParameters` groups `env_options`, `planner_options`, and `agent_names`. Public robot names map by index to the environment's robots; the default `['default']` is resolved during task initialization. `known_robots` is validated or injected into task attributes.

Environment options are passed to episode reset. They are not arbitrary environment-constructor options. Planner settings must match the selected robot and planner backend.

## Metadata

`TaskMetadata` still contains `styles`, `approximal_difficulty`, and optional `coaching_hint`. These fields are descriptive; they do not implement a curriculum. They are not required in beginner examples.

## Validation

`validate()` checks required fields, nonempty stages, robot names, and stage contracts. A preceding answer flag with a following `EmptyInstruction` is invalid before completion materialization. Initialization connects the actual robot instances and tools before full execution.

`build_default_task()` belongs to `TaskDefinition` and produces only common task configuration; it does not create a preset's stages.

**Guide:** [task preset](../../create-scenarios/first-scenario/create-tasks-light.md). Related concept: [state](../../concepts/state.md).
