---
sidebar_position: 3
title: View and Coach Runs
---

# View and Coach Runs

Use the viewer to browse a generation graph, inspect agent decisions, and
submit human corrections while a run is active.

## Start the viewer

From the workspace used to launch generation, with the MAGMA environment active:

```bash
cd ~/magma-workspace
magma-gen viewer --output-dir ./output
```

Open **http://127.0.0.1:8900**. Install `magma_gen[gui]` if the command reports
missing dependencies. The packaged release includes the frontend; Node.js is
only needed when building it from source.

For live updates and coaching, start the viewer **before** generation. Launch
GEN from the same workspace so its `output/<run-name>` is inside the viewer's
output directory. Follow [the launch guide](quickstart/launch-first-generation.md)
to start the planner, agent, and generation process.

The viewer opens the graph in your browser. Add `--gui` to the generation command
if you also want the separate simulation window.

### Use another port

Start the viewer with:

```bash
magma-gen viewer --output-dir ./output --port 8901
```

Then, in the generation terminal, before launching the run:

```bash
export MAGMA_VIEWER_URL=http://127.0.0.1:8901
```

Open that address in your browser. The viewer listens on the local loopback
interface; the viewer and generator need access to the same output tree.

## Browse a live run

1. Select your run in the dropdown. Use the filter to search by scenario, target,
   or run name.
2. Click **Recentrer** to fit the graph to the viewport. Pan and zoom to follow
   branches.
3. Click a node to open its details. Read **Instruction** and **Output** to compare
   the received input with the proposed decision.
4. Expand **Autres éléments d’entrée**, **Erreur**, and **Coaching** as needed.
   For agents that record internal calls, expand **Requête envoyée** and
   **Réponse brute** to inspect prompts and raw completions.
5. Click a stage in the stage bar to see its objective and target/maximum tool-call
   budget. Check the outcome and subsequent nodes to see how far the branch went.

The interface currently uses French labels.

Use the node label to choose what to inspect:

| Node label | Check |
| --- | --- |
| En cours | Wait for execution and follow new nodes |
| Fini | Inspect the stage and subsequent outcomes |
| Optimal / Sous-optimal | Compare execution against the stage's declared target |
| Échec / Réponse invalide | Read the error and the decision that produced it |
| Non évalué | Inspect completion separately; no efficiency target was available |

![Generation graph displayed in the viewer, including coached branches](/docs/viewer_screen.png)

The viewer follows one live generation at a time. Saved runs remain available
in the dropdown. If the viewer connection fails, GEN continues collecting
without live visualization. Starting the viewer after generation began does
not attach it to that run's live stream; open the saved graph afterward.

## Open a saved run

Point `--output-dir` at the directory containing your run folders, then click
**Actualiser** and select the run. You can inspect completed runs without
starting the agent or planner. Keep the original graph files, including
`config.json` and the situation/node files; exported `datasets/` files alone
cannot be opened as a generation graph.

| Run status | What to do |
| --- | --- |
| Running | Follow the live graph or enter Coach mode |
| Finished | Inspect the saved decisions and outcomes |
| Interrupted | Check the generator terminal; the viewer connection expired |
| Incomplete | Check the generator logs; partial saves cannot be opened offline |
| Unsupported | Read the compatibility reason and use a compatible reader or generate a new run |

Offline viewing requires a complete graph save (`export_complete: true`).
Incomplete runs can appear in the list, but their saved graph cannot be opened.

A saved graph must come from the same major GEN version and a producer no newer
than the installed reader. Older saves containing `schema_version` are refused;
there is no automatic conversion. Generate a new run for those files. Use the
same updated Python installation for GEN and its viewer.

## Coach an active run

### Prepare a run with coaching enabled

Complete [backend configuration](quickstart/configuration.md#add-a-language-model-backend-later)
and [enable coaching](coaching-and-generation.md#enable-coaching). Coach mode
currently requires **full-history-agent** with correction reinjection support;
its Llama adapter does not support this operation.

Start the viewer before generation and remove **both** `--no-coaching` and
`--no-judge` from the generation command. A backend is required by the current
coaching configuration, even though your manual correction does not call the
coaching LLM. Automatic coaching may run alongside your interventions.

### Enter Coach mode and select a decision

1. While generation is active, click **Passer en Coach**. Wait for confirmation.
   The viewer selects the live run and locks the run dropdown.
2. Select an agent node containing tool calls **after its execution has returned**.
   The stage can still be ongoing; you do not need to wait for its final outcome.
3. Click **Créer une alternative** at the top of the node panel.

Only one browser tab can own Coach mode. Keep that tab open and connected while
you work. Coach mode keeps the run alive while you inspect it; it does not pause
ongoing execution. A finished run can be inspected but cannot be reopened for
coaching. Invalid responses, text-only decisions, and internal execution nodes
are unavailable as correction starting points.

### Write and submit the alternative

Choose **Appels d’outils** to replace the action:

1. Select the **Robot** and **Outil** from the available choices.
2. Fill the displayed arguments. Enter strings as plain text, numbers as numbers,
   and lists/objects as valid JSON, such as `["sw0", "sw1"]`.
3. Use **Ajouter un appel** or **Retirer** if the decision needs a different
   number of calls. All calls must use available robots and tools.

Alternatively, choose **Message (say)** and write a nonempty answer. Submit
one type of decision at a time: a message or tool calls.

Fill **Raison du diagnostic** and **Décision attendue**; both are required. For
example, when the agent pressed the wrong button, explain which button the
instruction requested and describe the correct press. Select `press_button`
and enter that button's name in `id`.

Click **Réinjecter la correction**. Wait for **Correction acceptée, création de
l’alternative…**, then **Alternative créée : nœud …**. If submission fails, read
the displayed error, correct the form, and retry.

### Inspect the result and leave Coach mode

Find the new branch in the graph and follow its outcomes. Click **Revenir au
Viewer** to return to the inspection panels and read **Coaching** for the human
source and diagnosis. The original branch remains available for comparison.

Returning to Viewer restores normal run termination. Already accepted
corrections continue after you leave. If the tab loses its connection for
20 seconds, Coach presence expires and normal termination resumes. Stage
exploration limits still apply and can stop an alternative before the last stage.

To understand saved-state replay and validation, read [coaching
concepts](../concepts/coaching.md#human-corrections-in-the-viewer). To select
training examples from the resulting graph, [export the run](export.md).

## Troubleshoot the viewer

| Problem | Check |
| --- | --- |
| No runs listed | Correct `--output-dir`; original graph files present; click **Actualiser** |
| No live updates | Viewer started before GEN; matching output path and `MAGMA_VIEWER_URL` |
| Coach button disabled | Run still active; coaching enabled; neither disabling flag passed; supported full-history adapter; no other tab owns Coach mode |
| No **Créer une alternative** button | Agent tool decision selected; execution returned; response valid; no correction already pending for that node |
| Correction accepted but run did not complete the task | Inspect the new node, later outcomes, and stage budgets; acceptance is followed by execution checks |
| Frontend assets missing | Install the packaged release, or build `frontend` with `npm ci` and `npm run build` before installing from source |

For automatic coaching diagnostics, also inspect the run's `_coaching_logs/`
folder using [the coaching guide](coaching-and-generation.md#inspect-corrections).
