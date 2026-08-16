import React from "react";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  [key: string]: any;
}

export function IndianRupee({
  size = 24,
  color = "#6b7280",
  strokeWidth = 2,
  ...props
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M6 3h12" />
      <Path d="M6 8h12" />
      <Path d="M6 13l8.5 8" />
      <Path d="M6 13h3" />
      <Path d="M9 13c6.667 0 6.667-10 0-10" />
    </Svg>
  );
}

export function ReceiptIndianRupee({
  size = 24,
  color = "#6b7280",
  strokeWidth = 2,
  ...props
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <Path d="M8 7h8" />
      <Path d="M12 17.5 8 15h1a4 4 0 0 0 0-8" />
      <Path d="M8 11h6" />
    </Svg>
  );
}

export default IndianRupee;
