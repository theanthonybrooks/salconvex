import styled from "styled-components";

import { cn } from "@/helpers/utilsFns";

const BallGroup = ({
  scale = 1,
  delay = 0,
}: {
  scale?: number;
  delay?: number;
}) => {
  return (
    <div className={cn("ball-group")} style={{ scale: `${scale}` }}>
      <div className="circle" style={{ animationDelay: `${delay}s` }} />
      <div className="shadow" style={{ animationDelay: `${delay}s` }} />
    </div>
  );
};
type LoadingBallsProps = {
  numberOfBalls?: number;
  scale?: number;
};

export const LoadingBalls = ({
  numberOfBalls = 2,
  scale,
}: LoadingBallsProps) => {
  return (
    <StyledWrapper>
      {Array.from({ length: numberOfBalls }, (_, i) => i + 1).map((_, i) => (
        <BallGroup key={i} scale={scale} delay={i * 0.2} />
      ))}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 6rem;
  height: 200px;
  position: relative;

  .ball-group {
    position: relative;
    width: 20px;
    /* scale: 2; */
  }

  .circle {
    width: 20px;
    height: 20px;
    position: absolute;
    border-radius: 50%;

    background-color: #0e0e0e;
    transform-origin: 50%;
    animation: bounce 0.5s alternate infinite ease;
  }

  @keyframes bounce {
    0% {
      bottom: 0%;
      transform: scaleX(1.4) scaleY(0.6);
      border-radius: 50px 50px 25px 25px;
    }

    /* Launch — rapid stretch upward */
    10% {
      transform: scaleX(0.9) scaleY(1.2);
      bottom: 10px;
    }

    /* Rising — slowing as it reaches the top */
    40% {
      bottom: 80px;
      transform: scaleX(1.05) scaleY(0.95);
      border-radius: 50%;
    }

    /* Apex — slight hang time before falling */
    50% {
      bottom: 85px;
      transform: scaleX(1) scaleY(1);
    }

    /* Fall — accelerating down, slight stretch */
    60% {
      bottom: 10px;
      transform: scaleX(0.95) scaleY(1.1);
    }

    /* Impact — squash wider and shorter */
    90% {
      bottom: 0%;
      transform: scaleX(1.6) scaleY(0.5);
      border-radius: 50px 50px 25px 25px;
    }

    /* Settle — minor stretch recovery */
    100% {
      bottom: 0%;
      transform: scaleX(1.3) scaleY(0.7);
      border-radius: 50px 50px 25px 25px;
    }
  }

  .shadow {
    width: 20px;
    height: 4px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.9);
    position: absolute;
    bottom: 2px;
    filter: blur(1px);
    animation: shadowAnim 0.5s alternate infinite ease;
  }

  @keyframes shadowAnim {
    0% {
      transform: scaleX(1.5);
      opacity: 0.7;
    }
    50% {
      transform: scaleX(0.2);
      opacity: 0;
    }
    100% {
      transform: scaleX(1.3);
      opacity: 0.6;
    }
  }
`;
