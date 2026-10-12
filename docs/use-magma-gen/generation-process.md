---
sidebar_position: 5
title: Configure Data Collection
---

# Configure Data Collection

Start from a working [first run](quickstart/launch-first-generation.md). Adjust
collection settings in `config.yaml`, then launch a new run and inspect its
[graph in the viewer](viewer.md).

## Explore more candidates

Replace the `generate` block with:

```yaml
generate:
  seed: 42
  nb_branch: 2
  nb_env: 1
  nb_max_update: 2
  max_start_per_stage: 5
  randomized: false
```

This requests two candidates per sampled situation and allows more trajectory
starts per stage. Keep one environment until the task and service connections
work reliably. Use a new run name:

```bash
magma-gen run branching_buttons --preset press_button.ButtonPressOrdered \
  --config-path ./config.yaml --no-coaching --no-judge --no-randomized \
  --sequence_of_buttons sw0,sw1 --instruction "Press sw0 then sw1."
```

Select `branching_buttons` in the viewer. Compare the candidates' decisions and
stage outcomes. Multiple candidates can contain the same answer; increasing
`nb_branch` does not guarantee different choices.

## Adjust concurrency and exploration

| Configuration | CLI override | Use it to… |
| --- | --- | --- |
| `generate.nb_branch` | `--nb-branch 2` | Request more candidate decisions per situation |
| `generate.nb_env` | `--nb-env 4` | Run more physical executions concurrently |
| `generate.nb_max_update` | `--nb-max-update 4` | Increase the manager's simultaneous node-update capacity; minimum 2 |
| `generate.max_start_per_stage` | `--max-launch-per-stage 5` | Bound trajectory starts per stage |
| `generate.seed` | `--seed 42` | Seed task creation and vocabulary randomization |
| `generate.randomized` | `--no-randomized` | Disable public vocabulary randomization |

Increase concurrency gradually while watching GPU memory and agent/planner
response times. More environments do not change how many candidates are requested
from one situation. Increase the stage launch limit when alternatives stop
before reaching later stages. Scenario-defined tool-call limits still apply.

For a slow agent, add `--agent-timeout 600` or set `magma_agent_timeout: 600` at
the top level of the configuration. The timeout covers discovery and inference.

## Collect procedural task variations

Use `--definition` once you have a tested task definition:

```bash
magma-gen run button_variations --definition my_buttons.Definition \
  --config-path ./config.yaml --max-total-target-tool-calls 10 \
  --no-coaching --no-judge --no-randomized
```

This command requires the installed definition from [Build Tasks with
Requests](../create-scenarios/procedural-tasks/requests.md). Choose either
`--preset` or `--definition` for each run. The old `--scenarios` option is unavailable.

`--max-total-target-tool-calls` controls the sum of declared stage targets used
to construct one task (default 40). Requests are kept whole; the first request
can exceed that budget. Each sampled request must produce a positive total
target, even if some of its stages have a zero target.

## Enable scenario skills or coaching

Pass registered skill keys with `--skills`, for example `--skills PressPair` for
[the two-button skill](../create-scenarios/execution/create-cycle.md). Install the
provider and register the skill before running the command.

To collect corrected alternatives, [configure coaching](coaching-and-generation.md).
For interventions you write yourself, [switch the viewer to Coach mode](viewer.md#coach-an-active-run).

## Inspect and export

Check the stages reached and the outcomes of the recorded candidates before
[exporting the run](export.md). A finished generation can contain failed or
unfinished branches and can produce an empty dataset.

Read [collection and branching](../concepts/generation.md) for the explanation of
branch state, simulation slots, and outcome classifications.
