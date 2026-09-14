---
sidebar_position: 10
slug: /core-concepts/envs
title: Environments
---

# Environments

An environment owns the scene, robots, observations, and restorable world state. Tasks can reuse one environment with different tools, instructions, and success criteria.

The simulation classes documented here use ManiSkill. `DefaultEnv` supplies MAGMA integration, while your subclass defines scene loading, episode initialization, and extra observations. `DefaultMultiAgentEnv` supports the multi-robot path; it is an additional implementation choice, not a requirement for a first scenario.

## Initialization and transitions

`InitializationParameters.env_options` supplies episode-reset options. A stage's `entry_transition` can modify selected environment slots before that stage starts. `reset_at_end` restores the task's reference environment state at a stage boundary. Use a reset only when the next interaction should not preserve the preceding physical changes.

## Restorable state

Simulation snapshots must also preserve non-physics state that affects future behavior: machine modes, dirt flags, counters, or occupancy. `get_magma_extra_state` and `set_magma_extra_state` integrate such data with `DefaultEnv.get_state_dict` and `set_state_dict` under `magma_extra_state`.

## Observations

Expose the data tools and goals need through `_get_obs_extra`. Document names, shapes, and meanings. Some existing scenarios expose pose tensors directly; others use structured entries. These are scenario contracts, not interchangeable global formats.

Keep environment batches independent. A tool targets one `env_id`; goals verify a batch; transitions receive selected `env_ids`.

**Next:** [Create an environment](../create-scenarios/building-blocks/create-envs.md) or [add transitions and extra state](../create-scenarios/execution/env-transitions.md).
