---
pagination_next: null
sidebar_position: 6
slug: /use-magma-gen/running-generation/key-systems
title: Configure Coaching
---

# Configure Coaching

Enable coaching on a working generation to collect tested alternative
continuations. Use automatic LLM assistance, or submit your own corrections
through [Coach mode in the viewer](viewer.md#coach-an-active-run).

## Enable coaching

1. Configure a reachable language-model backend using [backend
   configuration](quickstart/configuration.md#add-a-language-model-backend-later).
2. Replace the top-level `coaching` block in `config.yaml` with:

```yaml
coaching:
  enabled: true
  max_pending_per_stage: 5
  max_unproven_per_stage: 5
  examples:
    register_successful: false
    use_for_automatic: false
    cache_dir: "cache"
```

3. Start an updated agent with coaching support. The provided full-history agent
   supports corrections with its compatible adapters; the Llama adapter does not.
4. Start the [viewer](viewer.md#start-the-viewer) before generation.
5. Launch a new run with **neither `--no-coaching` nor `--no-judge`**:

```bash
magma-gen run coached_buttons --preset press_button.ButtonPressOrdered \
  --config-path ./config.yaml --nb-env 1 --nb-branch 1 --no-randomized \
  --max-launch-per-stage 5 \
  --sequence_of_buttons sw0,sw1 --instruction "Press sw0 then sw1."
```

Keep the planner, agent, and backend running. If services are on other machines
or in containers, use addresses reachable from the caller.

`--no-coaching` disables coaching for the run. `--no-judge` also disables coaching
and removes the configured backends from that run. Both prevent human corrections.
The current configuration accepts `enabled`, the two limits, and `examples`;
old `provider`/`endpoint` settings and `--coaching-provider`/`--coaching-endpoint`
options are no longer supported.

## Bound automatic coaching work

Both limits default to **5** and must be positive integers:

| Setting | Work counted toward the limit |
| --- | --- |
| `max_pending_per_stage` | Queued requests, running requests, and answers awaiting reinjection |
| `max_unproven_per_stage` | Pending plus completed attempts, minus attempts that later led to stage success |

GEN stops enqueueing automatic requests when either limit is reached. Existing
work can finish, and a successful stage does not itself disable later coaching.
Human viewer interventions are exempt from these two limits. Scenario tool-call
budgets and stage exploration limits still apply to their continuations.

For how diagnosis, repair, and validation work, read [coaching
concepts](../concepts/coaching.md).

## Submit a human correction

Select `coached_buttons` while it is active and click **Passer en Coach**. Select
an executed tool decision, click **Créer une alternative**, fill the replacement
and diagnostic fields, then click **Réinjecter la correction**.

Follow [the viewer walkthrough](viewer.md#coach-an-active-run) for the full form
instructions, feedback messages, and session behavior. Human correction does
not require a separate coaching server or a `provider: human` configuration.

## Inspect corrections

Select the run in the viewer and compare the original decision with the coached
branch. Read the candidate's outcome and descendants to check what the alternative
accomplished. A `coached` marker identifies its source; it does not establish success.

Return to **Viewer** mode to expand a node's **Coaching** section. For human
interventions, the saved source includes the command ID, source node, and diagnosis.
For automatic diagnosis and remote coaching dialogue, read `_coaching_logs/`
under the run directory, for example `output/coached_buttons/_coaching_logs/`.

Once generation finishes, [export the graph](export.md). Selection uses the
recorded outcomes; an accepted correction does not automatically become a
training example.

## Reuse validated coaching examples

To register successful coaching examples and make them available to later
automatic diagnosis, change the `examples` block to:

```yaml
examples:
  register_successful: true
  use_for_automatic: true
  cache_dir: "cache"
```

Keep this block nested under `coaching`. The cache is relative to the generation
working directory unless you supply an absolute path. Failed corrections are
not registered as successful examples; registration retains at most five
successful cases per group.

You can also enable these options for one run with
`--register-successful-coaching --use-coaching-examples --coaching-examples-dir ./cache`.
These caches help later coaching; model training still uses a separately
[exported dataset](export.md).

## Troubleshoot coaching

| Problem | Check |
| --- | --- |
| Configuration rejects a field | Remove legacy provider settings; use the top-level block above |
| LLM coaching requires a backend | Add a configured backend and omit `--no-judge` |
| No automatic correction appears | Agent support, eligible failure/format/suboptimal event, and per-stage limits |
| Coach mode unavailable | Active live run and supported full-history adapter; see [viewer checks](viewer.md#troubleshoot-the-viewer) |
| Agent metadata error | Update Core and the agent together and restart the server |
| Alternative stops early | Tool-call and trajectory-start budgets, plus the new branch's actual outcome |
