---
sidebar_position: 1
title: Create an Environment
description: Simple guide to creating MAGMA environments with DefaultEnv and DefaultMultiAgentEnv.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create an Environment

This page explains the MAGMA way to create environments. It documents how to implement a MAGMA-compatible environment, expose structured observations, and connect the environment to tools and tasks.

:::info
This page complements the main [Create your custom scenario in 5 minutes](../create-scenarios.md) tutorial.
If you want the full end-to-end authoring flow, start there and come back here when you want more detail on the environment step.
:::

For the conceptual explanation, see [Environments](../../../core-concepts/envs.md).

We recommend to define MAGMA environments under `magma_scenarios.envs` rather than in the scenario package. This allows easier registration and reuse between scenarios. It usually inherit from one of these two classes:

- `DefaultEnv` for single-agent environments
- `DefaultMultiAgentEnv` for multi-agent environments

## What MAGMA adds on top of ManiSkill

`DefaultEnv` already gives you a useful base:

- it inherits from ManiSkill's `BaseEnv`
- it sets a default simulation config
- it provides default camera configs
- it exposes simple helper builders like `build_a_zone(...)` and `create_box(...)`
- it keeps track of robot names from `robot_uids`
- it provides safe default implementations for `evaluate()`, `_get_obs_extra()`, and reward functions

`DefaultMultiAgentEnv` stays very small. In the current codebase, it mainly inherits everything from `DefaultEnv` and only overrides the simulation config to allocate more GPU memory for multi-agent scenes.

:::tip
In MAGMA, task logic must lives in tasks, stages, and tools. Keep the environment simple: load the scene, randomize resets, and expose stable observation keys. No rewards or termination.
:::

## Which base class should you choose?

| Use case | Base class |
| --- | --- |
| One robot, tabletop setup, simple object manipulation | `DefaultEnv` |
| Several robots in the same scene | `DefaultMultiAgentEnv` |

In practice:

- single-agent envs usually pass `robot_uids="panda"` or `robot_uids="fetch"`
- multi-agent envs usually pass a tuple like `robot_uids=("panda", "panda")`

## The minimal structure

At a minimum, a MAGMA environment usually has:

1. a `@register_env(...)` decorator
2. a class inheriting from `DefaultEnv` or `DefaultMultiAgentEnv`
3. an `__init__` that forwards `robot_uids` and `robot_init_qpos_noise`
4. `_load_agent(...)` if you need custom robot spawn poses
5. `_load_scene(...)` to build the table, objects, zones, and containers
6. `_initialize_episode(...)` to reset and randomize poses
7. `_get_obs_extra(...)` to expose task-specific keys used later by MAGMA tools and tasks

## Minimal example

```python
from typing import Dict

import sapien
import torch

from mani_skill.utils.registration import register_env
from mani_skill.utils.structs import Pose
from mani_skill.utils.scene_builder.table import TableSceneBuilder
from mani_skill.utils.building import actors

from magma_core.base.envs import DefaultEnv


@register_env("MyEnv-v1", max_episode_steps=200)
class MyEnv(DefaultEnv):
    cube_half_size = 0.02

    def __init__(self, *args, robot_uids="panda", **kwargs):
        super().__init__(
            *args,
            robot_uids=robot_uids,
            robot_init_qpos_noise=0.0,
            **kwargs,
        )

    def _load_agent(self, options: Dict, initial_agent_poses=sapien.Pose(p=[0, 0, 0])):
        return super()._load_agent(options, initial_agent_poses)

    def _load_scene(self, options: dict):
        self.table_scene = TableSceneBuilder(
            env=self,
            robot_init_qpos_noise=self.robot_init_qpos_noise,
        )
        self.table_scene.build()

        self.cube = actors.build_cube(
            self.scene,
            half_size=self.cube_half_size,
            name="cube",
            body_type="dynamic",
            initial_pose=sapien.Pose(p=[0, 0, self.cube_half_size]),
        )
        self.target = self.build_a_zone(name="target_zone")

    def _initialize_episode(self, env_idx: torch.Tensor, options: dict):
        with torch.device(self.device):
            b = len(env_idx)
            self.table_scene.initialize(env_idx)

            xyz = torch.zeros((b, 3))
            xyz[:, 2] = self.cube_half_size
            self.cube.set_pose(Pose.create_from_pq(p=xyz, q=[1, 0, 0, 0]))

    def _get_obs_extra(self, info: Dict):
        return {
            "agent_tcp": self.agent.tcp.pose.raw_pose,
            "cube": self.cube.pose.raw_pose,
            "target_zone": self.target.pose.raw_pose,
        }
```

## What each method is for

### `__init__`

Use `__init__` to declare which robot setup the environment supports and to forward MAGMA-specific defaults:

- `robot_uids`
- `robot_init_qpos_noise`

For a single-agent env, `robot_uids` is usually a string.

For a multi-agent env, `robot_uids` is usually a tuple.

### `_load_agent(...)`

Override `_load_agent(...)` when you need explicit robot spawn poses.

This is especially useful:

- to avoid collisions at scene creation
- to place two robots on opposite sides of the table

Single-agent example:

```python
def _load_agent(self, options, initial_agent_poses=sapien.Pose(p=[0, 0, 0])):
    return super()._load_agent(options, initial_agent_poses)
```

Multi-agent example:

```python
def _load_agent(self, options: dict, initial_agent_poses=None):
    super()._load_agent(
        options,
        [sapien.Pose(p=[0, -1, 0]), sapien.Pose(p=[0, 1, 0])],
    )
```

### `_load_scene(...)`

`_load_scene(...)` is where you build the static content of the environment:

- table scene
- cubes or objects
- target zones
- kinematic boxes or containers

This method runs during scene construction, not at every reset.

Common MAGMA patterns:

- use `TableSceneBuilder` for tabletop tasks
- use `actors.build_cube(...)` for simple dynamic objects
- use `self.build_a_zone(...)` for visual or collision zones
- use `self.create_box(...)` for container-like actors

### `_initialize_episode(...)`

`_initialize_episode(...)` is where you reset and randomize object poses.

This method runs on `env.reset(...)`, and it must be written in batched style because ManiSkill can reset several environments at once.

In practice:

- use `with torch.device(self.device):`
- use `b = len(env_idx)`
- reset scene builders with `self.table_scene.initialize(env_idx)`
- generate batched positions with `torch`
- set poses with ManiSkill `Pose.create_from_pq(...)`

:::note
In MAGMA, most environments follow the same split:

- `_load_scene(...)` creates the objects once
- `_initialize_episode(...)` changes their state at reset time
:::

### `_get_obs_extra(...)`

This is the most important MAGMA-specific method after scene creation.

Its job is to expose stable names that the rest of MAGMA will use later in:

- tools
- tasks
- stage logic

For example:

```python
def _get_obs_extra(self, info: dict):
    return {
        "agent_tcp": self.agent.tcp.pose.raw_pose,
        "cube": self.cube.pose.raw_pose,
        "target_zone": self.target.pose.raw_pose,
    }
```

If your tools expect `"area1"` or `"left_arm_tcp"`, make sure `_get_obs_extra(...)` publishes exactly those keys.

:::warning
Keep naming stable across your env, tools, and task attributes. In MAGMA, many downstream components rely on string keys like `"agent_tcp"`, `"obj_A"`, or `"area1"`.
:::

## Single-agent vs multi-agent

<Tabs>
<TabItem value="single" label="Single agent">

Use `DefaultEnv`.

- `robot_uids` is usually a string
- `self.agent` refers to the robot directly
- `_get_obs_extra(...)` often exposes one TCP key such as `agent_tcp`

Example from the codebase:
- `WarehouseSortingEnv`

</TabItem>
<TabItem value="multi" label="Multi-agent">

Use `DefaultMultiAgentEnv`.

- `robot_uids` is usually a tuple
- `_load_agent(...)` usually receives a list of initial poses
- `self.agent.agents[i]` gives access to each robot
- `_get_obs_extra(...)` often exposes one TCP key per robot

Example from the codebase:
- `BiRobotSorting`

</TabItem>
</Tabs>

## Registration and discovery

MAGMA relies on ManiSkill environment registration:

```python
@register_env("MyEnv-v1", max_episode_steps=200)
```

This follows the same idea as Gymnasium registration: once the module is imported, the environment can be created by ID.

In this repository, `magma_scenarios.envs.__init__.py` automatically imports all env subpackages. That means importing `magma_scenarios.envs` is enough to trigger the registration side effects.

Typical usage:

```python
import gymnasium as gym
import magma_scenarios.envs

env = gym.make("SortingCubesWarehouse-v1", num_envs=1)
```

## Recommended MAGMA pattern

For MAGMA specifically, the simplest pattern is:

1. start from `DefaultEnv` or `DefaultMultiAgentEnv`
2. use `TableSceneBuilder` if your scene is tabletop-based
3. keep `_load_scene(...)` focused on building objects
4. keep `_initialize_episode(...)` focused on reset/randomization
5. expose only the keys you really need in `_get_obs_extra(...)`
6. let tasks, stages, and tools hold most of the task logic

This keeps the environment easy to debug and avoids mixing simulation code with planner-oriented logic.

## Where to look for deeper details

This page only documents the MAGMA layer. For lower-level design details, use the official docs:

- [ManiSkill: Introduction to Task Building](https://maniskill.readthedocs.io/en/latest/user_guide/tutorials/custom_tasks/intro.html)
- [ManiSkill: Loading Actors and Articulations](https://maniskill.readthedocs.io/en/latest/user_guide/tutorials/custom_tasks/loading_objects.html)
- [SAPIEN: Create Actors](https://sapien-sim.github.io/docs/user_guide/getting_started/create_actors.html)
- [Gymnasium: Create a Custom Environment](https://gymnasium.farama.org/main/introduction/create_custom_env/)

## Summary

To create a MAGMA environment:

1. choose `DefaultEnv` or `DefaultMultiAgentEnv`
2. register the class with `@register_env(...)`
3. build the scene in `_load_scene(...)`
4. randomize resets in `_initialize_episode(...)`
5. expose stable observation keys in `_get_obs_extra(...)`

If you follow that pattern, the environment stays small, while the rest of MAGMA can build tasks, tools, and planners on top of it cleanly.
