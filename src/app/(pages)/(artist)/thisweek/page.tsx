import SalHeader from "@/components/ui/headers/sal-header";
import ClientThisWeekList from "@/features/events/thisweek-list-client";

export const metadata = {
  title: "This Week",
  description:
    "See the latest mural open calls and public art opportunities ending this week.",
  openGraph: {
    title: "This Week | The Street Art List",
    description:
      "See the latest mural open calls and public art opportunities ending this week.",
    url: "https://thestreetartlist.com/thisweek",
    type: "website",
    images: [
      {
        url: "/public/thisweek_logo.png",
        width: 1200,
        height: 630,
        alt: "This Week's Street Art Opportunities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "This Week | The Street Art List",
    description:
      "See the latest mural open calls and public art opportunities ending this week.",
    images: ["/public/thisweek_logo.png"],
  },
};

const ThisWeekPage = async () => {
  return (
    <>
      <SalHeader source="thisweek" />
      <ClientThisWeekList />
    </>
  );
};

export default ThisWeekPage;
