---
sidebar_position: 12
title: Agent Export Contract
---

# Agent Export Contract

Local GEN export contracts live in `magma_core.protocol.agent_export` (`EXPORT_VERSION="2.0"`). Discovery uses installed package metadata, without importing all providers. Loading invokes the selected entry point as a no-argument factory and verifies that it returns the expected base class. Duplicate provider names in a group are rejected.

## GEN exporter

Register under `magma.export.gen`. A `GenExporter` provides `agent_id`, `agent_version`, a `renderer: DatasetRenderer`, and:

```python
# Method signature on a GenExporter subclass:
def export(self, examples: list[ExportExample], *, options: JsonObject | None = None) -> list[ExportResult]:
    ...
```

| Type | Fields |
| --- | --- |
| `ExportExample` | `example_id`, original `input: AgentInput`, recorded `candidate: CandidateRecord` |
| `ExportResult` | `example_id`, `status`, `records`, optional `reason` |
| `ExportRecord` | Nonempty `record_id`, dataset channel name, JSON-object `data` |
| `DatasetRenderer` | `filenames` mapping and `render(channel, example)` returning a JSON object |

An exported result requires records. Skipped/error results require a reason and no records. Channel names match `^[a-zA-Z0-9][a-zA-Z0-9_-]*$`. Return results associated with their original example IDs and declare output filenames for each emitted channel.

The current GEN command selects examples from saved graph scores before calling the exporter. It checks producer `agent_id` and `agent_version` against the exporter, writes datasets and a manifest, and partitions by task. Exporters define the model-specific rows; they should avoid loading inference weights when rendering recorded examples.

**Guide:** [Implement and register an exporter](../../custom-agent/export.md). **Commands:** [Export GEN data](../../use-magma-gen/export.md).
