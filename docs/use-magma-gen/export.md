---
sidebar_position: 6
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
Today, the export is setup to export only positive exemple. However, negative exemples can also be used to train with preference objective or train a reward model. This is not yet supported.
:::

## Export a full-history run

Install the compatible `full-history-agent` package in the export environment, then run:

```bash
magma-gen export output/my_run --agent full-history-agent
```

The source can be one run or a parent directory. The command recursively reads compatible graphs found through `config.json`, checks producer identity/version against the exporter, and writes to `<source>/datasets`. It skips unreadable graphs with a message and reports incompatible producer versions. No compatible graph is an error.

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
