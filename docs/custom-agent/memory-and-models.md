---
pagination_prev: custom-agent/model-prompts
pagination_next: custom-agent/coaching
sidebar_position: 6
title: Manage Memory and Multiple Models
---

# Manage Memory and Multiple Models

Your package owns the full agent algorithm. It can retrieve context, invoke several models, keep a plan, summarize history, or route an instruction. GEN still sees one input and one final decision per candidate.

## Return complete, independent state

The input's `memory` is the state of this particular interaction. Every candidate returns a complete replacement, not a patch. GEN preserves it for the next step on that trajectory.

```text
Input with memory M
  ├─ candidate 0 → decision A → memory M_A → continuation A
  └─ candidate 1 → decision B → memory M_B → continuation B
```

Copy mutable state before updating it. Never use a server-global conversation list or a cache keyed only by input ID as the authoritative history: IDs can be reused across requests and branches. Keep loaded model weights in the process, but make interaction state recoverable from the supplied memory. An empty or scenario-initialized memory starts a new interaction; the protocol has no separate reset endpoint.

The schema is yours. The provided scenarios and agents use `memory_list` for permanent rules, as a list of strings. Preserve those rules when accepting this initial memory. Full-history additionally uses `history`; your package can choose its own keys for history, plans, or summaries. Preserve or explicitly migrate initial state you accept, and report incompatible input rather than mixing schemas. `TaskState` in a scenario is separate symbolic construction state.

## Example: add a summarizer before the decision model

Start from the runtime and memory handling in [full-history-agent on GitHub](https://github.com/MAGMA-rob/full-history-agent). To add a summarizer, you can extend that implementation with this strategy:

1. Render the commander's prompt to measure its length.
2. If it exceeds the configured threshold and history is nonempty, send the previous summary and history to a summarizer.
3. Replace `memory.summary` with the valid summary and clear `memory.history`.
4. Give the current instruction, updated context, tools, and attributes to the commander.
5. Copy the resulting base memory for each candidate, then append its own exchange.

For example, choose a threshold of 5,000 **characters**, or measure tokens instead. Include the current instruction in the commander prompt, while summarizing only the preceding history. In this design, a failed summary returns errors for that input's candidates without calling the commander. A valid summary is shared before independent candidate decisions are sampled.

This is one possible design for your package. You may retain recent messages, share one checkpoint across roles, or use retrieval. Specify what happens on each component's failure and whether candidates share preliminary computations. Give each model prompts and an output parser suited to its role.

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
