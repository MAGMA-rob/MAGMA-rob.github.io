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

GEN selects completed, execution-finished agent candidates, excluding those diagnosed as faulty. It ranks them using recorded descendant scores and passes eligible candidates near the best score to the exporter. A successful HTTP response alone is insufficient: a run may produce no selected training examples.

The paper's Section 4.4 presents the principle as selecting the best action at a reached state using downstream stage success, without favoring coach-origin actions. The current v2 command uses its recorded descendant scores, weights optimal and non-optimal outcomes, and can retain multiple candidates close to the best score. Treat the [paper](https://openreview.net/pdf?id=r7ZN8cPEcj) as the methodological reference and this page as the behavior of the current export workflow.

The agent exporter determines channels and row formats. Full-history renders commander examples; a multi-model agent may render separate datasets for each component. Raw prompts and internal records remain in graph saves even when they are not columns in the rendered dataset.

A local success is evaluated in the context of recorded descendant outcomes; it does not automatically receive a training row. The current command is not a general export of every failed/successful pair or a DPO-pair builder.

Data is partitioned by task into training and validation sets, keeping related rows from that task together. The output includes a versioned manifest and export failures. `--skip-pre-made` verifies source/settings signatures rather than merely checking that a directory exists.

## Interpret the result

Check output row counts, dataset channels, and failures in the export manifest. An empty or small dataset can result from unsuccessful/incomplete exploration, incompatible producer identity/version, candidates excluded by score selection, or an agent exporter lacking usable internal model records. Use the graph and logs to distinguish these cases before collecting a larger run.

The dataset schema belongs to the selected agent exporter. For example, a single decision model and a system with a summarizer do not necessarily produce the same files. Training those models is a subsequent workflow; export does not update their weights.

## Use your own format

Follow [agent dataset export](../custom-agent/export.md) to implement a local exporter and register its factory. Keep dataset conventions aligned with your model's training template. [Offpolicy generation](offpolicy.md) will document its separate input adapter and preparation workflow.
