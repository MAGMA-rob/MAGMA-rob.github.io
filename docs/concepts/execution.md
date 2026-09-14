---
sidebar_position: 8
title: Execution and Concurrency
---

# Execution and Concurrency

Three kinds of parallelism are independent: multiple robots in one scene, multiple simulated environments, and multiple models inside an agent system.

## Selecting robots

`InitializationParameters.agent_names` supplies public robot names. Their order must match the environment's robot order. With the default `['default']`, initialization resolves the actual names. `Observation.selected_robot_name` identifies the robot for a tool call; use it with `get_agent` in multi-robot tools.

## Shared resources

`execution_group` groups trajectories that must run sequentially within one execution batch. The converter inserts delays in call order for tools sharing the group. It does not provide a global lock across episodes or replan trajectories after each preceding tool finishes.

`ToolBatchContext` supports reservations while tools in the same request are prepared, such as reserving different placement cells. Reservations and trajectory groups solve different problems: choosing distinct resources and ordering their use.

## Preserving unrelated actors

`ToolExecution.allowed_moving_actors` declares which actor changes an executor may preserve. In the current GEN executors, other actors are restored from the saved source state after tool execution.

- `None`: no explicit protection.
- `[]`: no actor may retain changes.
- A list of actor names: those actors may retain changes.

For multiple calls, allowlists are combined; any `None` disables batch protection. `is_detection=True` forces the tool allowlist to `[]`.

This mechanism restores actor state; it does not guarantee collision-free motion. It applies to compatible `actors` state entries, not all articulations or arbitrary world data. Invalid names or incompatible layouts cause the executors to skip protection with a warning.

**Next:** [Coordinate robots](../create-scenarios/execution/multi-robot.md). Exact fields: [tool reference](../reference/scenarios/create-tools.md).
