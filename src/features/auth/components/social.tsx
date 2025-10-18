"use client";

import { Button } from "@/components/ui/button";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export const Social = () => {
  return (
    <div className="flex w-full items-center gap-x-2">
      <Button
        className="w-full"
        size="lg"
        variant="salWithShadowHidden"
        onClick={() => {}}
      >
        <FcGoogle />
        Google
      </Button>
      <Button
        className="w-full"
        size="lg"
        variant="salWithShadowHidden"
        onClick={() => {}}
      >
        <FaApple />
        Apple
      </Button>
    </div>
  );
};
