---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to export data from MAGMA-GEN

Learn how to convert a generated MAGMA-GEN run into training files.

:::warning
This workflow is still experimental. A complete reference training repository is not wired here yet.
:::

## What export reads

When you run generation, each run folder contains:

- `commander_datas/`
- `memorizer_datas/`
- `config.json`

`config.json` stores the task description, tool schema, export mode, and the source folders that the export step needs.

The export command reads those generated folders and writes new dataset files in the same run folder.

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

## Folder discovery

The exporter recursively searches for folders containing `config.json`.

That means you can point it to:

- one specific run folder
- or a higher-level directory containing multiple runs

:::tip
If you pass a parent directory, every nested run folder containing `config.json` will be processed.
:::

## What export writes

After export, the run folder may contain:

- `commander_data.json`
- `memorizer_data.json`

The exact outputs depend on the builder you selected:

- single-agent builders only write commander data
- dual SFT builders can write both commander and memorizer data

## Common commands

<Tabs>
  <TabItem value="single-sft" label="Single SFT">

```bash
python -m magma_gen.launch_export output/smoke_test SFT
```

This uses the single-agent SFT builder when `--memorizer_mode` stays at its default `none`.

  </TabItem>
  <TabItem value="single-dpo" label="Single DPO">

```bash
python -m magma_gen.launch_export output/smoke_test DPO
```

This uses the single-agent DPO builder when `--memorizer_mode` stays at its default `none`.

  </TabItem>
  <TabItem value="dual-sft" label="Dual SFT">

```bash
python -m magma_gen.launch_export output/dual_run SFT \
  --memorizer_mode base
```

Use a non-`none` memorizer mode to activate the dual builder.

`base` enables memorizer scoring.

  </TabItem>
</Tabs>

## CLI reference

| Argument | Short | Required | Meaning |
| --- | --- | --- | --- |
| `folder_name` | n/a | yes | Folder to scan for generated run folders |
| `export_type` | n/a | yes | Dataset type: `SFT` or `DPO` |
| `--ollama_instances` | `-oi` | no | Export-time worker instances used for scoring |
| `--nb_of_augment` | `-n` | no | Number of randomized data variants generated per selected sample |
| `--commander_mode` | `-cm` | no | Commander scoring mode |
| `--memorizer_mode` | `-mm` | no | Memorizer scoring mode / builder switch |
| `--no_log` | n/a | no | Parsed by CLI, but currently unused in the source |

## How builder selection works

The export entrypoint chooses a builder from `export_type` and `memorizer_mode`.

### `SFT`

- `--memorizer_mode none` → `SFT_SA_Builder`
- `--memorizer_mode base` → `SFT_DUAL_Builder`
- `--memorizer_mode no` → `SFT_DUAL_Builder` without memorizer scoring

### `DPO`

- `--memorizer_mode none` → `DPO_SA_Builder`
- any other memorizer mode → not implemented

:::info
There is an important distinction between `none` and `no`.

- `none` means “use the single-agent builder”
- `no` means “use the dual builder, but skip memorizer scoring”
:::

## What each argument changes

### `--ollama_instances`

This selects the worker instance IDs used during export-time scoring.

Examples:

```bash
--ollama_instances 0
--ollama_instances 0 1 2
```

Use multiple instances if you want to parallelize the scoring/evaluation work done during export.

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

### `--no_log`

This flag is parsed, but it is not currently used in `launch_export.py`.

## How export works internally

At a high level:

1. parse CLI arguments
2. pick a dataset builder
3. recursively find all folders containing `config.json`
4. load each folder's `config.json`
5. traverse the exported graph files referenced by that config
6. score/select good commander trajectories
7. optionally score/select memorizer updates
8. apply augmentation
9. write final JSON dataset files

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
python -m magma_gen.launch_export output/run_a SFT
```

### Export one single-agent run as DPO

```bash
python -m magma_gen.launch_export output/run_a DPO
```

### Export one dual-agent run with memorizer scoring

```bash
python -m magma_gen.launch_export output/run_dual SFT \
  --memorizer_mode base \
  --ollama_instances 0 1
```

### Export every run under `output/`

```bash
python -m magma_gen.launch_export output SFT
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

### `--no_log` is currently ineffective

It exists in the parser, but the source does not use it.

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
- Use `--memorizer_mode base` when you want commander and memorizer data from dual generation.
- Use `--memorizer_mode no` if you want the dual builder path without memorizer scoring.
- Keep `--nb_of_augment` small at first, then scale it once you like the exported format.

