---
sidebar_position: 5
title: Inspect Runs in the Viewer
---

# Inspect Runs in the Viewer

The graph viewer helps you understand which decisions were explored, where trajectories stopped, and what followed a coaching intervention. It reads live generation events or saved v2 graphs. It is an inspection interface, separate from the simulator window, the human coaching interface, and dataset export.

## Open the viewer

With the viewer dependencies and bundled frontend assets installed:

```bash
magma-gen viewer --output-dir output
```

Open `http://127.0.0.1:8900`. The optional dependencies are available through `magma_gen[gui]`. The PyPI release includes compiled frontend assets; no Node.js or frontend build is needed.

The viewer scans run directories beneath `--output-dir`. Start it before generation for live observation. GEN attempts to connect to `http://127.0.0.1:8900` at run startup, and the run's resolved path must be inside the viewer's output directory. Keep both processes pointed at the same local output tree.

A different port can be selected with `--port`; set `MAGMA_VIEWER_URL` in the generation process to the matching URL. The viewer binds to the loopback interface. The generation command's `--gui` opens the simulation GUI; it does not start this graph viewer.

## Follow a live run or inspect a saved one

Select a run from the dropdown; the filter matches scenario, target, and run name. **Actualiser** refreshes the run catalog and **Recentrer** fits the graph to the viewport. Pan and zoom to follow alternative continuations. The current interface uses French labels.

![Generation graph displayed in the viewer, including coached branches](/docs/viewer_screen.png)

The viewer accepts one live generation at a time. Another run cannot take over that live slot, but completed runs remain available for inspection. If the viewer is absent, refuses a connection, or loses events, GEN disables visualization and continues collecting. Starting the viewer after the run began does not attach it retroactively to that live event stream; inspect the saved run afterward.

| Run status | Interpretation |
| --- | --- |
| Running | Live updates are being received |
| Finished | The graph save was marked complete; this is not a claim that every task branch succeeded |
| Interrupted | The live connection expired; generation may still be continuing without visualization |
| Incomplete | A discovered disk save is not marked complete |
| Unsupported | The saved graph schema is not supported by this viewer |

Offline inspection requires compatible graph files, not exported training rows. A `datasets/` directory alone is not a generation graph. Refresh after a run finishes to discover the saved result.

## Read nodes and stages together

Click a node to inspect its instruction, decision output, other input fields (including memory and tools), errors, and coaching information. When the agent recorded internal calls, expand their full prompts, structured inputs, and raw completions. The panel shows only recorded information; it cannot reconstruct omitted model diagnostics.

Node statuses distinguish ongoing, finished, optimal, suboptimal, failed, invalid, and unassessed decisions where present. A node marked finished can simply have completed execution; inspect its stage and continuation before concluding the task succeeded. A `coached` badge marks a candidate originating from coaching. It does not establish that the intervention worked.

Click a stage in the stage bar to read its objective, action/text type, request type when recorded, and target/maximum tool-call budget. Interpret efficiency labels against those declared targets, not as a universal measure of plan quality.

## Understand a failure or correction

Follow the branch up to the failure and inspect the input the agent actually received. Compare its decision and raw output with the available tools and stage objective. Then inspect the coached alternative, its source/attempt information, and subsequent node outcomes.

This separates a malformed response, a valid but unsuccessful action, a completed local stage, and a successful longer continuation. For the diagnostic explanation and coaching dialogue, read the run's `_coaching_logs/` files alongside the graph. Detailed execution and score records are also available in the saved graph; not every stored field has a dedicated viewer panel.

The viewer helps explain the collected experience. The [exporter](export.md) applies its own selection rules, so a visible node, a green outcome, or a coached badge does not by itself mean a row will appear in the training dataset.
