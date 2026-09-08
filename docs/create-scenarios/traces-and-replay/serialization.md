---
sidebar_position: 2
title: Make Components Reconstructible
slug: /create-scenarios/serialization
---

# Make Components Reconstructible

Some consumers save task initialization and stage specifications for replay or artifact generation. Execution and serialization are distinct capabilities.

Concrete stages and environment transitions implement `_to_spec_arguments()` to return constructor arguments. The current stage serializer requires the method on the concrete class; inheriting a parent's mapping is not sufficient.

```python
# Method inside a stage whose constructor accepts button:
def _to_spec_arguments(self) -> dict:
    return {"button": self.button}
```

The first package tutorial already follows this convention. Use `to_spec()` and `from_spec()` to check a round trip and compare the rebuilt instruction, goals, budgets, reset settings, and transition parameters.

Goals and errors have default constructor-based serialization, but need an explicit mapping when arguments are renamed, derived, or discarded. Constructors should be importable from your installed provider package.

`SituationInit` and `InitializationParameters` provide their own spec methods. Include extra simulation state through the environment hooks; serializing a stage constructor does not preserve the world's current state.

Do not expose functions, closures, or transient executor objects as ordinary constructor data. Keep runtime callbacks in tools, and persist the declarative data required to recreate components.
