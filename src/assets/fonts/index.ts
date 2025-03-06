// // import tankerReg from "./Tanker-Regular.woff"

import { Space_Grotesk, Space_Mono } from "next/font/google"
import localFont from "next/font/local"

export const tankerReg = localFont({
  src: "./Tanker-Regular.woff",
  variable: "--font-tanker-reg",
})

export const spaceMono = Space_Mono({
  subsets: ["latin-ext"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
})

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin-ext"],
})
