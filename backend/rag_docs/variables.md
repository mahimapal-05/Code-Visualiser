# Scalar Variables & Loop Checks

When code does not utilize explicit structures like arrays, linked lists, or recursion trees (for example, checking if a number is prime, arithmetic formulas, or simple variable calculations), you must visualize the variables as interactive, floating state cards in the canvas.

## Visualizing Scalar States

- Use the `"variables"` component type.
- Define a list of variables under the `vars` array, including their names, values, and states.
- States can be:
  - `"checking"` (Cyan border, when a value is read or evaluated in a loop condition).
  - `"updated"` (Pink/Rose border, when a value is written or incremented).
  - `"normal"` (Slate border, when a value is static).

## Prime Checking Example

When checking if `n = 7` is prime in a loop:
1. `n = 7` is initialized.
2. Loop starts `i = 2`.
3. Evaluate condition `7 % 2 == 0` (False).
4. Increment `i = 3`.
5. Evaluate condition `7 % 3 == 0` (False).
6. Loop finishes, conclude `7 is prime`.

### Prime Checking Step Example

```json
{
  "line": 4,
  "explanation": "Evaluate loop condition: 7 % 2 != 0. n is not divisible by 2.",
  "variables": {
    "n": 7,
    "i": 2,
    "isPrime": true
  },
  "stack": ["isPrime"],
  "visuals": [
    {
      "type": "variables",
      "vars": [
        {"name": "n", "value": 7, "state": "normal"},
        {"name": "i", "value": 2, "state": "checking"},
        {"name": "n % i == 0", "value": "false", "state": "checking"},
        {"name": "isPrime", "value": "true", "state": "updated"}
      ]
    }
  ]
}
```
