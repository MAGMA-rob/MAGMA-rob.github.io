---
sidebar_position: 1
title: Create your custom scenario in 5 minutes
description: Fastest end-to-end tutorial to create a tiny MAGMA scenario with one env, one tool, one stage, and one preset.
---

# Create your custom scenario in 5 minutes

This page shows the smallest useful MAGMA scenario:

- one environment with one cube and one target area
- one tool that sorts the cube into that area
- one stage that checks whether the cube is inside the area
- one preset that exposes the stage

:::tip
This is the main end-to-end authoring tutorial for custom MAGMA scenarios.
If you want more detail on one step, use the companion pages in [Scenario Building Blocks](./building-blocks/create-envs.md).
:::

At the end, you will be able to launch:

```bash
python -m magma_gen.launch smoke_simple_sort \
  --preset amazing_scenario.SimpleSortingPreset \
  --mode single \
  --nb_env 4 \
  --nb_branch 2 \
  -nr
```
:::info
This tutorial intentionally skips **task definitions and advanced patterns**. For more details, refer to **Deep-Dive** and others **tutorials**.
:::
## Final file tree

Create these files:

```text
magma_scenarios/
├── envs/
│   | ...
    └── amazing_scenario/
        ├── __init__.py
│       └── simple_sorting_env.py
└── scenarios/
    └── amazing_scenario/
        ├── __init__.py
        ├── tools.py
        ├── stages.py
        └── preset.py
```

## 1. Create the scenario registry

Create `magma_scenarios/scenarios/amazing_scenario/__init__.py`:

```python title="magma_scenarios/scenarios/amazing_scenario/__init__.py"
SCENARIO_NAME = "amazing_scenario"

TASK_DEFINITIONS = {}

TASK_PRESETS = {
    "SimpleSortingPreset": "preset:SimpleSortingPreset",
}
```

## 2. Create the environment

Create `magma_scenarios/envs/simple_sorting_env.py`:

```python title="magma_scenarios/envs/simple_sorting_env.py"
from typing import Dict

import sapien
import torch
import numpy as np

from mani_skill.utils.building import actors
from mani_skill.utils.registration import register_env
from mani_skill.utils.scene_builder.table import TableSceneBuilder
from mani_skill.utils.structs import Pose

from magma_core.base.envs import DefaultEnv

# MAGMA env relies on maniskill frameworks. 
# DefaultEnv offers a default implementation. For most of your scenario you will only need to define:
# _load_scene() | _initialize_episode() | _get_obs_extra()
@register_env("SimpleSortingEnv-v1", max_episode_steps=100)
class SimpleSortingEnv(DefaultEnv):
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

    # Load the different objects into the scene
    def _load_scene(self, options: dict):
        self.table_scene = TableSceneBuilder(
            env=self,
            robot_init_qpos_noise=self.robot_init_qpos_noise,
        )
        self.table_scene.build()

        self.cubes = [
            actors.build_cube(
                self.scene,
                half_size=self.cube_half_size,
                name="cube1",
                body_type="dynamic",
                color=np.array([12, 42, 160, 255]) / 255,
                initial_pose=sapien.Pose(p=[-0.1, 0, self.cube_half_size]),
            ),
            actors.build_cube(
                self.scene,
                half_size=self.cube_half_size,
                name="cube2",
                body_type="dynamic",
                color=np.array([12, 42, 160, 255]) / 255,
                initial_pose=sapien.Pose(p=[0.1, 0, self.cube_half_size]),
            ),
        ]

        self.target_zone = self.build_a_zone(name="target_zone",width=0.1,length=0.1)

    # Initialize objects pose
    def _initialize_episode(self, env_idx: torch.Tensor, options: dict):
        pos = [-0.1, 0.1]
        with torch.device(self.device):
            b = len(env_idx)
            self.table_scene.initialize(env_idx)

            xyz = torch.zeros((b, 3))
            xyz[:, 2] = self.cube_half_size
            for i, p in enumerate(pos):
                xyz[:, 0] = p
                self.cubes[i].set_pose(Pose.create_from_pq(p=xyz, q=[1, 0, 0, 0]))

            xyz = torch.zeros((b, 3))
            xyz[:,1] = 0.2
            self.target_zone.set_pose(Pose.create_from_pq(p=xyz, q=[1, 0, 0, 0]))

    # Expose to MAGMA framework some information
    def _get_obs_extra(self, info: Dict):
        return {
            "agent_tcp": self.agent.tcp.pose.raw_pose,
            "cube1": self.cubes[0].pose.raw_pose,
            "cube2": self.cubes[1].pose.raw_pose,
            "target_zone": self.target_zone.pose.raw_pose,
        }
```

Also make sure the env module is imported by `magma_scenarios/envs/__init__.py`:

```python title="magma_scenarios/envs/__init__.py"
from .simple_sorting_env import *
```

> If you want more details on the process of env creation, refer to [How to create an Environment](./building-blocks/create-envs.md)

:::note
This tutorial uses `build_a_zone(...)` because it is the simplest target representation.
If you want a real container instead of a flat target area, replace it with your usual `create_box(...)` helper and show its size and pose arguments.
:::

## 3. Create the tool

Let's create an API with two tools: one for taking and one for depose. The take tool will take one *string* parameters to let the agent specify *which object it wants to take*.

A MAGMA tool is:
- a method inside a subclass of `BaseToolsAPI`
- exposed with `@register_tool(...)`
- called with `obs`, `env_id`, and `params`
- expected to return a `ToolExecution`

At the end of the execution, MAGMA calls your `verifier(...)`, which must return a `ToolResult`.

Create `magma_scenarios/scenarios/amazing_scenario/tools.py`:

```python title="magma_scenarios/scenarios/amazing_scenario/tools.py"
from magma_core.base.tools import BaseToolsAPI, register_tool
from magma_core.base.data_structures import ToolExecution, ToolResult, Observation
# Import common utils
from magma_core.utils.env_utils import is_object_inside_target
from magma_core.utils.gripper_utils import is_object_in_gripper, find_object_in_gripper

# Import some utils that compute the trajectory
from magma_scenarios.utils import compute_grasp_trajectory, compute_drop_trajectory

from typing import Dict, List

class SimpleSortingTools(BaseToolsAPI):

    @register_tool(
            description="Take an object from the environment.",
            params_spec={
                "obj": {"description": "The name of the object to take in the gripper.", "type": str},
            }
    )
    def take_obj(self, obs : Observation, env_id, params : Dict) -> ToolExecution:
        poses = []
        name_obj = None
        r = ""

        name_obj = params.get("obj", None)

        for obj_name, obj_pos in obs.maniskill_obs["extra"].items():
            if name_obj in obj_name:
                poses = compute_grasp_trajectory(self.get_agent(),obj_pos[env_id].cpu().numpy())
                break
        if not poses:
            r=f"No objects names corresponding to {name_obj}. You must pass the name of the object to take."

        # define verifier inline
        def verifier(new_obs: Dict) -> ToolResult:
            # e.g. check if gripper is holding the right object
            reason=f"No object with {name_obj} name was found. You must pass the name of the object to take."
            ok = False
            for obj_name, obj_pos in new_obs["extra"].items():
                if name_obj in obj_name:
                    ok = is_object_in_gripper(new_obs["extra"]["agent_tcp"][env_id], obj_pos[env_id])   
                    if ok:
                        reason = f"You have a {name_obj} object in your gripper"
                        break
                    else:
                        reason = f"Failed to grasp the {name_obj} object. You can retry."
            return ToolResult(ok, reason)
        return ToolExecution(poses=poses, verifier=verifier, reason=r)
    
    @register_tool(
            description="Put the held object in the target area",
            params_spec={}
    )
    def depose(self, obs : Observation, env_id : int, params: Dict) -> ToolExecution:
        obj_in_gripper = None
        poses = []
        r = ""
        area_name = "target_zone"

        def verifier(new_obs: Dict) -> ToolResult:
            # Check if the object is no longer in the gripper and is now in the area
            obj_pose = new_obs["extra"][obj_in_gripper][env_id]
            if is_object_in_gripper(new_obs["extra"]["agent_tcp"][env_id], obj_pose):
                return ToolResult(False, reason=f"The object is still in the gripper")
            if not is_object_inside_target(obj_pose, new_obs["extra"][area_name][env_id], keep_tensor=False):
                return ToolResult(False, reason=f"The object is not in the box and not in the gripper")
            return ToolResult(True, reason=f"Successfully depose {obj_in_gripper} in {area_name}")
        
        reduced_obs = {k: v[env_id][:3] for k, v in obs.maniskill_obs["extra"].items()}
        agent_tcp_pos = reduced_obs.pop("agent_tcp", None)
        obj_in_gripper = find_object_in_gripper(
            agent_tcp_pos,
            reduced_obs
        )

        if obj_in_gripper is None:
            r = f"There is no object currently in the gripper. You must pick one first."
        else:
            if not area_name in obs.maniskill_obs["extra"]:
                r = f"Unknown area {area_name}. Please use only known area."
            else:
                poses = compute_drop_trajectory(self.get_agent(), drop_pose=obs.maniskill_obs["extra"][area_name][env_id].cpu().numpy(),
                                                drop_seuil=0.3, approach_seuil=0.2)

        return ToolExecution(poses=poses, verifier=verifier, reason=r)
```

:::info
If you want more details on the tool step, check [Create a Tool (Lightweight)](./building-blocks/create-tools-light.md), [Tool Concept](../../core-concepts/tools.md), or [Tool DeepDive](../deep-dive/create-tools.md)
:::

## 4. Create the stage

A stage is an objective, not an action.
- tools describe what the robot can do
- stages describe what must be true before the task can move on

Create `magma_scenarios/scenarios/amazing_scenario/stages.py`:

```python title="magma_scenarios/scenarios/amazing_scenario/stages.py"
from magma_core.base.data_structures import Situation, UserInstruction
from magma_core.base.goals import At
from magma_core.base.stage import BaseTaskStage


class PutCubeInTarget(BaseTaskStage):
    target_steps = 2
    acceptance_steps = 1

    def __init__(self, obj_name : str):
        super().__init__(
            goals=[At(obj_name, "target_zone")],
            reset_at_end=True,
            stage_goal_description="Put the desired cube into the target area.",
        )

        self.situation = Situation(
            memory=["You are controlling a robot on a tabletop sorting task."],
            preserved_memory_indices=[0],
            attributes={
                "objects": ["cube1","cube2"],
                "target_areas": ["target_zone"],
            },
            instruction=UserInstruction(f"Please put {obj_name} in the target area."),
            flag_answer_to_user=True,
        )
```

:::info
If you want more details on the stage step, check [Create a Stage (Lightweight)](./building-blocks/create-stages-light.md), [Stage Concept](../../core-concepts/tasks.md#what-a-stage-is), or [Stage DeepDive](../deep-dive/create-stages.md)
:::

## 5. Create the preset

Create `magma_scenarios/scenarios/amazing_scenario/preset.py`:

```python title="magma_scenarios/scenarios/amazing_scenario/preset.py"
from magma_core.base.tasks import BaseTask

from .stages import PutCubeInTarget
from .tools import SimpleSortingTools


class SimpleSortingPreset(BaseTask):
    name = "Simple Sorting Preset"
    env_id = "SimpleSortingEnv-v1" # Name of the env we created

    Tools_cls = SimpleSortingTools #ref to the Tool API we just created

    styles = []
    approximal_difficulty = "Easy"

    all_task_attributes = {
        "objects": ["cube1","cube2"],
        "target_areas": ["target_zone"],
    }

    def __init__(self):
        super().__init__()
        self.stages = [
            PutCubeInTarget("cube1"), # Add the Stage we created
        ]
```

:::info
To learn more on the preset step, check [Create a Task Preset (Lightweight)](./building-blocks/create-tasks-light.md) or [Deep Dive Tasks](../deep-dive/create-tasks.md)
:::

## 6. Test it

You can test and visualize your task with:

```bash
python3 -m magma_scenarios.tool_tester amazing_scenario.SimpleSortingPreset
```

## 7. Run it

Once the files are in place and your MAGMA package is available, run:

```bash
python -m magma_gen.launch smoke_simple_sort \
  --preset amazing_scenario.SimpleSortingPreset \
  --mode single \
  --nb_env 4 \
  --nb_branch 2 \
  --no_coaching \
  -nr
```
At the end of the run you will have an `output/smoke_simple_sort` folder with generation data inside `commander_datas/`.

If you want to convert that run into training files, continue with [How to export data from MAGMA-GEN](../running-generation/export.md).
