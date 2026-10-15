// Home uses this type to control the barista's expression.
export type Expression = "neutral" | "happy" | "sad";

// Each expression corresponds to a frame in the sprite sheet,
// ordered from left to right.
const frames: Record<Expression, number> = {
  neutral: 0,
  happy: 1,
  sad: 2,
};

type CatristaProps = {
  expression: Expression;
};

// This component displays the expression chosen by Home.
// Order checking and the timer that resets it are handled in Home.
export default function Catrista({ expression }: CatristaProps) {
  return (
    <div
      role="img"
      aria-label={`Cat catrista looking ${expression}`}
      // Show one 250 × 220 frame at a time.
      className="h-[220px] w-[250px]"
      style={{
        // The complete sheet contains three frames across.
        backgroundImage: "url('/Sprites/Catrista.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "750px 220px",

        // Shift the sheet left to reveal the selected expression.
        backgroundPosition: `${frames[expression] * -250}px 0px`,

        // Keep pixel edges sharp when the component is scaled.
        imageRendering: "pixelated",
      }}
    />
  );
}