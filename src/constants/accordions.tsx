import { Link } from "@/components/ui/custom-link";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { JSX } from "react";

// Define the types
interface AccordionItem {
  subtitle: string;
  text: string[] | string | JSX.Element;
}

export const iconOpenClass =
  "open transition-all duration-400 absolute right-4 top-4 origin-center";
export const iconClosedClass =
  "closed transition-all duration-400 absolute right-4 top-4 origin-center";

export interface AccordionSection {
  name?: string | null;
  title?: string | null;
  description?: string | null;
  items: AccordionItem[];
  icon?: JSX.Element;
  iconOpen?: JSX.Element;
  iconClosed?: JSX.Element;
  firstOpen?: boolean;
  isList?: boolean;
  listStyle?: string;
  accordionWidth?: string;
}

// Annotate the constant with the type
export const faqs: AccordionSection = {
  name: null,
  title: "FAQ",
  description:
    "Curious why I do all of this? Hopefully, these answers will help to clarify some things",
  // icon: <HelpCircle className='h-4 w-4' />,
  iconClosed: <Plus className={cn("mr-1 h-4 w-4", iconClosedClass)} />,
  iconOpen: <Minus className={cn("mr-1 h-4 w-4", iconOpenClass)} />,

  items: [
    {
      subtitle: "Who's behind The List?",
      text: (
        <p>
          At the moment, it&apos;s just me,{" "}
          <Link
            href="https://www.instagram.com/anthonybrooksart"
            className="font-bold"
            target="_blank"
          >
            Anthony Brooks
          </Link>
          . I&apos;ve collaborated with{" "}
          <Link
            href="https://www.instagram.com/yessiow"
            target="_blank"
            className="font-bold"
          >
            Yessi
          </Link>{" "}
          from{" "}
          <Link
            href="https://www.instagram.com/streetartcalls"
            className="font-bold"
            target="_blank"
          >
            Street Art Calls
          </Link>{" "}
          in the past to get the word out about the project as well as{" "}
          <Link
            href="https://www.instagram.com/creagiovane"
            target="_blank"
            className="font-bold"
          >
            Giovane
          </Link>{" "}
          from{" "}
          <Link
            href="https://www.instagram.com/sticker_pasteup_fest_world_map"
            className="font-bold"
            target="_blank"
          >
            Stick & PasteUp Fest World Map
          </Link>{" "}
          to gather many of the sticker and pasteup events/projects, but
          otherwise the work on gathering and maintaining the list and coding,
          updating, and managing this website has all been done by me. Crazy,
          right?
        </p>
      ),
    },
    {
      subtitle: "How is the list updated?",
      text: "Since 2019 up until now (April 2025), it's been manually updated. I look through all of the events, follow them on socials, newsletters, check websites, have google search alerts, and have had a handful actually submit the events to me. With this version of the site, I'm working on a much better application submission system that will hopefully make this just... so much easier for everyone involved.",
    },
    {
      subtitle: "Why is it paid? It was free.",
      text: (
        <p>
          This is complicated for me. I have fought for years to keep this free,
          but as the work compounded by just the sheer number of people now
          using it, it went from something that I spend an hour or 2 per day
          checking/updating to something that many times, would take 40-80
          hours+ per week for the entirety of winter. All while juggling
          applying for open calls myself so I could make enough money to keep
          funding the work that I&apos;m doing here without burdening other
          artists. And in the other months while painting, it would have low
          swings since I couldn&apos;t do that and paint, and then would pick
          back up in fall.
          <br />
          <br /> This isn&apos;t feasible. Especially not in the longterm. So I
          decided that I would ask a small monthly fee in return for all of the
          work that I&apos;m doing. If you&apos;re still unable to pay that,{" "}
          <Link
            href="mailto:thestreetartlist@gmail.com"
            className="underline underline-offset-2"
          >
            contact me
          </Link>{" "}
          and we&apos;ll work something out. I don&apos;t want this to be a
          paywall that stops people from being able to survive, but I also want
          the value in what I&apos;m doing to be recognized as it&apos;s not
          just reposting on IG and it does take an insane amount of work to do.
        </p>
      ),
    },
    {
      subtitle: "What do I get if I subscribe?",
      text: (
        <>
          <p>
            Easy, you get access to the full list. Without paying, you&apos;ll
            still have access to the list in some form, but only as a very
            detailed archive and event calendar. You won&apos;t be able to view
            open calls, apply, bookmark, keep track of applications, or really
            anything else. I will still show a limited number of open calls each
            month, so you won&apos;t completely miss out, plus there&apos;s a
            2-week free trial to see how it all works.
          </p>
          <p className="mt-5">Besides that, it varies by tier what you get:</p>{" "}
          <ol className="m-auto list-disc space-y-2 p-3 pl-10">
            <li>
              The basic tier <b>(Original Cap) </b>just gives you access to all
              of the calls and ability to keep track of your applications,
              bookmark, hide, etc. Full functionality.
            </li>
            <li>
              The mid tier that I recommend <b>(Banana Cap) </b>gives you
              everything from the previous tier, with the addition of automated
              reminders for new calls, deadline reminders, the newsletter, and
              earlier access to new paid features as I&apos;m always working on
              adding things.
            </li>
            <li>
              The highest tier <b>(Fat Cap)</b> is more for those that want to
              and are able to pay a bit more. As with the others, you&apos;ll
              still have access to everything, but with your name featured on
              the site as a top supporter. I had this with Patreon and several
              people were Fat Cap patrons, so I wanted to carry that over to the
              site. You&apos;ll get first access to new site features, the
              ability to give input while I&apos;m beta-testing new things, and
              if there&apos;s anything else that I come up with, you&apos;ll be
              the first to see it.
            </li>{" "}
          </ol>
        </>
      ),
    },
    {
      subtitle: "What about for organizers?",
      text: "For organizers, you can always list your events for free. For open calls, if the event is a graffiti jam, pasteup/sticker project, street art festival, or a mural project with a really low budget, you can always list for free. If you have a project budget, then I just ask for a MAX of a 1% listing fee (starting at $50). And the first open call listed is free so you can see what I'm offering. I'm actively working on building an application system as well, so that will be included in the 1% fee when that's released. I don't allow for organizers to charge application fees for artists to apply. Any events with that notation on The List are external links and are only to ensure that artists are aware before clicking through. ",
    },
    {
      subtitle: "Why charge here and not just do a Patreon/Buy Me A Coffee?",
      text: (
        <span>
          I tried both of those.{" "}
          <Link
            href="https://buymeacoffee.com/thestreetartlist"
            target="_blank"
            className="font-bold"
          >
            Buy Me A Coffee
          </Link>{" "}
          was nice as it gave people the option for a one-off payment of
          whatever amount. Patreon was nice because people know the name.
          Neither was great for actually supporting the ongoing development of
          The Street Art List, though, as one-time payments don&apos;t continue
          to pay for the work that I do, and{" "}
          <Link
            href="https://patreon.com/thestreetartlist"
            target="_blank"
            className="font-bold"
          >
            Patreon
          </Link>{" "}
          takes a stupid amount of the support as fees AND adds a percentage on
          top, so people were paying more in different places, which I&apos;m
          really not a fan of. So I&apos;m handling the subscriptions myself, so
          that I can charge less and still get enough to continue the site for
          years to come.
        </span>
      ),
    },
    {
      subtitle: "What if I don't want to pay? Can I cancel?",
      text: "Yep, you can cancel at any time and you'll keep the benefits of your subscription for the remainder of that billing period. You can also access your invoices and manage your subscription from the billing portal at any time.",
    },
  ],
};

export const changelog2025: AccordionSection = {
  description: "2025",
  iconClosed: <Plus className={cn("mr-1 h-4 w-4", iconClosedClass)} />,
  iconOpen: <Minus className={cn("mr-1 h-4 w-4", iconOpenClass)} />,
  firstOpen: true,
  isList: true,
  listStyle: "list-none",
  accordionWidth: "w-3xl max-w-[90vw]",

  items: [
    {
      subtitle: "February 2025",
      text: [
        "2.5: Improved SEO optimization to enhance search engine visibility and drive more organic traffic to the site.",
        "2.12: Fixed issues with the payment processing system to ensure smooth and secure transactions for users.",
        "2.22: Added new integrations with third-party services to expand the functionality and versatility of the platform.",
      ],
    },
    {
      subtitle: "January 2025",
      text: [
        "1.2: Added dark mode support to provide a better user experience for those who prefer a darker interface.",
        "1.15: Refactored the codebase for better maintainability, making it easier to add new features and fix bugs.",
        "1.25: Released the new version of the starter kit with updated features and improvements based on user feedback.",
      ],
    },
  ],
};
export const changelog2024: AccordionSection = {
  description: "2024",
  iconClosed: <Plus className={cn("mr-1 h-4 w-4", iconClosedClass)} />,
  iconOpen: <Minus className={cn("mr-1 h-4 w-4", iconOpenClass)} />,
  firstOpen: false,
  isList: true,
  listStyle: "list-none",
  accordionWidth: "w-[800px] max-w-[90vw]",

  items: [
    {
      subtitle: "December 2024",
      text: [
        "12.3: Improved performance of the API to reduce response times and handle more concurrent requests.",
        "12.10: Launched the new pricing page with detailed information about the different plans and their benefits.",
        "12.18: Updated the documentation to include the latest features and provide clearer instructions for users.",
      ],
    },
    {
      subtitle: "November 2024",
      text: [
        "11.5: Improved the landing page design to make it more visually appealing and user-friendly.",
        "11.12: Fixed bugs in the authentication flow to ensure a seamless login and registration experience for users.",
        "11.20: Added new features to the dashboard to provide more insights and control for users.",
      ],
    },
    {
      subtitle: "October 2024",
      text: [
        "10.1: Added new features to the admin panel to give administrators more control and flexibility.",
        "10.11: Fixed bugs in the user registration flow to make the sign-up process smoother and more reliable.",
        "10.21: Released the new version of the desktop app with enhanced performance and new features.",
      ],
    },
    {
      subtitle: "September 2024",
      text: [
        "9.2: Improved the performance of the site to ensure faster load times and a better user experience.",
        "9.12: Launched the new marketing campaign to promote the latest features and attract new users.",
        "9.22: Updated the privacy policy to comply with the latest regulations and provide more transparency to users.",
      ],
    },
    {
      subtitle: "August 2024",
      text: [
        "8.5: Added new security features to protect user data and prevent unauthorized access.",
        "8.15: Fixed issues with the email notifications to ensure timely and accurate communication with users.",
        "8.25: Released the new version of the API with improved performance and additional endpoints.",
      ],
    },
    {
      subtitle: "July 2024",
      text: [
        "7.3: Improved the accessibility of the site to make it more usable for people with disabilities.",
        "7.13: Launched the new support center to provide users with better assistance and resources.",
        "7.23: Updated the terms of service to reflect the latest changes and provide more clarity to users.",
      ],
    },
    {
      subtitle: "June 2024",
      text: [
        "6.4: Added new analytics features to provide users with more insights and data about their usage.",
        "6.14: Fixed bugs in the notification system to ensure users receive timely and accurate alerts.",
        "6.24: Released the new version of the mobile app with improved performance and new features.",
      ],
    },
    {
      subtitle: "May 2024",
      text: [
        "5.1: Launched the new blog section to share updates, tips, and insights with users.",
        "5.10: Updated the user profile page to provide more customization options and a better user experience.",
        "5.20: Improved the responsiveness of the site to ensure it works well on all devices and screen sizes.",
      ],
    },
    {
      subtitle: "April 2024",
      text: [
        "4.5: Improved SEO optimization to enhance search engine visibility and drive more organic traffic to the site.",
        "4.12: Fixed issues with the payment processing system to ensure smooth and secure transactions for users.",
        "4.22: Added new integrations with third-party services to expand the functionality and versatility of the platform.",
      ],
    },
    {
      subtitle: "March 2024",
      text: [
        "3.2: Added dark mode support to provide a better user experience for those who prefer a darker interface.",
        "3.15: Refactored the codebase for better maintainability, making it easier to add new features and fix bugs.",
        "3.25: Released the new version of the starter kit with updated features and improvements based on user feedback.",
      ],
    },
    {
      subtitle: "February 2024",
      text: [
        "2.3: Improved performance of the API to reduce response times and handle more concurrent requests.",
        "2.10: Launched the new pricing page with detailed information about the different plans and their benefits.",
        "2.18: Updated the documentation to include the latest features and provide clearer instructions for users.",
      ],
    },
    {
      subtitle: "January 2024",
      text: [
        "1.5: Updated the landing page design to make it more visually appealing and user-friendly.",
        "1.12: Fixed bugs in the authentication flow to ensure a seamless login and registration experience for users.",
        "1.20: Added new features to the dashboard to provide more insights and control for users.",
      ],
    },
  ],
};
