import SalHeader from "@/components/ui/headers/sal-header";
import ClientEventList from "@/features/events/event-list-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The List",
  description: "See the latest mural open calls and public art opportunities.",
  openGraph: {
    title: "The List | The Street Art List",
    description:
      "See the latest mural open calls and public art opportunities.",
    url: "https://thestreetartlist.com/thelist",
    type: "website",
    images: [
      {
        url: "/public/saltext.png",
        width: 1200,
        height: 630,
        alt: "The Street Art List",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The List | The Street Art List",
    description:
      "See the latest mural open calls and public art opportunities.",
    images: ["/public/saltext.png"],
  },
};

const TheList = async () => {
  return (
    <>
      <SalHeader source="thelist" />
      <ClientEventList />
    </>
  );
};

export default TheList;
