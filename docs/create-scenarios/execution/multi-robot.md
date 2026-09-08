---
sidebar_position: 4
title: Coordinate Robots and Shared Resources
slug: /create-scenarios/multi-robot
---

# Coordinate Robots and Shared Resources

First make each tool work on one robot. Then specify robot identity and how simultaneous calls share resources.

## Robot identity

Configure `InitializationParameters.agent_names` in environment order. The runtime injects `known_robots` and verifies its consistency. In a tool, select the robot with `self.get_agent(obs.selected_robot_name)` instead of assuming the first robot.

## Serialize a shared workspace

For a fixed resource, add `execution_group="shared_tray"` to the decorator. For a call-dependent resource, return `ToolExecution(..., execution_group=target_zone)`.

Calls sharing the group are delayed in call order within that execution batch. Different groups may proceed concurrently. This is not a global lock, and trajectories are not automatically replanned after preceding group members finish.

## Reserve placement locations

Tools in one request share `obs.tool_batch_context`. During preparation:

```python
reserved = obs.tool_batch_context.try_reserve(
    namespace="placement_cells",
    resource=("tray", 0, 0),
    owner=obs.selected_robot_name,
)
```

On failure, choose another cell or return a failed execution. The same owner can reserve the same resource again. Reservations live for the current request, not for the whole episode; use world state to represent persistent occupancy.

The installed `PlacementGrid` utility combines geometric placement choices with these reservations. Consult its API before assuming a grid cell is free just because no object was observed there before the batch started.

## Preserve only intended actor changes

Return `allowed_moving_actors=[object_name]` for an object manipulation if that matches your simulation policy. Every simultaneous call needs an explicit list for the batch protection to remain enabled. Detection tools use `is_detection=True`, which forces an empty list.

This restoration policy is separate from shared-zone scheduling. It does not make a movement physically safe. See [execution concepts](../../concepts/execution.md).

## Validate concurrency

The manual tool CLI accepts one call at a time; it is useful for each robot individually. Use the consuming runtime to verify simultaneous calls, reservations, group delays, and interruption of running skills.
