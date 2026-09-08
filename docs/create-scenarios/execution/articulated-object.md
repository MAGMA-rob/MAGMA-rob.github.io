---
sidebar_position: 5
slug: /use-magma-gen/tutorials/articulated-object
title: Use Articulated Objects
---

# Use Articulated Objects

An articulated object exposes more than a rigid actor pose: tools and goals may need joint positions, limits, and machine state. Define that observation contract in your own environment module.

A practical progression is to inspect the installed button environment, whose observation entries include button state, then add a dedicated tool and goal for your mechanism. The [button tutorial](../first-scenario/create-scenarios.md) reuses this contract without rebuilding its articulation.

When creating your own mechanism:

1. Load and initialize its articulation in the environment.
2. Expose the needed joint or machine state in `_get_obs_extra`.
3. Define a tool trajectory and verify the actual post-execution state.
4. Define a stage goal using the same observation schema.
5. Check snapshot restoration, including extra state not owned by physics.

`allowed_moving_actors` protects compatible entries in the saved `actors` mapping; do not assume it protects articulation joints. Use correct trajectories, goals, and state restoration for your mechanism.

See [environments](../building-blocks/create-envs.md) and [transitions](env-transitions.md).
