---
pagination_prev: custom-agent/create-agent
pagination_next: null
sidebar_position: 4
title: Connect to GEN or BENCH
---

# Connect to GEN or BENCH

A running agent exposes the same MAGMA HTTP protocol **2.0** to GEN and BENCH.
Use [a provided agent](use-full-history.md) or [your own server](create-agent.md).
Check the three endpoints and [request a tool call](use-full-history.md#request-a-tool-call)
before launching simulation:

```bash
curl --fail http://localhost:8888/health
curl --fail http://localhost:8888/v1/info
```

Expect `status: "ready"`, compatible `protocol_version`, and
`capabilities.inference: true`. Keep the agent running. Use an address reachable
from the consumer, including when services run on different machines or in containers.

| Consumer | Agent address |
| --- | --- |
| GEN | `magma_agent_address` in configuration, or `--magma-agent-address` |
| BENCH | `--agent-address` |

The agent is separate from the motion planner and from language-model backends
used for judging answers or coaching. Its model/API settings belong to the agent;
the consumer needs its MAGMA server URL.

## Connect to GEN

### Prepare the run

Follow [installation](../use-magma-gen/quickstart/installation.md) and create the workspace's [generation configuration](../use-magma-gen/quickstart/configuration.md). If you use a custom server, its own model configuration replaces `agent.json`.

Start the planner and viewer using [the launch guide](../use-magma-gen/quickstart/launch-first-generation.md). Keep your working agent server running instead of launching a second agent on the same port. Start the viewer before generation and point it at `~/magma-workspace/output`.

### Generate a first trajectory

From `~/magma-workspace`, with the MAGMA Python environment active, run the command below. Replace the agent URL if your server uses another host or port.

```bash
magma-gen run first_agent_run --preset press_button.ButtonPressOrdered \
  --config-path ./config.yaml --magma-agent-address http://localhost:8888 \
  --nb-env 1 --nb-branch 1 --no-coaching --no-judge --no-randomized \
  --sequence_of_buttons sw0,sw1 --instruction "Press sw0 then sw1."
```

This uses an installed preset and disables coaching to check inference and action execution first. Inspect agent errors and stage results before increasing the branch count. GEN can request multiple candidates from the same input to explore independent continuations.

The configuration field for the runtime URL is `magma_agent_address`. Model loading and private inference settings belong in the agent configuration. Coaching backends belong in GEN configuration and are supplied to the agent separately when coaching is enabled.

### Inspect and export

Use a fresh run name each time; the launcher may clear an existing run directory. Select `first_agent_run` in the [viewer](../use-magma-gen/viewer.md). Check the proposed tool name, button argument, robot name, tool result, and stage outcome. A model can return a valid decision and still fail the task.

For full-history, export after the run finishes:

```bash
magma-gen export output/first_agent_run --agent full-history-agent
```

Read [the output files and selection rules](../use-magma-gen/export.md). A custom agent needs [its own matching exporter](export.md); the full-history exporter cannot export an arbitrary agent's graph.

To run the task you authored, follow [Generate Data from Your Scenario](../create-scenarios/first-scenario/generate.md). It uses the same services with your preset identifier.

### Runtime and export are separate integrations

| Operation | What must be available |
| --- | --- |
| GEN inference | Running HTTP agent reachable from the consumer |
| GEN dataset export | Compatible agent exporter installed in the export process |

There is no export HTTP server. See [agent export](export.md).

## Connect to BENCH

Complete [benchmark installation and download](../use-magma-bench/installation.md)
and keep the planner running. From your benchmark workspace and activated Python
environment, check the connection with one scenario:

```bash
magma-bench run --dataset 1.0.0 \
  --agent-address http://localhost:8888 \
  --planner-address http://localhost:8000 \
  --results-path ./eval/smoke-test \
  --scenarios press_button --nb-env 1 --skip-judge --videos off
```

`--skip-judge` accepts textual answers automatically; use it for installation
checks. For a full evaluation, configure the separate answer-verification backend
and follow [Run an Evaluation](../use-magma-bench/run.md).

BENCH requests one candidate per input and carries its returned memory to the
next step. It requires inference, not GEN coaching or a dataset exporter. The
same agent server can therefore be used for both consumers.

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
