"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Pixelify_Sans } from "next/font/google";
import Cup, { type CupType } from "./components/Cup";
import Catrista, { type Expression } from "./components/Catrista";
import Customer, {type Order } from "./components/Customer";

// Load the pixel font used by the game and intro screens.
const pixelify = Pixelify_Sans({
  subsets: ["latin"],
});

// All game positions use this fixed scene size. The whole scene scales to fit the window.
const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

// Shared styling for the intro navigation buttons.
const buttonClasses = `
  border-4 border-[#513323]
  bg-[#c77b47] px-6 py-3 font-bold text-[#fff1d6]
  cursor-pointer hover:bg-[#dc945c]
  active:translate-x-1 active:translate-y-1
  focus-visible:outline focus-visible:outline-2
  focus-visible:outline-offset-4 focus-visible:outline-[#513323]
`;

// The rules screen uses this list to pair each cup sprite with its explanation.
const cupRules: {
  type: CupType;
  title: string;
  description: string;
}[] = [
  {
    type: "empty",
    title: "Empty Cup",
    description: "Pick this cup from the shelf to start an order.",
  },
  {
    type: "coffee",
    title: "Coffee",
    description: "Fill an empty cup with coffee.",
  },
  {
    type: "tea",
    title: "Tea",
    description: "Fill an empty cup with tea.",
  },
  {
    type: "milkCoffee",
    title: "Milk Coffee",
    description: "Add milk to a coffee cup.",
  },
  {
    type: "milkTea",
    title: "Milk Tea",
    description: "Add milk to a tea cup.",
  },
];

export default function Home() {
  // Intro progresses through welcome, intro, and rules. null means the game is active.
  const [screen, setScreen] = useState<
    "welcome" | "intro" | "rules" | null
  >("welcome");

  // The barista reacts to successful deliveries, mistakes, and customers losing patience.
  const [expression, setExpression] = useState<Expression>("neutral");
  // Store active customer IDs. Stable IDs preserve each customer and order when others leave.
  const [customers, setCustomers] = useState<number[]>([]);
  // A ref supplies unique IDs without resetting on each render.
  const nextCustomerId = useRef(0);
  // null hides the scene until its initial scale has been calculated.
  const [sceneScale, setSceneScale] = useState<number | null>(null);
  // Held items are rendered beside the pointer. Shelf buttons allow only one item at a time.
  const [carryingFish, setCarryingFish] = useState(false);
  // Pointer coordinates are measured in screen pixels, outside the scaled game scene.
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  // Each customer reports its generated order; this record lets delivery handlers check it.
  const [orders, setOrders] = useState<Record<number, Order>>({});
  // Track partial deliveries by customer ID so fish and drinks can be served in either order.
  const [fishDelivered, setFishDelivered] = useState<
    Record<number, boolean>
  >({});
  // null means no cup is held; otherwise the value selects the visible cup sprite.
  const [carryingCup, setCarryingCup] = useState<CupType | null>(null);
  // The machine holds a separate cup while ingredients are added.
  const [machineCup, setMachineCup] = useState<CupType | null>(null);
  const [drinkDelivered, setDrinkDelivered] = useState<
    Record<number, boolean>
  >({});
  // Complete orders earn 10 points. Wrong items and expired orders lose 5, with a floor of zero.
  const [score, setScore] = useState(0);
  // Store an absolute expiry time for each customer, fixed when that customer arrives.
  const [deadlines, setDeadlines] = useState<Record<number, number>>({});
  // A shared clock updates the countdowns and expiry checks while the game is active.
  const [now, setNow] = useState(0);

  // Timing values are milliseconds. Higher scores shorten the gap between arrivals.
  const arrivalInterval =
  score >= 100 ? 2000 : score >= 50 ? 5000 : 6000;

  // New customers wait 30 seconds below 50 points, then 15 seconds at higher scores.
  const patience =
  score >= 100 ? 15000 : score >= 50 ? 15000 : 30000;

  // Keep the latest difficulty available to the arrival timer.
  const difficultyRef = useRef({ arrivalInterval, patience });

  // The long-running arrival timer reads this ref instead of a stale customer count.
  const customerCountRef = useRef(0);

  useEffect(() => {
    customerCountRef.current = customers.length;
  }, [customers.length]);

  useEffect(() => {
    difficultyRef.current = { arrivalInterval, patience };
  }, [arrivalInterval, patience]);

function handleMachineCup() {
  // TODO: Prevent cup transfers while holding fish.

  // TODO: Place the player's cup on an empty machine.

  // TODO: Pick up the machine's cup when hands are empty.
}

// Called when the player clicks a coffee, tea, or milk button.
function fillCup(ingredient: "coffee" | "tea" | "milk") {
  setMachineCup((current) => {
    // TODO: Decide what cup state to return based on
    // the current cup and the ingredient selected.

    return current;
  });
}

  useEffect(() => {
    // Reset happy or sad reactions after one second; clear the old timeout when the expression changes.
    if ((expression === "neutral")) return;

    const timeout = window.setTimeout(() => {
      setExpression("neutral");
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [expression]);

  // Keep this callback stable so passing it to Customer does not repeatedly regenerate its order.
  const registerOrder = useCallback((id: number, order: Order) => {
    setOrders((current) => ({ ...current, [id]: order }));
  }, []);

  useEffect(() => {
    // Listen for pointer movement only while the player is holding an item.
    if (!carryingFish && carryingCup === null) return;

    function followMouse(event: PointerEvent) {
      setMouse({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener("pointermove", followMouse);

    return () => window.removeEventListener("pointermove", followMouse);
  }, [carryingFish, carryingCup]);

  // Deliver fish, reject an incorrect item, or finish an order whose drink is already served.
  function giveFish(customerId: number) {
    if (!carryingFish) return;

    const order = orders[customerId];
    if (!order) return;

    // Wrong item: consume the fish and make the customer leave.
    if (!order.fish) {
      setExpression("sad");
      setCarryingFish(false);
      setScore((current) => Math.max(0, current - 5));

      setCustomers((current) =>
        current.filter((id) => id !== customerId)
      );

      return;
    }

    // They already received their fish.
    if (fishDelivered[customerId]) {
      return;
    }

        setCarryingFish(false);
        setFishDelivered((current) => ({
          ...current,
          [customerId]: true,
        }));
        setExpression("happy");

        // Fish-only orders are now complete.
        if (order.drink === null || drinkDelivered[customerId]) { 
          setScore((current) => current + 10);

          setCustomers((current) =>
            current.filter((id) => id !== customerId)
          );
        }
      }

  // Match the held cup against the requested drink, then wait for fish if it is still needed.
  function giveCup(customerId: number) {
    if (carryingCup === null) return;

    const order = orders[customerId];
    if (!order) return;

    // They already received their drink.
    if (drinkDelivered[customerId]) return;

    // Consume the cup being handed over.
    setCarryingCup(null);

    // Wrong drink, empty cup, or a fish-only order.
    if (carryingCup !== order.drink) {
      setExpression("sad");
      setCustomers((current) =>
        current.filter((id) => id !== customerId)
      );
      setScore((current) => Math.max(0, current - 5));
      return;
    }

    setDrinkDelivered((current) => ({
      ...current,
      [customerId]: true,
    }));
    setExpression("happy");

    // Leave when every requested item has been delivered.
    if (!order.fish || fishDelivered[customerId]) {
      setScore((current) => current + 10);

      setCustomers((current) =>
        current.filter((id) => id !== customerId)
      );
    }
  }

  useEffect(() => {
    // Preserve the scene aspect ratio so sprites stay aligned with the background at every window size.
    function resizeScene() {
      setSceneScale(
        Math.min(
          window.innerWidth / SCENE_WIDTH,
          window.innerHeight / SCENE_HEIGHT
        )
      );
    }

    resizeScene();
    window.addEventListener("resize", resizeScene);

    return () => window.removeEventListener("resize", resizeScene);
  }, []);

  // Customer arrivals
  useEffect(() => {
    if (screen !== null) return;

    // First arrival happens on the first timer tick. Later arrivals use the current difficulty.
    let nextArrival = Date.now();

    const timer = window.setInterval(() => {
      const time = Date.now();
      if (time < nextArrival) return;

      const difficulty = difficultyRef.current;
      nextArrival = time + difficulty.arrivalInterval;

      // A full queue skips this arrival opportunity; the timer keeps running.
      if (customerCountRef.current >= 5) return;

      const id = nextCustomerId.current++;
      // Reserve the slot immediately, before React renders the new customer.
      customerCountRef.current += 1;

      setCustomers((current) => [...current, id]);
      setDeadlines((current) => ({
        ...current,
        [id]: time + difficulty.patience,
      }));
    }, 250);

    // Release the interval when this effect stops or the page unmounts.
    return () => window.clearInterval(timer);
  }, [screen]);

  // Update the clock
  useEffect(() => {
    if (screen !== null) return;

    setNow(Date.now());

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    // Release the interval when this effect stops or the page unmounts.
    return () => window.clearInterval(timer);
  }, [screen]);

  // Remove customers whose patience has run out
  useEffect(() => {
    if (screen !== null) return;

    // Only active customers count toward timeout penalties; removed customers are ignored.
    const expired = customers.filter(
      (id) => deadlines[id] !== undefined && deadlines[id] <= now
    );

    if (expired.length === 0) return;

    setCustomers((current) =>
      current.filter((id) => !expired.includes(id))
    );

    setScore((current) => Math.max(0, current - expired.length * 5));
    setExpression("sad");
  }, [now, screen, customers, deadlines]);

  return (
    <main
      className={`${pixelify.className} fixed inset-0 overflow-hidden bg-[#241e25]`}
    >
      {/* Center the scene in the window */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="relative origin-center overflow-hidden"
          style={{
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            transform: `scale(${sceneScale ?? 1})`,
            visibility: sceneScale === null ? "hidden" : "visible",
          }}
        >
          <img
            src="/Sprites/Background.png"
            alt="Cat cafe"
            className="absolute inset-0 h-full w-full"
            style={{ imageRendering: "pixelated" }}
          />

          {screen === null && (
            <>
              {/* Positions are measured inside the fixed scene */}
              <div
                className="absolute z-30"
                style={{
                  left: 1600,
                  top: 510,
                  width: 220,
                  height: 220,
                }}
              >
                {/* Coffee button */}
                <button
                  type="button"
                  aria-label="Add coffee"
                  onClick={() => fillCup("coffee")}
                  className="
                    absolute left-[9%] top-[5%] h-[10%] w-[10%]
                    cursor-pointer rounded border-2 border-[#513323]
                    bg-[#795548]
                  "
                />

                {/* Milk button */}
                <button
                  type="button"
                  aria-label="Add milk"
                  onClick={() => fillCup("milk")}
                  className="
                    absolute left-[34%] top-[5%] h-[10%] w-[10%]
                    cursor-pointer rounded border-2 border-[#513323]
                    bg-[#fff1d6]
                  "
                />

                {/* Tea button */}
                <button
                  type="button"
                  aria-label="Add tea"
                  onClick={() => fillCup("tea")}
                  className="
                    absolute left-[59%] top-[5%] h-[10%] w-[10%]
                    cursor-pointer rounded border-2 border-[#513323]
                    bg-[#91a477]
                  "
                />

                {/* Place or retrieve a cup */}
                <button
                  type="button"
                  aria-label={
                    machineCup === null ? "Place cup on machine" : "Pick up machine cup"
                  }
                  onClick={(event) => {
                    setMouse({ x: event.clientX, y: event.clientY });
                    handleMachineCup();
                  }}
                  className="
                    absolute bottom-[31%] left-[40%]
                    flex h-[85px] w-[100px] -translate-x-1/2
                    items-center justify-center
                    cursor-pointer border-0 bg-transparent p-0
                  "
                  >
                  {machineCup !== null && <Cup type={machineCup} />}
                </button>
              </div>

              <div className="absolute left-[56%] top-[38%] z-10 scale-[1.5]">
                <Catrista expression={expression} />
              </div>

              {/* Lay out active customers in queue order. Removing one shifts the remaining customers left. */}
              {customers.map((id, index) => (
                <div
                  key={id}
                  className="absolute top-[85%] z-40 scale-[1.10]"
                  style={{ left: 240 + index * 330 }}
                >
                  <div className="relative h-[125px] w-[100px] origin-bottom scale-[3]">
                    <Customer
                      customerId={id}
                      onOrderReady={registerOrder}
                      fishReceived={Boolean(fishDelivered[id])}
                      drinkReceived={Boolean(drinkDelivered[id])}
                      secondsRemaining={Math.max(
                        0,
                        ((deadlines[id] ?? now) - now) / 1000
                      )}
                    />

                    {/* A transparent button covers the cat and routes the held item to its delivery handler. */}
                    <button
                      type="button"
                      aria-label="Give carried item to this customer"
                      disabled={!carryingFish && carryingCup === null}
                      onClick={() => {
                        if (carryingFish) {
                          giveFish(id);
                        } else if (carryingCup !== null) {
                          giveCup(id);
                        }
                      }}
                      className="
                        absolute inset-0 z-30 h-full w-full
                        cursor-pointer border-0 bg-transparent p-0
                        disabled:pointer-events-none
                      "
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                aria-label="Discard held item"
                disabled={!carryingFish && carryingCup === null}
                onClick={() => {
                  setCarryingCup(null);
                  setCarryingFish(false);
                }}
                className="
                  absolute bottom-[20px] right-[20px] z-40
                  border-4 border-[#513323]
                  bg-[#c77b47] px-5 py-3
                  font-bold text-[#fff1d6]
                  cursor-pointer hover:bg-[#dc945c]
                  disabled:cursor-default disabled:opacity-50
                "
              >
                Discard Item
              </button>

              {/* Shelf fish are an unlimited supply. Picking one up disables all shelf pickups until hands are free. */}
              {/* Fish on the counter */}
              <button
                aria-label="Pick up fish"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingFish(true);
                }}
                className="
                  absolute left-[38%] top-[52%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <img
                  src="/Sprites/Fish.png"
                  alt=""
                  draggable={false}
                  className="h-[75px] w-[90px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>

              <button
                aria-label="Pick up fish"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingFish(true);
                }}
                className="
                  absolute left-[45%] top-[52%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <img
                  src="/Sprites/Fish.png"
                  alt=""
                  draggable={false}
                  className="h-[75px] w-[90px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>

              <button
                aria-label="Pick up fish"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingFish(true);
                }}
                className="
                  absolute left-[38%] top-[42%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <img
                  src="/Sprites/Fish.png"
                  alt=""
                  draggable={false}
                  className="h-[75px] w-[90px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>

              <button
                aria-label="Pick up fish"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingFish(true);
                }}
                className="
                  absolute left-[45%] top-[42%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <img
                  src="/Sprites/Fish.png"
                  alt=""
                  draggable={false}
                  className="h-[75px] w-[90px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>

              <button
                aria-label="Pick up fish"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingFish(true);
                }}
                className="
                  absolute left-[38%] top-[32%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <img
                  src="/Sprites/Fish.png"
                  alt=""
                  draggable={false}
                  className="h-[75px] w-[90px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>

              <button
                aria-label="Pick up fish"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingFish(true);
                }}
                className="
                  absolute left-[45%] top-[32%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <img
                  src="/Sprites/Fish.png"
                  alt=""
                  draggable={false}
                  className="h-[75px] w-[90px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>

              {/* Each shelf button supplies an empty cup; preparation happens on the machine. */}
              {/* Cup shelf */}
              <button
                type="button"
                aria-label="Pick up an empty cup"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingCup("empty");
                }}
                className="
                  absolute left-[76%] top-[32%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <Cup type="empty" />
              </button>
              <button
                type="button"
                aria-label="Pick up an empty cup"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingCup("empty");
                }}
                className="
                  absolute left-[76%] top-[42%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <Cup type="empty" />
              </button>
              <button
                type="button"
                aria-label="Pick up an empty cup"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingCup("empty");
                }}
                className="
                  absolute left-[76%] top-[52%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <Cup type="empty" />
              </button>
              <button
                type="button"
                aria-label="Pick up an empty cup"
                disabled={carryingFish || carryingCup !== null}
                onClick={(event) => {
                  setMouse({ x: event.clientX, y: event.clientY });
                  setCarryingCup("empty");
                }}
                className="
                  absolute left-[83%] top-[32%] z-30
                  cursor-pointer border-0 bg-transparent p-0
                  disabled:opacity-50
                "
              >
                <Cup type="empty" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Intro stays sized for the screen */}
      {screen !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            className="
              max-h-[85vh] w-full max-w-lg overflow-y-auto
              border-4 border-[#513323]
              bg-[#fff1d6] p-8 text-center font-bold text-[#513323]
              shadow-[8px_8px_0_0_#513323]
            "
          >
            {screen === "welcome" && (
              <>
                <h1
                  id="popup-title"
                  className="mb-4 text-3xl font-bold"
                >
                  Welcome to the Cat Cafe!
                </h1>

                <p className="mb-6">
                  Development: Luna Kilpatrick and Olive Obianagha
                </p>
                <p className="mb-6">Sprite Art: Luna Kilpatrick</p>
                <p className="mb-6">Background Art: Angel Uribe</p>

                <button
                  autoFocus
                  onClick={() => setScreen("intro")}
                  className={buttonClasses}
                >
                  Next
                </button>
              </>
            )}

            {screen === "intro" && (
              <>
                <h2
                  id="popup-title"
                  className="mb-4 text-3xl font-bold"
                >
                  Introduction
                </h2>

                <p className="mb-6">
                  Your job as Panda, the catrista, is to serve your
                  kitten customers the correct order. Try to earn as many
                  points as you can!
                </p>

                <button
                  autoFocus
                  onClick={() => setScreen("rules")}
                  className={buttonClasses}
                >
                  Rules
                </button>
              </>
            )}

            {screen === "rules" && (
              <>
                <h2
                  id="popup-title"
                  className="mb-4 text-3xl font-bold"
                >
                  Rules
                </h2>

                <p className="mb-6">
                  Pick an empty cup from the shelf, place it on the
                  machine, and fill it with the customer’s drink.
                </p>

                <ul className="mb-8 space-y-4 text-left">
                  {cupRules.map((rule) => (
                    <li
                      key={rule.type}
                      className="flex items-center gap-4"
                    >
                      <Cup type={rule.type} />
                      <div>
                        <h3 className="text-xl font-bold">
                          {rule.title}
                        </h3>
                        <p>{rule.description}</p>
                      </div>
                    </li>
                  ))}

                  <li className="flex items-center gap-4">
                    <img
                      src="/Sprites/Fish.png"
                      alt="Fish"
                      className="h-[75px] w-[90px] shrink-0 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <div>
                      <h3 className="text-xl font-bold">Fish</h3>
                      <p>Customers may also order fish.</p>
                    </div>
                  </li>
                </ul>

                <button
                  onClick={() => setScreen(null)}
                  className={buttonClasses}
                >
                  Start Playing
                </button>
              </>
            )}
          </section>
        </div>
      )}

      {/* Render the held fish in screen coordinates. It cannot intercept clicks on customers or the machine. */}
      {screen === null && carryingFish && (
        <img
          src="/Sprites/Fish.png"
          alt=""
          draggable={false}
          className="pointer-events-none fixed z-[60] object-contain"
          style={{
            left: mouse.x,
            top: mouse.y,
            width: 90 * (sceneScale ?? 1),
            height: 75 * (sceneScale ?? 1),
            transform: "translate(-50%, -50%)",
            imageRendering: "pixelated",
          }}
        />
      )}

      {/* Scale the held cup to match the scene while following the pointer outside the scene transform. */}
      {screen === null && carryingCup !== null && (
        <div
          className="pointer-events-none fixed z-[60]"
          style={{
            left: mouse.x,
            top: mouse.y,
            width: 90,
            height: 75,
            transform: `translate(-50%, -50%) scale(${sceneScale ?? 1})`,
            transformOrigin: "center",
          }}
        >
          <Cup type={carryingCup} />
        </div>
      )}

      {screen === null && (
        <div
          className="
            absolute left-4 top-4 z-40
            border-4 border-[#513323]
            bg-[#fff1d6] px-5 py-3
            text-2xl font-bold text-[#513323]
            shadow-[4px_4px_0_0_#513323]
          "
        >
          {/* Score stays fixed to the window rather than scaling with the scene. */}
          Score: {score}
        </div>
      )}
    </main>
  );
}
