import React from "react";

interface Props {
  className?: string;
  width?: string;
  stroke?: string;
  strokeWidth?: string;
  fill?: string;
}

const SpeechBubble: React.FC<Props> = ({
  className,
  width = "",
  strokeWidth = "",
  stroke = "black",
  fill = "white",
}) => {
  // Calculate the aspect ratio based on the viewBox dimensions.
  const ratio = 221 / 360;
  // Remove "px" from the width to perform the calculation.
  const numericWidth = parseFloat(width);
  const computedHeight = `${numericWidth * ratio}px`;

  return (
    <svg
      width={width}
      height={computedHeight}
      viewBox="0 0 360 221"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_3_2)">
        <path
          d="M10.21 4C6.78 4 4 6.78 4 10.21V160.92C4 164.35 6.78 167.13 10.21 167.13H37.73C40.02 167.63 40.86 169.33 42.42 171.02L84.53 216.44L85.84 169.48C85.89 168.57 86.45 167.75 87.3 167.42C87.78 167.23 89.54 167.13 90.07 167.13H349.15C352.58 167.13 355.36 164.35 355.36 160.92V10.21C355.36 6.78 352.58 4 349.15 4H10.21Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3_2">
          <rect width="359.37" height="220.44" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SpeechBubble;
