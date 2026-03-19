---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MAGMA-GEN Generation CLI

Learn how to launch the generation to adapt MAGMA-GEN to your configuration.

It covers:

- how to launch generation
- config resolution and override precedence
- what each CLI argument changes
- how the main generation parameters affect the runtime
- current source-level limitations that matter when using the CLI

## Entry point

The generation entrypoint is the Python module:

```bash
python -m magma_gen.launch
```

Use module execution, not `python path/to/launch.py`, because `launch.py` uses package-relative imports.

### Basic command shape

The CLI always expects:

1. one positional output folder name
2. one mutually exclusive task selector

The selector must be exactly one of:

- `--preset`
- `--definition`
- `--scenarios`

<Tabs>
  <TabItem value="preset" label="Preset">

```bash
python -m magma_gen.launch demo_run \
  --preset warehouse_sorting.NoManuPreset
```

Use `--preset` when the scenario already defines a concrete `BaseTask`.

The task is instantiated directly with any extra unknown `--key value` arguments.

  </TabItem>
  <TabItem value="definition" label="Definition">

```bash
python -m magma_gen.launch demo_run \
  --definition warehouse_sorting.SimpleSortingDefinition
```

Use `--definition` when the scenario defines a `TaskDefinition`.

The runner loads the definition, builds it, then calls the task generator to sample stages dynamically.

  </TabItem>
  <TabItem value="scenarios" label="Scenarios">

```bash
python -m magma_gen.launch demo_run \
  --scenarios warehouse_sorting
```

This mode is wired in the CLI but the underlying `GenerationScenarioRunner` is still `NotImplemented`.

Treat `--scenarios` as reserved for future use for now.

  </TabItem>
</Tabs>

### Recommended first run

If your package environment is installed and your `config.yaml` is present in the current working directory, a practical first command is:

```bash
python -m magma_gen.launch smoke_test \
  --preset warehouse_sorting.NoManuPreset \
  --mode single \
  --nb_env 8 \
  --nb_branch 2 \
  --no_coaching
```

### Output folder behavior

The positional `folder_name` is always written under:

```text
output/<folder_name>
```

Important:

- if `output/<folder_name>` already exists, the launcher deletes its contents before starting
- deletion is recursive for subdirectories
- there is no confirmation prompt

### Config resolution

`launch.py` resolves the config file in this order:

1. `--config_path`
2. `./config.yaml` in the current working directory
3. package defaults from `magma_core.configs.default_config.yaml`

That means these two commands behave differently:

```bash
python -m magma_gen.launch run_a --preset warehouse_sorting.NoManuPreset
```

This uses `./config.yaml` if it exists.

```bash
python -m magma_gen.launch run_b \
  --preset warehouse_sorting.NoManuPreset \
  --config_path /path/to/custom.yaml
```

This forces the custom file.

The effective config is built like this:

1. load package default config
2. if a user YAML file is found, overlay it
3. apply CLI overrides

In practice:

- CLI wins over YAML
- YAML wins over package defaults

### Important YAML merge caveat

The YAML overlay in `MAGMAConfig.load()` is shallow at the top level.

This means if your custom YAML redefines:

- `generate`
- `benchmark`
- `backends`

you should provide the full subsection, not just one key, otherwise you replace the whole default subsection.

Good:

```yaml
generate:
  mode: dual
  nb_branch: 3
  history_length: 4
  nb_env: 32
  nb_max_update: 8
  max_start_per_stage: 12
  randomized: true
  coaching: true
```

Risky:

```yaml
generate:
  mode: dual
```

With the current loader, the second example replaces the entire `generate` block and can leave required keys missing later.

## CLI reference

### Required positional argument

| Argument | Meaning | Example |
| --- | --- | --- |
| `folder_name` | Name of the run folder created under `output/` | `smoke_test` |

### Task selection arguments

| Argument | Short | Meaning | Notes |
| --- | --- | --- | --- |
| `--preset` | `-p` | Load a concrete task preset | Format: `scenario_name.ClassName` |
| `--definition` | `-d` | Load a `TaskDefinition` and generate the task dynamically | Format: `scenario_name.ClassName` |
| `--scenarios` | `-s` | Intended bulk scenario mode | Currently not implemented by the runner |

### Generation override arguments

| Argument | Short | Config key | Meaning | Effect |
| --- | --- | --- | --- | --- |
| `--config_path` | `-c` | n/a | Use a specific YAML config file | Changes the loaded config source |
| `--nb_branch` | `-n` | `generate.nb_branch` | Number of answers generated per pending situation | Increases branching factor and search width |
| `--history_length` | `-hl` | `generate.history_length` | Max history window length | Mainly relevant in dual mode |
| `--mode` | `-m` | `generate.mode` | `single` or `dual` | Selects single-agent vs dual-agent pipeline |
| `--nb_env` | `-nb` | `generate.nb_env` | Max parallel env windows used for tool execution | Controls env-side parallelism |
| `--no_coaching` | `-nc` | `generate.coaching=false` | Disable coaching | Turns off the coaching manager |
| `--nb_max_update` | `-nmu` | `generate.nb_max_update` | Max number of pending nodes sent to the model at once | Controls model update batch size |
| `--max_launch_per_stage` | `-ns` | intended `generate.max_start_per_stage` | Max trajectory budget per stage | Parsed by CLI, but not currently applied to the override dict |
| `--no_randomized` | `-nr` | `generate.randomized=false` | Disable task randomization | Disables runtime randomizer usage |
| `--backends_instance` | `-bi` | active backend filter | Select backend instance(s) | In practice parser currently accepts one string |
| `--magma_agent_address` | `-mas` | `magma_agent_address` | Override MAGMA agent server address | Changes commander server endpoint |
| `--gui` | n/a | n/a | Open a GUI render | Changes env render mode to human |

## Extra task constructor arguments

Unknown `--key value` pairs are not rejected.

Instead, `launch.py` captures them and passes them to:

- the preset constructor when using `--preset`
- the definition constructor when using `--definition`

Example:

```bash
python -m magma_gen.launch preset_with_args \
  --preset warehouse_sorting.WarehouseSortingSimpPreset1 \
  --difficulty 2
```

That becomes roughly:

```python
Task_class(difficulty=2)
```

### Auto-casting rules for extra args

Extra values go through `auto_cast()`:

- `true` / `false` become booleans
- integers become `int`
- floats become `float`
- comma-separated strings become lists, recursively cast
- everything else stays as `str`

Examples:

```bash
--difficulty 2
--use_flag true
--threshold 0.25
--objects ref_obj_1,ref_obj_2,ref_obj_3
```

## What each generation setting changes internally

### `generate.mode`

`single`:

- uses `SingleAgentManager`
- uses `SingleGraphManager`
- uses `SingleNodeEndManager`

`dual`:

- uses `DualAgentManager`
- uses `DualGraphManager`
- uses `DualNodeEndManager`

This is selected in `GenerationRunner.__init__()`.

### `generate.nb_branch`

This is the main branching factor.

It affects:

- how many commander answers are sampled per pending situation
- how many memorizer candidates are generated in dual mode
- how counters measure per-stage exploration capacity

Increasing it usually gives:

- more diversity
- more env/model work
- faster explosion of the graph

### `generate.history_length`

This is passed to the graph manager as `max_history_length`.

It is intended to cap the size of conversation history sent back to the commander.

The CLI help says it is only for dual mode, and that is the safest way to think about it for now.

### `generate.nb_env`

This controls how many parallel env slots `ToolsGenExecutor` creates.

Higher values can improve throughput when the planner and env can keep up.

Higher values also increase:

- memory usage
- planner concurrency
- env-side pressure

### `generate.nb_max_update`

This is the max number of pending situation nodes that the manager batches into one commander update cycle.

It does not change the branching factor.
It changes the width of each scheduling wave.

### `generate.max_start_per_stage`

This is the per-stage exploration budget consumed by `CounterManager`.

It limits how many trajectories the generator tries to launch for a given stage.

Current source caveat:

- the config key is `max_start_per_stage`
- the CLI flag is `--max_launch_per_stage`
- the CLI parser accepts it
- but `build_generate_override_from_cli()` does not currently forward it

So today, if you want to change this value reliably, do it in YAML.

### `generate.randomized`

If `true`, `ToolsGenExecutor` enables runtime randomization.

This affects:

- task attributes shown to the LLM
- tool schema shown to the LLM
- situations shown to the LLM
- mapping from randomized names back to real runtime calls

The task must define a valid `randomized_config_path` for this to work.

### `generate.coaching`

If `true`, `GenerationRunner` creates a `CoachingManager`.

Coaching is the subsystem that tries to recover or improve:

- non-optimal trajectories
- failed trajectories
- planner-error trajectories

Disabling coaching usually makes generation simpler and cheaper, but you lose corrective branches.

### `magma_agent_address`

This is the HTTP endpoint used by `BaseAgentManager` to talk to the commander server.

It is used for:

- `chat`
- `update_memory` in dual mode
- `get_infos`

### `magma_planner_address`

This is the planner endpoint used by the trajectory converter and tool execution stack.

There is currently no dedicated CLI override for this field in `launch.py`, so change it in YAML.

### `backends`

Backends are used to create the `LMWorker`.

In generation, the runner currently selects the first backend in the active backend dictionary.

So:

- you must define at least one backend
- if you filter with `--backends_instance`, the first remaining backend becomes the active one used by the worker

## Example launch recipes

<Tabs>
  <TabItem value="single-small" label="Small single run">

```bash
python -m magma_gen.launch single_small \
  --preset warehouse_sorting.NoManuPreset \
  --mode single \
  --nb_branch 2 \
  --nb_env 8 \
  --nb_max_update 10 \
  --no_coaching
```

Use this when you want a small debug-friendly run.

  </TabItem>
  <TabItem value="dual-richer" label="Richer dual run">

```bash
python -m magma_gen.launch dual_richer \
  --definition warehouse_sorting.SimpleSortingDefinition \
  --mode dual \
  --nb_branch 3 \
  --history_length 4 \
  --nb_env 16 \
  --nb_max_update 20
```

Use this when you want memory updates and richer branching.

  </TabItem>
  <TabItem value="preset-args" label="Preset with extra args">

```bash
python -m magma_gen.launch preset_args \
  --preset warehouse_sorting.WarehouseSortingSimpPreset1 \
  --difficulty 2
```

This passes `difficulty=2` to the preset constructor.

  </TabItem>
</Tabs>

## How the generation run proceeds

At a high level:

1. CLI args are parsed.
2. The output directory is created or cleared.
3. Config is loaded from package defaults, then YAML, then CLI overrides.
4. A task runner is built.
5. The runner loads:
   - a preset task directly, or
   - a task definition and then generates a task from it.
6. The env executor initializes the task and environments.
7. The graph starts from the initial situation.
8. The commander manager repeatedly:
   - batches pending nodes
   - queries the model
   - executes returned tools
   - verifies completion
   - expands the graph
9. Export writes:
   - `commander_datas/`
   - `memorizer_datas/`
   - `config.json`

## Files generated by a successful run

Inside `output/<folder_name>/`, the runner creates:

- `commander_datas/`
- `memorizer_datas/`
- `config.json`

`config.json` stores the effective task/tool/task-description metadata used for export.

:::tip
To learn how to use these data to train your model, refer to the [next page](export.md).
:::

## Current limitations and source quirks

### `--scenarios` is not usable yet

The CLI accepts it, but `GenerationScenarioRunner` immediately raises `NotImplementedError`.

### `--max_launch_per_stage` is currently ignored by the override builder

The argument is parsed, but `build_generate_override_from_cli()` does not map it to `generate.max_start_per_stage`.

Use YAML for this parameter until the launcher is fixed.

### There is no CLI override for `magma_planner_address`

Change it in YAML.

### `--backends_instance` is effectively single-value today

The override code supports a list, but the parser declares `type=str` without `nargs`.

So in current CLI usage, pass one backend instance name.

### User YAML overlays are shallow at the top level

If you redefine `generate`, `benchmark`, or `backends`, provide the full block.

## Troubleshooting

### Error: no backend specified

Cause:

- your effective config still has `backends: {}`

Fix:

- add at least one backend in YAML

### Error: task preset or definition not found

Cause:

- wrong registry name

Fix:

- use the `scenario_name.ClassName` format registered by `magma_scenarios`

### Error: config path not found

Cause:

- `--config_path` points to a missing file

Fix:

- correct the path or rely on local `./config.yaml`

### Error: launch.py imported directly

Cause:

- using `python magma_gen/launch.py`

Fix:

- run `python -m magma_gen.launch`

## Practical recommendations

- Keep a local `config.yaml` in the working directory and use CLI for only the few values you change often.
- Use `--preset` or `--definition`, not `--scenarios`, for now.
- Start with small values for `nb_env`, `nb_branch`, and `nb_max_update` while debugging.
- If you need to change `max_start_per_stage`, change it in YAML until the CLI override path is fixed.
- If you rely on a custom planner address, set it in YAML because there is no launcher flag for it yet.

