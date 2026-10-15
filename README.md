# React State Cat Café Assignment

In this assignment, you will use React state to complete the drink machine in a Cat Café game. You will implement two functions: one to move cups between the player and the machine, and another to prepare drinks.

## Game

Check out a working version of the game here: https://cat-cafe-snowy.vercel.app/
(must not be connected to UGA wifi)

## Learning Outcomes

- Update React state using state setters
- Coordinate updates to multiple state variables
- Use previous state to determine the next state
- Implement conditional logic in event handlers
- Explain how state changes update the interface

## Project Structure

```text
.
├── app/
│   ├── components/
│   │   ├── Catrista.tsx
│   │   ├── Cup.tsx
│   │   └── Customer.tsx
│   └── page.tsx       ← Complete both functions here
├── public/
│   └── Sprites/
├── package.json
└── README.md
```

## Background Info

React’s `useState()` hook stores information between renders. Calling a state setter schedules an update and tells React to render the interface again.

The game already includes these state variables in `app/page.tsx`:

```tsx
const [carryingFish, setCarryingFish] = useState(false);
const [carryingCup, setCarryingCup] = useState<CupType | null>(null);
const [machineCup, setMachineCup] = useState<CupType | null>(null);
```

| State variable | What it stores |
|---|---|
| `carryingFish` | Whether the player is holding fish |
| `carryingCup` | The cup in the player's hands |
| `machineCup` | The cup on the drink machine |

Both cup variables can contain the following values:

| Value | Meaning |
|---|---|
| `null` | No cup |
| `"empty"` | An empty cup |
| `"coffee"` | A cup of coffee |
| `"tea"` | A cup of tea |
| `"milkCoffee"` | Coffee with milk |
| `"milkTea"` | Tea with milk |

**Remember:** `"empty"` and `null` mean different things. `"empty"` means a cup exists without a drink. `null` means there is no cup.

The interface, button handlers, and cup sprites are already provided. Your job is to complete the state logic in `handleMachineCup()` and `fillCup()`.

## Getting Started

1. **Install dependencies**
   - Run `npm install` in the project directory.

2. **Start the development server**
   - Run `npm run dev`.
   - Open the local address displayed in your terminal, usually `http://localhost:3000`.

3. **Open the game**
   - Read through the introduction and rules.
   - Click **Start Playing**.
   - Find the cup shelf, drink machine, and ingredient buttons.

4. **Open the code**
   - Open `app/page.tsx`.
   - Locate `handleMachineCup()` and `fillCup()`.
   - Complete Part 1 before beginning Part 2.

## Part 1: Move Cups Between the Player and the Machine

The player needs to place a cup on the machine before preparing a drink, then retrieve it to serve a customer.

Complete `handleMachineCup()` to make these transfers work. The machine's tray button already calls this function when clicked.

### Starter Code

```tsx
function handleMachineCup() {
  // TODO: Prevent cup transfers while holding fish.

  // TODO: Place the player's cup on an empty machine.

  // TODO: Pick up the machine's cup when hands are empty.
}
```

### Instructions

1. **Prevent transfers while carrying fish**
   - Check `carryingFish`.
   - If it is `true`, exit the function without changing any state.

2. **Place a cup on the machine**
   - Check that `machineCup` is `null`.
   - Also check that `carryingCup` is not `null`.
   - Both conditions must be true before transferring.
   - Use the state setters to:
     - Give the machine the cup currently held by the player.
     - Clear the cup from the player's hands.
   - Exit the function after completing this transfer.

3. **Pick up a cup from the machine**
   - Check that `machineCup` is not `null`.
   - Also check that `carryingCup` is `null`.
   - Both conditions must be true before transferring.
   - Use the state setters to:
     - Give the player the cup currently on the machine.
     - Clear the cup from the machine.

4. **Leave other situations unchanged**
   - If both locations are empty, do nothing.
   - If both locations contain cups, do nothing.
   - Do not replace or discard a cup.
   - Preserve the cup's contents when moving it.

### Expected Behavior

| Holding fish? | Player's cup | Machine's cup | Result |
|---|---|---|---|
| Yes | Any | Any | No change |
| No | A cup | `null` | Move the player's cup onto the machine |
| No | `null` | A cup | Move the machine's cup into the player's hands |
| No | `null` | `null` | No change |
| No | A cup | A cup | No change |

“A cup” includes every cup type, including `"empty"`.

### Test Part 1

| Action | Expected result |
|---|---|
| Click the empty machine with empty hands | Nothing happens |
| Pick up a shelf cup, then click the tray | The cup moves onto the machine |
| Click the tray again with empty hands | The cup moves back to the player |
| Hold fish and click a machine containing a cup | The fish and cup stay where they are |
| Hold a second cup and click a machine containing a cup | Neither cup moves |

Use **Discard Item** when you need to clear your hands.

## Part 2: Prepare Drinks

Now that cups can move onto the machine, complete `fillCup()` so the player can prepare drinks.

The ingredient buttons already call this function with `"coffee"`, `"tea"`, or `"milk"`.

### Starter Code

```tsx
function fillCup(ingredient: "coffee" | "tea" | "milk") {
  setMachineCup((current) => {
    // TODO: Return the next cup state based on
    // the current cup and the selected ingredient.

    return current;
  });
}
```

### Understanding the State Updater

When the next state depends on the previous state, you can pass an updater function to the setter:

```tsx
setMachineCup((current) => {
  // Return the next state.
  return current;
});
```

React passes the previous cup state into `current`. The value you return becomes the next cup state.

Returning `current` leaves the cup unchanged.

### Instructions

1. **Handle a missing cup**
   - If `current` is `null`, return `null`.
   - Clicking an ingredient must not create a cup.

2. **Add coffee**
   - If the ingredient is `"coffee"` and the current cup is `"empty"`, return the coffee cup state.

3. **Add tea**
   - If the ingredient is `"tea"` and the current cup is `"empty"`, return the tea cup state.

4. **Add milk**
   - If the ingredient is `"milk"`, check the current drink.
   - Coffee should become milk coffee.
   - Tea should become milk tea.

5. **Keep unsupported combinations unchanged**
   - Return `current` for any combination that does not match the preparation rules.
   - For example, milk should not change an empty cup, and tea should not replace coffee.

### Drink Preparation Rules

| Current state | Ingredient | Next state |
|---|---|---|
| `null` | Any | `null` |
| `"empty"` | `"coffee"` | `"coffee"` |
| `"empty"` | `"tea"` | `"tea"` |
| `"coffee"` | `"milk"` | `"milkCoffee"` |
| `"tea"` | `"milk"` | `"milkTea"` |
| Any other combination | Any | Keep the current state |

### Test Part 2

| Action | Expected result |
|---|---|
| Click an ingredient with no cup on the machine | No cup appears |
| Place an empty cup and add coffee | The cup displays coffee |
| Place an empty cup and add tea | The cup displays tea |
| Add milk to coffee | The cup displays milk coffee |
| Add milk to tea | The cup displays milk tea |
| Add milk to an empty cup | The cup stays empty |
| Add tea to coffee | The cup stays coffee |
| Add coffee to tea | The cup stays tea |
| Add ingredients to a milk drink | The drink stays unchanged |

## Test the Complete Workflow

After completing both functions:

1. Find a customer who ordered a drink.
2. Pick up an empty cup from the shelf.
3. Place it on the machine.
4. Add the ingredients needed for the customer's drink.
5. Retrieve the prepared cup.
6. Deliver it to the customer.
7. If the customer also ordered fish, deliver that too.

A completed correct order should earn points. Test promptly so customers do not run out of patience!

## Have fun :) 
