---
sidebar_position: 7
title: Create a Cycle Tool
description: Learn how to use `redo` to build one tool that can execute several pick-and-place steps.
---

# Create a Cycle Tool

A cycle tool is still just one MAGMA tool. The difference is that it may need to perform several internal actions before it is really finished.

The standard way to do that is to define a `redo` in the tool by returning `ToolExecution(..., redo=...)`.

## When to use `redo`

Use `redo` when one tool call may need to:

- sort several objects one after another
- retry with a new sub-trajectory after checking the result
- stop only when there is nothing left to do
- be robust to planning errors

## The pattern

The cycle tool has three parts:

1. validate the request and collect the objects that still need work
2. define a `verifier(new_obs)` that checks whether the cycle is complete (as all tools)
3. define a `redo(new_obs)` that builds the next sub-trajectory if the cycle is not finished yet

```python title="Exemple of cycle tool"
def launch_cycle(self, obs : Observation, env_id : int, params: Dict) -> ToolExecution:
    obj_to_sort, assignment = [], {}
    task_attributes = obs.task_attributes

    def verifier(new_obs: Dict) -> ToolResult:
        for obj_name in obj_to_sort:
            if torch.norm(
                new_obs["extra"][obj_name][env_id][:2] - new_obs["extra"][assignment[obj_name]][env_id][:2]
                ) > 0.1:
                return ToolResult(False, f"A {obj_name} cube is still unsorted.")

        s = ', '.join(f'{obj} to {ass}' for obj, ass in assignment.items())
        return ToolResult(True, f"All objects has been sorted : {s}",logs=Log(""))

    ...

    for obj_name, target in assignment.items():
        if torch.norm(obs.maniskill_obs["extra"][obj_name][env_id][:2] - obs.maniskill_obs["extra"][target][env_id][:2]) > 0.1:
            obj_to_sort.append(obj_name)

    if not obj_to_sort:
        return ToolExecution([],verifier=verifier,reason=f"All objects has already been sorted.")

    cpt, cpt_max = 0, len(obj_to_sort) + 2

    def redo(new_obs: Dict) -> List[sapien.Pose]:
        nonlocal cpt
        cpt +=1
        if cpt > cpt_max:
            return []
        
        for obj_name in obj_to_sort: 
            obj_pose = new_obs["extra"][obj_name][env_id]
            if torch.norm(obj_pose[:2] - new_obs["extra"][assignment[obj_name]][env_id][:2]) < 0.1:
                continue

            poses = compute_grasp_trajectory(self.get_agent(),obj_pose.cpu().numpy())
            box_pose = new_obs[assignment[obj_name]][env_id].cpu().numpy()
            box_pose[2] += 0.25
            poses += [sapien.Pose(p=box_pose[:3],q=[0,1,0,0]), "OPEN"]
            return poses
        return []
    p = redo(obs.maniskill_obs)
    return ToolExecution(poses=p,verifier=verifier,redo=redo)
```

In this exemple, we compute the `obj_to_sort` from the original observation. In redo we iterate over the element from this list. Like in `verifier`, `redo` take a new_obs which correspond to a raw observation dict like `obs.maniskill_obs`.

:::danger
**IMPORTANT:** Always use new_obs in `redo` and `verifier` to get the real updated env information. Because the call to `redo` and `verifier` cames after the execution of the different trajectories.
:::

## What MAGMA does with it

- MAGMA executes the current `poses`
- then it calls `verifier(...)`
- if `ToolResult.ok == False` and `redo` returns a non-empty trajectory, MAGMA executes the new trajectory
- the tool ends only when `verifier(...)` returns success, or `redo(...)` stops producing new poses



## Two important distinctions

- `ToolExecution(poses=[], ...)` means the tool could not even start
- `redo(...) -> []` means the cycle has no more sub-trajectory to propose

So `[]` inside `redo` means "stop iterating", while `[]` in the initial `ToolExecution` means "preparation error".

:::tip
Keep the cycle logic high-level. Let `redo(...)` decide the next object to handle, and let `verifier(...)` decide whether the whole cycle is done.
:::

## More details
- [When to use `redo`](../deep-dive/create-tools.md#when-to-use-redo)
- [Iterative tool with `redo`](../deep-dive/create-tools.md#three-useful-tool-styles)
