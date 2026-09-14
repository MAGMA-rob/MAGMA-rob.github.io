---
pagination_next: create-scenarios/first-scenario/generate
pagination_prev: create-scenarios/first-scenario/create-scenarios
sidebar_position: 2
title: Test Your Scenario
slug: /create-scenarios/testing
---

# Test Your Scenario

If you followed [the first tutorial](create-scenarios.md), you have a **preset**: a task whose stages are already assembled. Follow **Check discovery** and **Test tools in simulation** below. That is enough to check the physical button example. Then continue to [Generate Data from Your Scenario](generate.md).

The later **Test request construction** section is a separate workflow. A **request** constructs one or more stages from sampled parameters; a **definition** groups requests to create varied tasks. Read [Build Tasks with Requests](../procedural-tasks/requests.md) before using that test. You do not need requests to test a preset.

Neither tester is a complete evaluation of an agent. See [verification mechanisms](create-scenarios.md#choose-what-counts-as-success) for the distinction between physical goals, logs, and textual answers.

## Check discovery

From your provider directory, after changing entry points:

```bash
python -m pip install -e .
magma-scenarios list
magma-scenarios show my_buttons
```

If the scenario is missing, check the installed Python environment, the `magma.scenarios` entry point, and the manifest ID. If a component cannot load, check its full `module:Class` reference and its base class. Restart long-running Python processes after changing providers because discovery is cached.

## Test tools in simulation

```bash
magma-scenarios test-tools my_buttons.FirstTask --nb-env 1 --button sw0
```

This loads a **preset**, opens the simulation viewer, and accepts manual tool calls:

```text
press_button(id="sw0")
panda.press_button(id="sw0")
reset
EXIT
```

Use named arguments. Positional arguments and `**kwargs` are not accepted. An unqualified call uses `panda`; use the task's actual robot name for other robots. One command is applied to each selected environment.

`--nb-env` (also `--nb_env`, `-n`) defaults to two; start with one. `--randomized` (`-r`) enables vocabulary randomization. Unknown CLI options are passed as constructor arguments to the preset, not interpreted as executor configuration.

The test reads `./config.yaml` when present, otherwise the MAGMA default config. The current CLI does not expose a config-path option. Configure `magma_planner_address` for physical tools and `benchmark.sim_backend` for the simulation backend. No LLM backend is required. The GUI and dependencies needed by your selected environment must be available.

Inspect:

- `RETURN STATUS`: tool result or failure;
- `REWARD`: per-environment stage verification (`1`, `0`, `-1`), not a learned reward;
- `NEXT STAGE`: progression;
- `FINISHED TASK`: completion of the tester's action path.

### What the tool tester does not validate

The current tester skips text-only stages. It does not validate answers, coaching, or a custom agent's reasoning. Its CLI accepts individual tool calls, not a full simultaneous multi-robot skill workflow.

<details>
<summary>Advanced limits: state updates and execution accounting</summary>

It applies explicit `state_updates`, but does not reproduce the actor-restoration protection of GEN. The shared result context applies attribute-edit logs to its own attribute copy, but this tester does not synchronize that copy back into the attributes used for the next manual call. Do not use it to certify persistence of an edit across calls. The tester also does not reproduce full budget accounting. Check those behaviors in the consuming runtime before treating the scenario as validated.

</details>

## Test request construction

**Prerequisite:** an installed definition such as `my_buttons.Definition` from [the request tutorial](../procedural-tasks/requests.md). The first package tutorial registers only `my_buttons.FirstTask`; these commands apply after you add the definition. [Requests and Constraints](../../concepts/requests.md) explains its symbolic construction state.

```bash
magma-scenarios test-requests my_buttons.Definition trace --count 2 --seed 0
magma-scenarios test-requests my_buttons.Definition mass --count 100 --max-stages 15 --seed 0
```

`trace` prints eligible weights, the chosen request, instructions, goals, and stage settings. `mass` prints a coverage/error summary. An error produces exit code one; successful construction produces zero. All weights becoming zero ends a chain normally, so a successful summary can still describe empty or short chains: inspect counts.

`--setup REQUEST` can be repeated to prepare symbolic state. It accepts an index, exact class name, or unambiguous substring from `active_requests`. Setup-produced stages are discarded.

In the current implementation, setup is executed once before the task loop and its result becomes the base for all sampled tasks. The generation seed is applied after setup; it does not seed random choices made during setup or definition initialization. Do not claim whole-run reproducibility from `--seed` alone when those steps use randomness.

The stage cap preserves request atomicity: a request that would exceed it is not included. A separate guard limits each task to 100 sampled requests, including requests producing no stages.

### What request testing does not validate

The tester calls `sample_parameters`, `create_stages`, and `apply_request`, with optional state replay. It does not execute the simulation, materialize completion-answer stages, or perform all runtime stage validation. The mode name `trace` means a construction trace. The current GEN generator also requires an exact `target_tool_calls` on every generated stage; this tester does not enforce that requirement.

It deep-copies requests before execution, whereas a consumer may reuse request instances. Keep sampled data in the parameter object rather than mutable request fields.

## Recommended development loop

Inspect discovery, validate the preset's action path, inspect a few request chains, and then run a larger construction sample. Finally [run your scenario with GEN](generate.md) to inspect responses, interruptions, errors, and state restoration during agent execution.
