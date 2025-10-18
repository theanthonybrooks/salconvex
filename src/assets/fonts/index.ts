// // import tankerReg from "./Tanker-Regular.woff"

import {
  Bebas_Neue,
  Libre_Franklin,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import localFont from "next/font/local";

export const tankerReg = localFont({
  src: "./Tanker-Regular.woff",
  variable: "--font-tanker-reg",
});

export const spaceMono = Space_Mono({
  subsets: ["latin-ext"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin-ext"],
});

export const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin-ext"],
  weight: ["900"],
});

export const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin-ext"],
  weight: ["400"],
});
