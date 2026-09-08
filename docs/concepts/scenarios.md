---
sidebar_position: 2
slug: /core-concepts/scenarios
title: Scenarios
---

# Scenarios

A scenario is a reusable application domain: its environments, task constructors, action capabilities, and optional skills. A Python distribution can provide one or several scenarios.

Users create **their own installable package**. `magma_scenarios` provides the manifest, loader, CLI, and reusable scenarios as an installed dependency. Authoring does not require editing its source tree.

## Discovery and names

An installed provider publishes a `ScenarioManifest` through the `magma.scenarios` Python entry-point group. The manifest maps public component names to import references:

- `presets`: classes deriving from `BaseTask`;
- `definitions`: classes deriving from `TaskDefinition`;
- `skills`: optional `BaseSkill` classes;
- `environments`: Gym IDs mapped to modules that register them.

`my_buttons.FirstTask` is a component identifier. `MyButtons-v1` would be an environment identifier. These names serve different purposes.

The source layout is your choice. A `manifest.py`, `envs/`, and `scenarios/` directory are useful conventions, not discovery rules. Python imports and the installed entry points determine discovery.

## Reuse and ownership

You can reuse a provided environment while supplying your own tasks. Later, replace tools or register an environment from your package. Two providers may refer to the same environment ID when they declare the same registration module; conflicting modules are rejected.

Keep the manifest module lightweight: references are strings so listing installed scenarios does not need to construct environments.

**Next:** [Create your own package](../create-scenarios/first-scenario/create-scenarios.md). Exact naming and loading rules: [scenario providers](../reference/scenarios/providers.md).
