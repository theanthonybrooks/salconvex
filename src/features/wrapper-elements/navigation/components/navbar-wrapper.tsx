"use client";

import TheListNavBar from "@/app/(pages)/(artist)/thelist/components/ArtistNavbar";

import NavBar from "./navbar";

interface NavBarWrapperProps {
  type?: "public" | "thelist" | "dashboard";
}

export function NavbarWrapper({ type }: NavBarWrapperProps) {
  return (
    <>
      {type === "public" && <NavBar />}
      {type === "thelist" && <TheListNavBar />}
    </>
  );
}
