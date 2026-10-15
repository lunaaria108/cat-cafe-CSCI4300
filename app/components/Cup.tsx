// The cup states used by the shelf, machine, and customer orders.
export type CupType =
  | "empty"
  | "coffee"
  | "tea"
  | "milkCoffee"
  | "milkTea";

// Match each cup type to its position in the sprite sheet.
// Frames are numbered from left to right, starting at zero.
const spriteIndex: Record<CupType, number> = {
  empty: 0,
  coffee: 1,
  tea: 3,
  milkCoffee: 2,
  milkTea: 4,
};

type CupProps = {
  type: CupType;

  // Optional extra styling supplied wherever the cup is displayed.
  className?: string;
};

// Display a cup sprite. Pickup, filling, and delivery logic live in Home.
export default function Cup({ type, className = "" }: CupProps) {
  return (
    <span
      role="img"
      aria-label={`${type} cup`}
      // Display one frame and prevent flex layouts from shrinking it.
      className={`inline-block h-[75px] w-[90px] shrink-0 ${className}`}
      style={{
        backgroundImage: "url('/Sprites/Cups.png')",
        backgroundRepeat: "no-repeat",

        // Scale the 1500 × 250 sheet to 450 × 75.
        // Each of its five frames is now 90 × 75.
        backgroundSize: "450px 75px",

        // Shift the sheet left to reveal the requested cup.
        backgroundPosition: `${spriteIndex[type] * -90}px 0px`,

        // Preserve sharp pixel edges when scaled.
        imageRendering: "pixelated",
      }}
    />
  );
}