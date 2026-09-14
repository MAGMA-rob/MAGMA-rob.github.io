---
pagination_next: null
sidebar_position: 4
slug: /use-magma-gen/running-generation/export
title: Export Generated Data
---

# Export Generated Data

Export converts selected candidates from recorded GEN graphs into training datasets using an installed agent exporter. It runs locally; the agent HTTP server and its inference models do not need to be running.

## From explored graph to training examples

Generation saves the interaction graph before dataset export. Use the [viewer](viewer.md) to inspect ordinary decisions, failed branches, and [counterfactual continuations](coaching-and-generation.md#counterfactual-re-execution). Export then selects from that evidence and asks the matching agent package to render model-specific examples.

```text
Saved graph → candidate selection using recorded outcomes
            → agent exporter → training / validation datasets
```

Export does not rerun the simulator or validate an untested repair. A coached candidate is eligible according to its recorded outcomes, not simply because a coach proposed it. Failure records remain useful for diagnosis even when they are not selected as positive training targets.

:::info
The current exporter selects positive training examples. Exporting negative examples for preference training or reward modeling is not yet supported.
:::

## Export a full-history run

Install the compatible `full-history-agent` package in the export environment, then run:

```bash
magma-gen export output/first_run --agent full-history-agent
```

The source can be one run or a parent directory. The command recursively reads compatible graphs found through `config.json`, checks producer identity/version against the exporter, and writes to `<source>/datasets`. It skips unreadable graphs with a message and reports incompatible producer versions. No compatible graph is an error.

## Inspect the exported files

For the first-run example, the full-history exporter writes:

```text
output/first_run/datasets/
├── hr_data.json
├── hr_data_train.json
├── hr_data_validation.json
├── export_manifest.json
└── export_failures.json
```

`hr_data.json` contains all rendered examples. The two split files contain the training and validation subsets. The manifest records row counts, settings, task partitions, and file signatures. `export_failures.json` lists export errors; an empty list means no errors were recorded.

From your workspace, inspect the counts and one example:

```python
import json
from pathlib import Path

folder = Path("output/first_run/datasets")
manifest = json.loads((folder / "export_manifest.json").read_text())
rows = json.loads((folder / "hr_data_train.json").read_text())
print("Rows by component:", manifest["rows"])
print("Export failures:", json.loads((folder / "export_failures.json").read_text()))
if rows:
    print("Instruction:", rows[0]["instruction"])
    print("Decision:", json.loads(rows[0]["output"]))
else:
    print("No training examples were selected. Inspect the run's outcomes.")
```

A simplified button example has this format. This illustrates the schema; your model's output will vary:

```json
{
  "persistent_rules": "[]",
  "attributes": "{\"objects\": [\"sw0\"], \"known_robots\": [\"panda\"]}",
  "tools": "[{\"name\": \"press_button\", \"description\": \"Press a button.\", \"arguments\": {\"id\": {\"description\": \"Button name.\", \"type\": \"str\"}}}]",
  "history": "[]",
  "instruction": "Please press sw0.",
  "instruction_role": "USER",
  "output": "{\"say\": \"\", \"action\": {\"panda\": {\"name\": \"press_button\", \"arguments\": {\"id\": \"sw0\"}}}}"
}
```

The `tools`, `persistent_rules`, `attributes`, `history`, and `output` fields contain JSON **strings** inside each row. Decode them with `json.loads` when inspecting them or preparing a different training format. `instruction_role` distinguishes user instructions from environment feedback.

With only one task, all examples go to the training split and the validation file is empty. Collect several tasks to obtain a separate validation set. Empty data files can also mean that no candidates passed selection or that the agent recorded no usable internal model calls. Inspect the manifest, failures, and graph together.

Use the training split with a training pipeline that supports these fields and your model's prompt format. MAGMA-GEN does not start training automatically.

## Options

| Option | Meaning |
| --- | --- |
| `--agent NAME` | Required local entry point in `magma.export.gen` |
| `--options FILE` | JSON object of exporter-specific settings |
| `--validation-ratio FLOAT` | Validation fraction, default 0.05 |
| `--split-seed INT` | Task partition seed, default 42 |
| `--skip-pre-made` | Reuse a completed export when its verified signature matches |

The full-history exporter currently accepts no private options. The command uses saved input/candidate records; it does not require a coaching-backend configuration or an SFT/DPO positional argument.

## What becomes a row?

GEN selects completed, execution-finished agent candidates, excluding those diagnosed as faulty. It ranks them using recorded descendant scores and passes eligible candidates near the best score to the exporter.

The paper's Section 4.4 presents the principle as selecting the best action at a reached state using downstream stage success, without favoring coach-origin actions. The current v2 command uses its recorded descendant scores, weights optimal and non-optimal outcomes, and can retain multiple candidates close to the best score.

The agent exporter determines channels and row formats. Full-history renders commander examples; a multi-model agent may render separate datasets for each component. Raw prompts and internal records remain in graph saves even when they are not columns in the rendered dataset.

Data is partitioned by task into training and validation sets, keeping related rows from that task together. The output includes a versioned manifest and export failures. `--skip-pre-made` verifies source/settings signatures rather than merely checking that a directory exists.

## Use your own format

Follow [agent dataset export](../custom-agent/export.md) to implement a local exporter and register its factory. Keep dataset conventions aligned with your model's training template.

## Continue from your first dataset

You have completed the first generation workflow. To collect data for your application, [run your own scenario](../create-scenarios/first-scenario/generate.md) or [connect your model](../custom-agent/connect.md). To understand how examples are collected, read [collection and branching](generation-process.md) and [coaching](coaching-and-generation.md).
