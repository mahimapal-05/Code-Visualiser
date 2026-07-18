# Array & Sorting Operations

Arrays are indexable, contiguous structures. When visualizing array algorithms, it is crucial to show element indexes, comparative indicators, swapping motions, and sorted boundaries.

## Visualizing Array Traversal

- Represent the array using the `"array"` component type.
- Set pointer labels matching the index variables (like `i`, `j`, `low`, `high`, `mid`).
- Change elements' `state` property to `"comparing"` when code accesses or compares values.
- Change elements' `state` property to `"swapped"` or `"modified"` when a write occurs.

## Bubble Sort Example

During bubble sort:
1. Outer loop `i` controls the passes.
2. Inner loop `j` compares adjacent elements `arr[j]` and `arr[j+1]`.
3. If `arr[j] > arr[j+1]`, their states become `"comparing"` and then `"swapped"`.
4. Elements at the end of the array that are fully sorted change their state to `"sorted"`.

### Bubble Sort JSON Step Example

```json
{
  "line": 5,
  "explanation": "Compare elements at index j (5) and j+1 (3). Since 5 > 3, they will swap.",
  "variables": {
    "i": 0,
    "j": 0,
    "temp": 5
  },
  "stack": ["bubbleSort"],
  "visuals": [
    {
      "type": "array",
      "name": "arr",
      "elements": [
        {"id": "0", "value": 5, "state": "comparing"},
        {"id": "1", "value": 3, "state": "comparing"},
        {"id": "2", "value": 8, "state": "normal"},
        {"id": "3", "value": 2, "state": "normal"}
      ],
      "pointers": {
        "j": 0,
        "j+1": 1
      }
    }
  ]
}
```
