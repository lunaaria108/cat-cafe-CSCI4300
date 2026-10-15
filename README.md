React State Cat Café Assignment 🐱☕
In this assignment, you will complete the drink machine in a Cat Café game using React state. The café’s interface is provided, but the machine needs your help to prepare customer orders!
Learning Outcomes
- Update React state using a state setter
- Use the previous state to determine the next state
- Implement conditional logic in an event handler
- Explain how state changes update the interface
Project Structure
.
├── app/
│   ├── components/
│   │   ├── Catrista.tsx
│   │   ├── Cup.tsx
│   │   └── Customer.tsx
│   └── page.tsx       ← Complete fillCup() here
├── public/
│   └── Sprites/
├── package.json
└── README.md
Background Info
- React’s useState() hook stores information between renders. Updating state tells React to render the interface again.
- In app/page.tsx, the following state tracks the cup on the drink machine:
  const [machineCup, setMachineCup] = useState<CupType | null>(null);
- machineCup can contain one of these values:
  Value	Meaning
  null	No cup on the machine
  "empty"	An empty cup
  "coffee"	A cup of coffee
  "tea"	A cup of tea
  "milkCoffee"	Coffee with milk
  "milkTea"	Tea with milk
- When the next state depends on the previous state, you can pass an updater function to the setter:
  setMachineCup((current) => {
    // Return the next cup state.
    return current;
  });
- current represents the previous state. Returning current keeps the cup unchanged.
- The ingredient buttons already call fillCup() with "coffee", "tea", or "milk". The Cup component already displays the sprite that matches the cup state.
Instructions
1. Install dependencies
   - Run npm install in the project directory.
2. Start the development server
   - Run npm run dev.
   - Open the local address displayed in your terminal, usually http://localhost:3000.
3. Find the incomplete function
   - Open app/page.tsx.
   - Locate fillCup(ingredient).
   - Complete the logic inside the provided state updater:
     function fillCup(ingredient: "coffee" | "tea" | "milk") {
       setMachineCup((current) => {
         // TODO: Implement the drink preparation rules.
     
         return current;
       });
     }
4. Implement the drink preparation rules
   - If there is no cup on the machine, ingredients should have no effect.
   - Coffee should fill an empty cup with coffee.
   - Tea should fill an empty cup with tea.
   - Milk should turn coffee into milk coffee.
   - Milk should turn tea into milk tea.
   - All other combinations should leave the cup unchanged.
   Current state	Ingredient	Next state
   null	Any	null
   "empty"	"coffee"	"coffee"
   "empty"	"tea"	"tea"
   "coffee"	"milk"	"milkCoffee"
   "tea"	"milk"	"milkTea"
   Any other combination	Any	Keep the current state
   - Hint #1: Check both the ingredient and the current cup.
   - Hint #2: Return the appropriate state value from the updater.
   - Complete this task using React state. You do not need to change the sprite components, timers, or customer logic.
5. Test your implementation
   - Start the game and try these actions:
   Action	Expected result
   Click an ingredient with no cup on the machine	No cup appears
   Place an empty cup and add coffee	The cup displays coffee
   Place an empty cup and add tea	The cup displays tea
   Add milk to coffee	The cup displays milk coffee
   Add milk to tea	The cup displays milk tea
   Add milk to an empty cup	The cup stays empty
   Add tea to coffee	The cup stays coffee
   Add ingredients to a milk drink	The drink stays unchanged
   - Pick up a prepared drink and deliver it to a customer who ordered it.
   - Test promptly so customers do not run out of patience!
6. Explain your work
   - Why do you use setMachineCup() to update the cup?
   - What does current represent in the updater function?
   - How does changing machineCup update the cup image?
Bonus: Transfer the Cup
If your instructor has also removed the body of handleMachineCup(), complete it using these rules:
- If the player is carrying fish, do nothing.
- If the machine is empty and the player holds a cup, move the cup onto the machine.
- If the machine holds a cup and the player’s hands are empty, move the cup into the player’s hands.
- Otherwise, leave both states unchanged.
Hint: You will need to update both carryingCup and machineCup.
Have fun :)
