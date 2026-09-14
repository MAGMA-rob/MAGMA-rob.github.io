---
sidebar_position: 4
title: Connect to GEN
---

# Connect to GEN

A running agent exposes the MAGMA inference interface to the generator. Start with [full-history](use-full-history.md) and confirm a direct HTTP response before launching simulation.

## Generate a first trajectory

Install MAGMA-GEN, the scenario provider, simulation dependencies, and the planner needed by the task. Start from your working [generation configuration](../reference/generation-cli.md); changing the agent address does not configure the planner or validation backends.

```bash
magma-gen run first_agent_run --preset press_button.ButtonPressPreset1 \
  --config-path ./config.yaml --magma-agent-address http://localhost:8888 \
  --nb-env 1 --nb-branch 1 --no-coaching --no-judge
```

This uses an installed preset and disables coaching to check inference and action execution first. Inspect agent errors and stage results before increasing the branch count. GEN can request multiple candidates from the same input to explore independent continuations.

The configuration field for the runtime URL is `magma_agent_address`. Model loading and private inference settings belong in the agent configuration. Coaching backends belong in GEN configuration and are supplied to the agent separately when coaching is enabled.

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
