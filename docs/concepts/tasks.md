---
sidebar_position: 3
slug: /core-concepts/tasks
title: Tasks
---

# Tasks

A task is one runnable interaction. It connects an environment, a tools API, an initial situation, and an ordered list of stages.

## Preset or definition?

| Form | Use it when | What you write |
| --- | --- | --- |
| `BaseTask` preset | You know the interaction you want to run | An explicit sequence of stages, optionally parameterized |
| `TaskDefinition` | You want many coherent interactions | An initial symbolic state and eligible requests |

A preset can have constructor parameters; it need not be one hardcoded case. A definition is a construction recipe, not a runnable task with stages already assembled. Its `build_default_task()` copies the common configuration; a generator must still populate the stages.

## Task configuration

- `maniskill_env_id` selects the registered environment.
- `Tools_cls` selects the tool implementation class.
- `SituationInit` supplies initial attributes, memory, history, and the complete vocabulary for randomization.
- `InitializationParameters` groups environment reset options, planner options, and robot names.
- `stages` describes the interaction and success conditions.

`TaskMetadata` is optional to configure: defaults are supplied. Its styles, approximate difficulty, and coaching hint are descriptive metadata; they do not by themselves activate a curriculum.

## What a stage is

A stage is a checkpoint with an input, completion criteria, and execution settings. One user instruction may span several stages. See [stages and interaction](stages.md) for action stages, text-only stages, and interruptions.

## State ownership

The task owns its initial context. A stage supplies a `StageInput`, rather than a fresh copy of all task attributes and memory. The runtime derives the current `Situation` as interaction progresses. [State and observations](state.md) explains the difference from the generator's `TaskState`.

**Next:** [Create a task preset](../create-scenarios/first-scenario/create-tasks-light.md) or [build tasks from requests](../create-scenarios/procedural-tasks/requests.md).
