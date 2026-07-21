# Stack and Queue Visualizer Schema

This document specifies the `"stack_queue"` visual payload used for animating stack operations (push, pop) and queue operations (enqueue, dequeue).

## Component Specification (`type: "stack_queue"`)

- `variant` (str): `"stack"` for a vertical top-open bucket container, or `"queue"` for a horizontal left-to-right tube container.
- `name` (str): Name of the data structure variable (e.g. `"myStack"`, `"q"`).
- `items` (list): Array of items inside the structure. Each item has:
  - `id` (str): Unique string identifier.
  - `value` (any): Value of the element.
  - `state` (str): `"normal"`, `"pushing"` (entering), `"popping"` (exiting), or `"top"` (stack top/queue front).

## Example Payload

```json
{
  "type": "stack_queue",
  "variant": "stack",
  "name": "st",
  "items": [
    {"id": "1", "value": 10, "state": "normal"},
    {"id": "2", "value": 20, "state": "pushing"}
  ]
}
```
