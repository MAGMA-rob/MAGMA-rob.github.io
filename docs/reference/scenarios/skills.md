---
sidebar_position: 6
title: Skill Contract
---

# Skill Contract

Import `BaseSkill`, `SkillSpec`, `SkillTick`, `CallTick`, and `MessTick` from `magma_core.simulation.skills`.

A concrete skill declares a class-level `spec: SkillSpec` containing `name`, `description`, `required_tools`, and `argument_schema`. The base validates that concrete subclasses declare a spec.

The constructor receives the invocation's argument dictionary. Each invocation has its own instance. Implement:

- `start() -> SkillTick`: first action or terminal message;
- `tick(status: RobotToolStatus) -> SkillTick`: process a completed tool result.

`CallTick(tool_name, arguments)` requests an underlying tool. `MessTick(message, result, error_flag)` ends the skill with an outcome. `RobotToolStatus` supplies robot name, message, result, and error flag.

Declare skill classes in your provider manifest's `skills` mapping. The consuming runtime decides which registered skills to load and expose. `MonoToolSkill` adapts a single tool into this execution model; most scenario authors need only `BaseSkill`.

The manager retains running skill state and can capture a pending tick during interruption. Cancellation is separate from receiving a new instruction. Skill runtime state should not be confused with a task's `TaskState` or world snapshot.

**Guide:** [compose a skill](../../create-scenarios/execution/create-cycle.md).
