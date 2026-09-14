---
pagination_next: null
sidebar_position: 3
title: Connect to GEN
---

# Connect to GEN

A running agent exposes the MAGMA inference interface to the generator. Use [full-history](use-full-history.md) or [your own agent server](create-agent.md). Confirm that it returns a valid tool call before launching simulation.

## Prepare the run

Follow [installation](../use-magma-gen/quickstart/installation.md) and create the workspace's [generation configuration](../use-magma-gen/quickstart/configuration.md). If you use a custom server, its own model configuration replaces `agent.json`.

Start the planner and viewer using [the launch guide](../use-magma-gen/quickstart/launch-first-generation.md). Keep your working agent server running instead of launching a second agent on the same port. Start the viewer before generation and point it at `~/magma-workspace/output`.

## Generate a first trajectory

From `~/magma-workspace`, with the MAGMA Python environment active, run the command below. Replace the agent URL if your server uses another host or port.

```bash
magma-gen run first_agent_run --preset press_button.ButtonPressPreset1 \
  --config-path ./config.yaml --magma-agent-address http://localhost:8888 \
  --nb-env 1 --nb-branch 1 --no-coaching --no-judge --no-randomized
```

This uses an installed preset and disables coaching to check inference and action execution first. Inspect agent errors and stage results before increasing the branch count. GEN can request multiple candidates from the same input to explore independent continuations.

The configuration field for the runtime URL is `magma_agent_address`. Model loading and private inference settings belong in the agent configuration. Coaching backends belong in GEN configuration and are supplied to the agent separately when coaching is enabled.

## Inspect and export

Use a fresh run name each time; the launcher may clear an existing run directory. Select `first_agent_run` in the [viewer](../use-magma-gen/viewer.md). Check the proposed tool name, button argument, robot name, tool result, and stage outcome. A model can return a valid decision and still fail the task.

For full-history, export after the run finishes:

```bash
magma-gen export output/first_agent_run --agent full-history-agent
```

Read [the output files and selection rules](../use-magma-gen/export.md). A custom agent needs [its own matching exporter](export.md); the full-history exporter cannot export an arbitrary agent's graph.

To run the task you authored, follow [Generate Data from Your Scenario](../create-scenarios/first-scenario/generate.md). It uses the same services with your preset identifier.

## Runtime and export are separate integrations

| Operation | What must be available |
| --- | --- |
| GEN inference | Running HTTP agent reachable from the consumer |
| GEN dataset export | Compatible agent exporter installed in the export process |

There is no export HTTP server. See [agent export](export.md).

## Diagnose integration problems

| Symptom | Check |
| --- | --- |
| Connection refused or timeout | Agent finished loading; host and port reachable from the consumer |
| Works locally but fails in Docker | `localhost` names the current container; use a reachable service address |
| Protocol validation error | `protocol_version="2.0"`, ordered candidates, identifiers and field types |
| Candidate reports `invalid_output` | Raw completion, selected parser, prompt and robot names |
| Context from another episode appears | Branch-local memory, no shared mutable interaction history |
| Repeated candidates | Deterministic decoding or insufficient sampling diversity |
| No coaching corrections | Advertised capabilities and GEN coaching configuration |

HTTPS can terminate at a reverse proxy. An ordinary model endpoint exposing only chat completions is not the MAGMA agent API; an agent adapter must translate the requests and results.
