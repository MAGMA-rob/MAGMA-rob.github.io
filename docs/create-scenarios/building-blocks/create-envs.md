---
sidebar_position: 3
slug: /use-magma-gen/tutorials/building-blocks/create-envs
title: Create an Environment
---

# Create an Environment

Create environments in your provider package when an installed environment no longer fits your scenario. The first task can reuse an existing environment; environment authoring is a separate step.

## A minimal scene

Create `src/my_magma_scenarios/envs/__init__.py` and this module:

```python title="src/my_magma_scenarios/envs/cube.py"
import torch
from mani_skill.utils.building import actors
from mani_skill.utils.registration import register_env
from mani_skill.utils.scene_builder.table import TableSceneBuilder
from mani_skill.utils.structs import Pose
from magma_core.simulation.envs import DefaultEnv


@register_env("MyCube-v1", max_episode_steps=100)
class CubeEnv(DefaultEnv):
    def __init__(self, *args, robot_uids="panda", **kwargs):
        super().__init__(
            *args, robot_uids=robot_uids, robot_init_qpos_noise=0.0, **kwargs
        )

    def _load_scene(self, options: dict) -> None:
        self.table = TableSceneBuilder(self, robot_init_qpos_noise=0.0)
        self.table.build()
        self.cube = actors.build_cube(
            self.scene, half_size=0.02, color=[0.2, 0.4, 0.8, 1], name="cube"
        )
        self.target = self.build_a_zone(width=0.1, length=0.1, name="target")

    def _initialize_episode(self, env_idx: torch.Tensor, options: dict) -> None:
        with torch.device(self.device):
            self.table.initialize(env_idx)
            xyz = torch.zeros((len(env_idx), 3))
            xyz[:, 0] = -0.1
            xyz[:, 2] = 0.02
            self.cube.set_pose(Pose.create_from_pq(p=xyz))
            target_xyz = torch.zeros((len(env_idx), 3))
            target_xyz[:, 1] = 0.2
            self.target.set_pose(Pose.create_from_pq(p=target_xyz))

    def _get_obs_extra(self, info: dict) -> dict:
        return {
            "agent_tcp": self.agent.tcp.pose.raw_pose,
            "cube": self.cube.pose.raw_pose,
            "target": self.target.pose.raw_pose,
        }
```

This module declares a scene, not a complete task. Its observation contract contains batched pose tensors under the three named keys. A task for this scene would use `At("cube", "target")` and tools able to manipulate the cube; button tools are not compatible.

## Declare discovery

Add to your manifest's `environments` mapping:

```python
environments = {"MyCube-v1": "my_magma_scenarios.envs.cube"}
```

Set your cube task's `maniskill_env_id = "MyCube-v1"`. The loader imports the environment module when loading a component from the scenario. `list` and `show` inspect declarations without constructing the scene.

You do not need to modify `magma_scenarios/envs/__init__.py`. For direct Gym use outside the MAGMA loader, import your registration module or call `register_environment("MyCube-v1")` before `gym.make`.

## Preserve more than poses

If you add machine states or counters, implement the [extra-state hooks](../execution/env-transitions.md). Pose-only state is already handled by the simulator. Keep tensor batch dimensions compatible with restoring individual environment slots.

## Assets and configuration

Store assets and YAML in your own package and include them as package data:

```toml title="Additional pyproject.toml section"
[tool.setuptools.package-data]
my_magma_scenarios = ["assets/**/*", "scenarios/**/*.yaml"]
```

Use module-relative paths or package resources, not paths into a cloned MAGMA repository.

**Next:** [Environment transitions](../execution/env-transitions.md). [Environments](../../concepts/envs.md) explains ownership and resets.
