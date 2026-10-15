"use client";

import { useEffect, useRef, useState } from "react";
import Cup, { type CupType } from "./Cup";

// Customers can request any drink, but never an empty cup.
type Drink = Exclude<CupType, "empty">;

// An order can contain a drink, fish, or both.
export type Order = {
  drink: Drink | null;
  fish: boolean;
};

// Each customer has a cat sprite and an individual order.
type CustomerData = {
  sprite: number;
  order: Order;
};

const drinks: Drink[] = ["coffee", "tea", "milkCoffee", "milkTea"];

// Randomly choose one of four cats and one of three order categories.
function generateCustomer(): CustomerData {
  // 0 = drink only, 1 = drink and fish, 2 = fish only.
  const orderType = Math.floor(Math.random() * 3);

  return {
    sprite: Math.floor(Math.random() * 4),
    order: {
      drink:
        orderType === 2
          ? null
          : drinks[Math.floor(Math.random() * drinks.length)],
      fish: orderType !== 0,
    },
  };
}

// Home manages deliveries and timing, then passes their status here.
type CustomerProps = {
  customerId: number;
  onOrderReady: (id: number, order: Order) => void;
  fishReceived: boolean;
  drinkReceived: boolean;
  secondsRemaining: number;
};

export default function Customer({
  customerId,
  onOrderReady,
  fishReceived,
  drinkReceived,
  secondsRemaining,
}: CustomerProps) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  // Generate the customer after mounting and report their order to Home.
  // Keeping onOrderReady stable in Home prevents unnecessary regeneration.
  useEffect(() => {
    const generated = generateCustomer();

    setCustomer(generated);
    onOrderReady(customerId, generated.order);
  }, [customerId, onOrderReady]);

  // Remember the starting time so the bar shrinks relative to this
  // customer's original patience, rather than the current difficulty.
  const initialPatience = useRef(secondsRemaining);

  // Convert remaining seconds to a fraction between 0 and 1.
  // The fallback avoids dividing by zero.
  const patienceFraction = Math.max(
    0,
    Math.min(1, secondsRemaining / (initialPatience.current || 1))
  );

  // Wait until the customer's sprite and order have been generated.
  if (!customer) return null;

  return (
    // The outer container moves the whole customer into the scene.
    <div className="customer-arrival">
      {/* The inner container makes the cat, bubble, and meter hop together. */}
      <div className="customer-hop relative">
        {/* Patience meter sits above the cat and does not block clicks. */}
        <div
          className="
            pointer-events-none absolute -top-[12px] left-1/2 z-20
            w-[60px] -translate-x-1/2
          "
        >
          <div
            role="progressbar"
            aria-label="Customer patience"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(patienceFraction * 100)}
            className="
              h-[7px] overflow-hidden
              border border-[#513323] bg-[#fff1d6]
              shadow-[1px_1px_0_#513323]
            "
          >
            {/* Green above 50%, yellow above 25%, otherwise red. */}
            <div
              className={`h-full transition-[width] duration-100 ease-linear ${
                patienceFraction > 0.5
                  ? "bg-[#91a477]"
                  : patienceFraction > 0.25
                    ? "bg-[#e5b65a]"
                    : "bg-[#cc6767]"
              }`}
              style={{ width: `${patienceFraction * 100}%` }}
            />
          </div>

          {/* Round upward so the label shows whole seconds remaining. */}
          <p className="mt-[1px] text-center text-[5px] font-bold text-[#513323]">
            {Math.ceil(secondsRemaining)}s
          </p>
        </div>

        {/* The thought bubble displays only items still awaiting delivery. */}
        <div
          className="
            absolute top-[-20%] left-[75px] z-10
            flex w-max -translate-x-1/2 items-center gap-2
            rounded-full border-2 border-[#513323]
            bg-[#fff1d6] px-4 py-3 origin-bottom scale-[0.5]
          "
        >
          {/* Hide the requested drink after it has been served. */}
          {customer.order.drink && !drinkReceived && (
            <div className="flex h-[45px] w-[54px] items-center justify-center">
              <div className="flex shrink-0 scale-[0.6]">
                <Cup type={customer.order.drink} />
              </div>
            </div>
          )}

          {/* Hide the fish after it has been served. */}
          {customer.order.fish && !fishReceived && (
            <img
              src="/Sprites/Fish.png"
              alt="Fish"
              className="h-[40px] w-[54px] shrink-0 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          )}

          {/* Decorative dots connect the thought bubble to the cat. */}
          <span
            aria-hidden="true"
            className="
              absolute -bottom-4 left-1/2
              h-3 w-3 rounded-full
              border-2 border-[#513323] bg-[#fff1d6]
            "
          />

          <span
            aria-hidden="true"
            className="
              absolute -bottom-7 left-[45%]
              h-2 w-2 rounded-full
              border border-[#513323] bg-[#fff1d6]
            "
          />
        </div>

        {/* The 800 × 250 sheet contains four 200 × 250 frames.
            Display it at half size and shift it to reveal the chosen cat.
            Home applies any additional scaling to the whole component. */}
        <div
          role="img"
          aria-label="Cat customer"
          className="h-[125px] w-[100px] origin-bottom scale-[1]"
          style={{
            backgroundImage: "url('/Sprites/Kitstumers.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "400px 125px",
            backgroundPosition: `${customer.sprite * -100}px 0px`,
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}