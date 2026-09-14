---
sidebar_position: 8
title: Export Your Agent's Training Data
---

# Export Your Agent's Training Data

The agent package knows how its internal inputs and outputs become training examples. GEN selects recorded candidates; your exporter turns those examples into datasets for your models. Implement export after inference and internal-call recording work.

## Register a local GEN exporter

Extend the package from [Create your agent](create-agent.md) with `src/my_agent/export.py`. This minimal exporter writes structured context and final decisions for the sample agent; a model-specific exporter can instead emit one row per recorded internal call.

```python title="src/my_agent/export.py"
from magma_core.protocol.agent_export import (
    DatasetRenderer, ExportExample, ExportRecord, ExportResult, GenExporter,
)
from magma_core.protocol.agent import JsonObject


class Renderer(DatasetRenderer):
    filenames = {"decisions": "decisions.json"}

    def render(self, channel: str, example: dict) -> JsonObject:
        if channel != "decisions":
            raise ValueError(f"Unknown channel: {channel}")
        return {"context": example["context"], "decision": example["decision"]}


class Exporter(GenExporter):
    agent_id = "my-agent"
    agent_version = "0.1.0"

    def __init__(self) -> None:
        self.renderer = Renderer()

    def export(
        self, examples: list[ExportExample], *, options: JsonObject | None = None,
    ) -> list[ExportResult]:
        if options:
            raise ValueError("This exporter has no private options")
        results = []
        for example in examples:
            decision = example.candidate.output
            if example.candidate.response_status != "completed" or decision is None:
                results.append(ExportResult(
                    example_id=example.example_id, status="skipped",
                    reason="No completed decision",
                ))
                continue
            row = self.renderer.render("decisions", {
                "context": example.input.model_dump(mode="json"),
                "decision": decision.model_dump(mode="json"),
            })
            results.append(ExportResult(
                example_id=example.example_id, status="exported",
                records=[ExportRecord(
                    record_id=f"{example.example_id}:decision",
                    dataset="decisions", data=row,
                )],
            ))
        return results
```

Add this section to `pyproject.toml`, reinstall the package, and start a new export process:

```toml
[project.entry-points."magma.export.gen"]
my-agent = "my_agent.export:Exporter"
```

```bash
python -m pip install -e .
magma-gen export output/my_run --agent my-agent
```

Use a run produced by your matching agent identity and version. The hello-only example checks the protocol, so it may have no candidates that satisfy GEN's execution/score selection; use a working task policy before expecting a useful dataset.

The entry point is a no-argument factory returning a `GenExporter`. It runs locally in the export process, without an HTTP endpoint or a running inference server. The example imports no model loader. Install your package where export runs, even if inference ran on a different machine.
