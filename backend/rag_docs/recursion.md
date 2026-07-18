# Recursion & Call Trees

Recursion involves functions calling themselves with smaller sub-problems. Visualizing recursion is best done using a recursion tree alongside the call stack.

## Visualizing Recursion Trees

- Represent the recursion structure using the `"recursion_tree"` visual component.
- Each recursion tree node has an `id`, a `label` representing the function call (e.g. `"fib(4)"`), a `parentId` to draw the tree connections, a `state`, and an optional `val` (the return value once computed).
- When a function starts executing, its node state is `"active"`.
- When waiting for sub-calls, its state is `"waiting"`.
- When a sub-call completes and a value is returned, the state changes to `"done"` or `"backtracking"`, and the return `val` is displayed.

## Fibonacci Example

Calling `fib(3)`:
1. `fib(3)` is called: parent `null`. Node `fib(3)` is `"active"`.
2. `fib(3)` calls `fib(2)`: Node `fib(2)` is `"active"`, parent is `fib(3)`. `fib(3)` is now `"waiting"`.
3. `fib(2)` calls `fib(1)`: Node `fib(1)` is `"active"`, parent is `fib(2)`. `fib(2)` is now `"waiting"`.
4. `fib(1)` returns 1: Node `fib(1)` state becomes `"done"`, `val` is `1`.
5. `fib(2)` calls `fib(0)`: Node `fib(0)` is `"active"`, parent is `fib(2)`.
6. `fib(0)` returns 0: Node `fib(0)` state becomes `"done"`, `val` is `0`.
7. `fib(2)` sums `1 + 0 = 1` and returns: Node `fib(2)` state becomes `"done"`, `val` is `1`.

### Fibonacci Recursion Tree JSON Step Example

```json
{
  "line": 4,
  "explanation": "fib(2) completed sub-calls and returned 1. Backtracking to fib(3).",
  "variables": {
    "n": 2
  },
  "stack": ["fib(3)"],
  "visuals": [
    {
      "type": "recursion_tree",
      "nodes": [
        {"id": "node_3", "label": "fib(3)", "parentId": null, "state": "active", "val": null},
        {"id": "node_2", "label": "fib(2)", "parentId": "node_3", "state": "done", "val": 1},
        {"id": "node_1", "label": "fib(1)", "parentId": "node_2", "state": "done", "val": 1},
        {"id": "node_0", "label": "fib(0)", "parentId": "node_2", "state": "done", "val": 0}
      ]
    }
  ]
}
```
