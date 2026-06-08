---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to export data from MAGMA-GEN

Learn how to convert a generated MAGMA-GEN run into training files.

## What export reads

The export step uses two different sources of information:

- the generated run folder, which contains `config.json`, `commander_datas/`, and optionally `memorizer_datas/`
- a MAGMA config file, which defines the available backends used at export time for scoring and selection

This is an important change from the previous workflow: backend workers are no longer created from old instance IDs. They are now created from the active backend configs loaded through `MAGMAConfig`.

## Entry point

Use the Python module:

```bash
python -m magma_gen.launch_export
```

Use module execution, not `python path/to/launch_export.py`.

## Basic command

```bash
python -m magma_gen.launch_export <folder_name> <export_type>
```

Arguments:

- `folder_name`: generation output folder, or a parent folder containing several generation runs
- `export_type`: `SFT` or `DPO`

Example:

```bash
python -m magma_gen.launch_export output/smoke_test SFT
```

The exporter recursively searches for folders containing `config.json`.

That means you can point it to:
- one specific run folder
- or a higher-level directory containing multiple runs

:::tip
If you pass a parent directory, every nested run folder containing `config.json` will be processed.
:::

## Config loading

At launch time, the exporter loads a `MAGMAConfig` with the following precedence:

1. `--config_path / -c`
2. `./config.yaml`
3. the package default config

The generated run's `config.json` is still used to locate the exported graph files and task metadata, but it does not define the runtime backends for export.

## Active backends

Export-time workers are created from the active backends in the loaded config.

Internally, the builder now creates workers like this:

```python
worker = LMWorker(config.backends[k])
```

That means:

- you must have at least one backend defined in your config
- the selected backend names must exist in the config file
- one worker is created per active backend

You can restrict which configured backends are used with `--backends_instance`.

Examples:

```bash
python -m magma_gen.launch_export output/run_a SFT \
  -c config.yaml \
  -bi local_ollama
```

```bash
python -m magma_gen.launch_export output/run_a SFT \
  -c config.yaml \
  -bi local_ollama remote_vllm
```

```bash
python -m magma_gen.launch_export output/run_a SFT \
  -c config.yaml \
  -bi local_ollama,remote_vllm
```

## What export writes

After export, the run folder may contain:

- `commander_data.json`
- `memorizer_data.json`
- `stats.json`

The exact outputs depend on the builder you selected:

- single-agent SFT writes commander data and export statistics
- single-agent DPO writes commander data
- dual SFT builders can write both commander and memorizer data

## Common commands

<Tabs>
  <TabItem value="single-sft" label="Single SFT">

```bash
python -m magma_gen.launch_export output/smoke_test SFT \
  -c config.yaml \
  -bi local_ollama
```

This uses the single-agent SFT builder when `--memorizer_mode` stays at its default `none`.

  </TabItem>
  <TabItem value="single-dpo" label="Single DPO">

```bash
python -m magma_gen.launch_export output/smoke_test DPO \
  -c config.yaml \
  -bi local_ollama
```

This uses the single-agent DPO builder when `--memorizer_mode` stays at its default `none`.

  </TabItem>
  <TabItem value="dual-sft" label="Dual SFT">

```bash
python -m magma_gen.launch_export output/dual_run SFT \
  -c config.yaml \
  -bi local_ollama remote_ollama \
  --memorizer_mode base
```

Use a non-`none` memorizer mode to activate the dual builder.

`base` enables memorizer scoring.

Current generation note: `magma_gen.launch` rejects `mode: dual` today, so this recipe is mainly for legacy dual run folders or folders produced by a branch/tooling path that still emits dual data.

  </TabItem>
</Tabs>

## CLI reference

| Argument | Short | Required | Meaning |
| --- | --- | --- | --- |
| `folder_name` | n/a | yes | Folder to scan for generated run folders |
| `export_type` | n/a | yes | Dataset type: `SFT` or `DPO` |
| `--config_path` | `-c` | no | Config file used to load runtime backends |
| `--backends_instance` | `-bi` | no | Names of active backends to keep from the loaded config |
| `--nb_of_augment` | `-n` | no | Number of randomized data variants generated per selected sample |
| `--commander_mode` | `-cm` | no | Commander scoring mode |
| `--memorizer_mode` | `-mm` | no | Memorizer scoring mode / builder switch |
| `--skip_pre_made` | n/a | no | Skip run folders that already contain an export marker |
| `--force_export_coached_answers` | n/a | no | For single-agent SFT, force valid coached answers into the export |
| `--skip_coached_answers` | n/a | no | For single-agent SFT, exclude coached answers from the export |
| `--only_first_child` | n/a | no | For single-agent SFT baseline export, follow only the first child path |

## How builder selection works

The export entrypoint chooses a builder from `export_type` and `memorizer_mode`.

### `SFT`

- `--memorizer_mode none` -> `SFT_SA_Builder`
- `--memorizer_mode base` -> `SFT_DUAL_Builder`
- `--memorizer_mode no` -> `SFT_DUAL_Builder` without memorizer scoring

### `DPO`

- `--memorizer_mode none` -> `DPO_SA_Builder`
- any other memorizer mode -> not implemented

:::info
There is an important distinction between `none` and `no`.

- `none` means "use the single-agent builder"
- `no` means "use the dual builder, but skip memorizer scoring"
:::

## What each argument changes

### `--config_path`

This selects which MAGMA config file is used to resolve the export-time backends.

Use it when:

- your backends are not defined in `./config.yaml`
- you want to export with a dedicated config
- you need to switch between backend setups

### `--backends_instance`

This filters the loaded backend map and keeps only the selected backend names as active.

Accepted forms:

- `-bi backend_a`
- `-bi backend_a backend_b`
- `-bi backend_a,backend_b`

Use multiple backends if you want multiple export workers running in parallel.

### `--nb_of_augment`

This controls how many randomized variants are created for each kept sample.

Typical randomizations include:

- tool order shuffling
- attribute order shuffling
- robot-name replacement
- memory shuffling for memorizer export

Recommended values in the source help are between `1` and `5`.

### `--commander_mode`

Current supported value:

- `lazy`

`per_constraint` is declared in the builder base but not implemented yet.

### `--memorizer_mode`

Current effective values:

- `none`
- `base`
- `no`

Use:

- `none` for single-agent export
- `base` for dual export with memorizer scoring
- `no` for dual export without memorizer scoring

### `--skip_pre_made`

This skips folders that already contain `commander_data.json`.

Use it when you point export at a parent folder and only want to process runs that have not already been exported.

### `--force_export_coached_answers` and `--skip_coached_answers`

These two flags only affect the single-agent SFT builder.

- `--force_export_coached_answers` keeps valid coached answers in the export even when they would normally only be ranked by score.
- `--skip_coached_answers` removes coached answers from the export.

They are mutually exclusive; the parser raises an error if you pass both.

The dash-case aliases are also accepted:

- `--force-export-coached-answers`
- `--skip-coached-answers`
- `--no-coached-answers`

### `--only_first_child`

This flag only applies to the single-agent SFT builder.

It follows only the first answer of each step and stops the trajectory when that first-child path fails. It is useful for baseline exports where you want a simple deterministic path through the generated graph.

The dash-case alias `--only-first-child` is also accepted.

## How export works internally

At a high level:

1. parse CLI arguments
2. recursively find folders containing `config.json`
3. optionally skip folders that already contain pre-made export data
4. discard incomplete folders that do not contain the required source graph files
5. load `MAGMAConfig`
6. optionally filter active backends with `--backends_instance`
7. build one export worker per active backend
8. load each folder's `config.json`
9. traverse the exported graph files referenced by that config
10. score/select good commander trajectories
11. optionally score/select memorizer updates
12. apply augmentation
13. write final JSON dataset files

## Input data model

The export step does not re-run generation.

It uses the saved graph artifacts produced by the generation step:

- commander nodes
- memorizer nodes
- task description
- tool schema
- source export mode

That is why `config.json` is the anchor file for export discovery.

## Output data model

### Commander export

Commander samples are formatted as training rows built from:

- query
- memory or short memory
- attributes
- tool schema
- selected answer

The exact shape depends on the builder:

- SFT exports `answers`
- DPO exports `chosen` and `rejected`

### Memorizer export

Memorizer samples are formatted from:

- memory
- preserved memory indices
- commander reasoning
- selected memorizer output

The memorizer output is serialized into the `ADD ...` / `REMOVE ...` textual format.

## Practical recipes

### Export one single-agent run as SFT

```bash
python -m magma_gen.launch_export output/run_a SFT \
  -c config.yaml \
  -bi local_ollama
```

### Export one single-agent run as DPO

```bash
python -m magma_gen.launch_export output/run_a DPO \
  -c config.yaml \
  -bi local_ollama
```

### Export one dual-agent run with memorizer scoring

Use this only for an existing dual run folder. The current generation launcher does not create new dual runs.

```bash
python -m magma_gen.launch_export output/run_dual SFT \
  -c config.yaml \
  -bi local_ollama remote_ollama \
  --memorizer_mode base
```

### Export every run under `output/`

```bash
python -m magma_gen.launch_export output SFT \
  -c config.yaml \
  -bi local_ollama
```

### Export only runs without a previous export

```bash
python -m magma_gen.launch_export output SFT \
  -c config.yaml \
  -bi local_ollama \
  --skip_pre_made
```

## Current limitations

:::warning
The following source quirks matter today.
:::

### Dual DPO export is not implemented

If you choose:

- `export_type=DPO`
- and a memorizer mode other than `none`

the launcher raises `NotImplementedError`.

### `none` and `no` do not mean the same thing

This is easy to miss:

- `none` selects the single-agent builder
- `no` selects the dual builder with memorizer scoring disabled

If you export a dual-generation run with `--memorizer_mode none`, the single-agent builder will be selected and will reject the folder.

### At least one active backend is required

If the loaded config contains no backend, or if `--backends_instance` filters them all out, export fails before processing folders.

### Coached-answer flags are mutually exclusive

`--force_export_coached_answers` and `--skip_coached_answers` cannot be passed together.

### Some flags are single-agent SFT only

`--force_export_coached_answers`, `--skip_coached_answers`, and `--only_first_child` are used by the single-agent SFT builder.

## Troubleshooting

### Error: folder does not exist

Cause:

- `folder_name` points to a missing path

Fix:

- pass the real run folder or parent directory

### Error: no folders with required files found

Cause:

- the exporter did not find any nested folder containing `config.json`

Fix:

- point the command at a generation run folder, not only at `commander_datas/` or `memorizer_datas/`

### Error: no active backend specified

Cause:

- your loaded config has no backend definitions
- or `--backends_instance` removed every backend

Fix:

- pass a valid config with backends
- check the backend names passed to `-bi`

### Error: reading a dual folder with a single-agent builder

Cause:

- you exported a dual run with `--memorizer_mode none`

Fix:

- use `--memorizer_mode base` or `--memorizer_mode no`

### Error: DPO with dual memorizer mode

Cause:

- dual DPO export is not implemented

Fix:

- export as `SFT` for dual runs for now

## Recommended usage

- Use `SFT` first, especially for dual-agent runs.
- Use `--config_path` explicitly in scripts and automation.
- Use `--memorizer_mode base` when you want commander and memorizer data from dual generation.
- Use `--memorizer_mode no` if you want the dual builder path without memorizer scoring.
- Keep `--nb_of_augment` small at first, then scale it once you like the exported format.
- Use `-bi` to keep export focused on the backend instances you actually want to score with.
