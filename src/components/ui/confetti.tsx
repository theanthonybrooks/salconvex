// components/ConfettiBlast.js
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface ConfettiBlastProps {
  active: boolean;
}

export default function ConfettiBlast({ active }: ConfettiBlastProps) {
  const { width, height } = useWindowSize();
  if (!active || !width || !height) return null;
  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={400}
      recycle={false}
      className="z-top"
    />
  );
}
