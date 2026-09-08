---
sidebar_position: 4
slug: /use-magma-gen/deep-dive/create-tasks-definition
title: Task Definitions and Requests
---

# Task Definitions and Requests

Import `TaskDefinition` from `magma_core.simulation.tasks`, `BaseRequest` from `magma_core.simulation.requests`, and `TaskState` / `RuleRenderer` from `magma_core.simulation.state`.

## Definition configuration

`TaskDefinition` requires `situation_init` in its constructor. Define `maniskill_env_id`, `Tools_cls`, and `active_requests` on the class or through constructor arguments. `build_default_task()` rejects missing runtime fields.

Optional constructor arguments include `starting_state`, `name`, `randomized_config_path`, `initialization_parameters`, `task_metadata`, and `tools_constant`. Without a starting state, the base creates a `TaskState` from copied initial attributes and memory. `RuleRenderer_cls` defaults to `RuleRenderer`, whose `rules` method returns an empty list.

`build_default_task()` copies shared configuration into `BaseTask`; the caller must assemble stages before running the task.

## Requests: the generation-time building blocks

`BaseRequest[ParametersT]` has this contract:

| Method | Return | Default |
| --- | --- | --- |
| `sampling_weight(state)` | Relative weight | `1.0` |
| `sample_parameters(state)` | Sampled parameter value | Must implement |
| `create_stages(state, parameters)` | `list[BaseTaskStage]` | Must implement |
| `apply_request(state, parameters)` | Next `TaskState` | Returns state unchanged |
| `build_perfect_trace(state, parameters)` | `PerfectTrace` or `None` | `None` |
| `force_state_recompute()` | `bool` | `False` |

Keep weights finite, nonnegative, and side-effect free. Use a typed immutable parameter object, sampling randomness once. Requests can be reused across calls; do not keep sampled choices in mutable request-instance fields.

## The latent state: TaskState

`TaskState` contains `attributes`, a memory dictionary, `relations`, `properties`, and `constraints_history`. Its initial relation keys include `object_type`, `type_area`, and `object_area`; these defaults are not a restriction to sorting domains.

`clone()` copies state data and the constraint list; constraint instances in that list are shared. Treat recorded constraints as stable descriptions.

`recompute_from_base(base_state)` keeps current root attributes and memory, restores derived relations/properties from the base, and replays additional non-outdated constraints. Derived mutations not represented in constraints are not automatically preserved.

## Execution order and consumer requirements

Sample parameters → create stages → apply symbolic change → optional replay. A trace describes the same request against its pre-request state. Current GEN additionally materializes completion stages and, when requested, builds canonical TSR checkpoints from perfect traces. That mode requires traces; ordinary `BaseRequest` does not.

`request_tester` implements construction inspection, not all generator transformations or physical validation. Read [tester limits](../../create-scenarios/first-scenario/testing.md).

**Guide:** [first request and definition](../../create-scenarios/procedural-tasks/requests.md).
