---
sidebar_position: 1
title: Scenario Providers
---

# Scenario Providers

Import `ScenarioManifest` from `magma_scenarios.manifest`.

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `str` | Scenario ID; nonempty, trimmed, without dots |
| `presets` | mapping of strings | Public local name → full `module:Class` for a `BaseTask` subclass |
| `definitions` | mapping of strings | Public local name → full `module:Class` for a `TaskDefinition` subclass |
| `skills` | mapping of strings | Public local name → full `module:Class` for a `BaseSkill` subclass |
| `environments` | mapping of strings | Gym environment ID → module registering that ID |

Mappings default to empty and are copied into read-only mappings. Component local names cannot contain dots. Register the manifest instance through `[project.entry-points."magma.scenarios"]`; the entry-point name must equal `id`.

## Loading

Public helpers are exported by `magma_scenarios`:

- `list_scenarios()` returns installed scenario IDs.
- `get_scenario(id)` returns its manifest.
- `load_preset("scenario.Component")` returns the class, not an instance.
- `load_definition("scenario.Component")` returns the class.
- `load_skills("scenario.Component", names)` returns skill classes; `['all']` selects all manifest skills.
- `register_environment(env_id)` imports its declared module and verifies Gym registration.

Loading a component registers all environments declared in that scenario's manifest before importing the class. Listing and showing manifests do not register environments.

Duplicate scenario providers are rejected. The same environment ID may be declared by several manifests only when its registration module agrees. Discovery is cached per process.

## Packaging

Install your provider after adding or changing entry points. Include YAML/assets as package data. Keep manifest imports lightweight and all component modules importable from an installed distribution. The old `SCENARIO_NAME` / `TASK_PRESETS` / `TASK_DEFINITIONS` authoring dictionaries are replaced by the manifest.

**Guide:** [create a provider](../../create-scenarios/first-scenario/create-scenarios.md).
