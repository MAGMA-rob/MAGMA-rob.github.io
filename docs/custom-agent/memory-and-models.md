---
sidebar_position: 6
title: Manage Memory and Multiple Models
---

# Manage Memory and Multiple Models

Your package owns the full agent algorithm. It can retrieve context, invoke several models, keep a plan, summarize history, or route an instruction. GEN still see one input and one final decision per candidate.

## Return complete, independent state

The input's `memory` is the state of this particular interaction. Every candidate returns a complete replacement, not a patch. GEN preserve it for the next step on that trajectory.

```text
Input with memory M
  ├─ candidate 0 → decision A → memory M_A → continuation A
  └─ candidate 1 → decision B → memory M_B → continuation B
```

Copy mutable state before updating it. Never use a server-global conversation list or a cache keyed only by input ID as the authoritative history: IDs can be reused across requests and branches. Keep loaded model weights in the process, but make interaction state recoverable from the supplied memory. An empty or scenario-initialized memory starts a new interaction; the protocol has no separate reset endpoint.

The schema is yours. Full-history uses `history` and `memory_list`; your package may use different keys. Preserve or explicitly migrate initial state you accept, and report incompatible input rather than mixing schemas. `TaskState` in a scenario is separate symbolic construction state.

## Example: add a summarizer before the decision model

The existing `history_summarized_agent.runtime.agent.Runtime` demonstrates one possible design:

1. Render the commander's prompt to measure its length.
2. If it exceeds the configured threshold and history is nonempty, send the previous summary and history to a summarizer.
3. Replace `memory.summary` with the valid summary and clear `memory.history`.
4. Give the current instruction, updated context, tools, and attributes to the commander.
5. Copy the resulting base memory for each candidate, then append its own exchange.

The current implementation defaults to 5,000 **characters**, not tokens. The current instruction is included in the commander prompt, not the history being summarized. A failed summary produces errors for that input's candidates without calling the commander. A valid summary is shared before independent candidate decisions are sampled.

This is an architectural example for your package, not a required algorithm. You may choose a token budget, retain recent messages, share one checkpoint across roles, or use retrieval. Specify what happens on each component's failure and whether candidates share preliminary computations. In the provided example, commander and summarizer require compatible trained templates; it is not an arbitrary pair of base models.

## Record the internal calls

Return `internal_steps` alongside the final decision, including partial records when a later component fails. The wire contract allows JSON objects; the supplied exporters use the core's `InternalStep` schema:

```json
{
  "id": "step-0",
  "component": "commander",
  "origin": "model",
  "full_prompt": "user: Say hello.\nassistant:",
  "input_elements": {"messages": [{"role": "user", "content": "Say hello."}]},
  "output_raw": "{\"say\":\"Hello!\",\"action\":{}}"
}
```

Use `component` to identify which model or role ran, stable IDs within the candidate, the actual rendered prompt, structured input elements, and raw output. Coached calls use `origin="coaching"`. Preserve execution order so an exporter can reconstruct context changes between a summarizer and commander.

These records support debugging, agent-specific coaching, and separate training datasets for internal models. An agent with only a final decision can satisfy inference, but cannot later recover model prompts it never recorded. See [export](export.md).

## Check state behavior before scaling

Send independent episodes together, request two candidates from one input, and continue each with its own memory. Check that histories do not leak, returned memory is sufficient to resume, and a component failure retains diagnostics. Exercise the threshold and failed-summary paths for a summarizing design. Verify exact response count and ordering even if components execute in a different order internally.
