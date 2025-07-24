import { Link } from "@/components/ui/custom-link";
import { supportEmail } from "@/constants/siteInfo";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { JSX } from "react";

// Define the types
interface AccordionItem {
  subtitle: string;
  text: string[] | string | JSX.Element;
  id?: string;
}

export const iconOpenClass =
  "open transition-all duration-400 absolute right-4 top-5 origin-center";
export const iconClosedClass =
  "closed transition-all duration-400 absolute right-4 top-5 origin-center";

export interface AccordionSection {
  name?: string | null;
  title?: string | null;
  sectionTitle?: string | null;
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
// #region ------------- General FAQs --------------
// Annotate the constant with the type
export const generalFaqs: AccordionSection = {
  name: null,
  // title: "FAQ",
  sectionTitle: "General Questions",

  // icon: <HelpCircle className='h-4 w-4' />,
  iconClosed: <Plus className={cn("mr-1 h-4 w-4", iconClosedClass)} />,
  iconOpen: <Minus className={cn("mr-1 h-4 w-4", iconOpenClass)} />,

  items: [
    {
      id: "origin",
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
      id: "how",
      subtitle: "How is the list updated?",
      text: "Since 2019 up until now (April 2025), it's been manually updated. I look through all of the events, follow them on socials, newsletters, check websites, have google search alerts, and have had a handful actually submit the events to me. With this version of the site, I'm working on a much better application submission system that will hopefully make this just... so much easier for everyone involved.",
    },

    {
      id: "patreon",
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
          really not a fan of. So I&apos;m handling the memberships myself, so
          that I can charge less and still get enough to continue the site for
          years to come.
        </span>
      ),
    },

    {
      id: "Instagram",
      subtitle: "Is there an Instagram?",
      text: (
        <span>
          {" "}
          Yes, there is an Instagram. You can follow me on Instagram{" "}
          <Link
            href="https://www.instagram.com/thestreetartlist"
            target="_blank"
          >
            @thestreetartlist
          </Link>{" "}
          to see highlights of upcoming and current open calls, polls and other
          site-related things meant to help artists and project organizers. I
          also have accounts on{" "}
          <Link href="https://facebook.com/thestreetartlist" target="_blank">
            Facebook
          </Link>{" "}
          and{" "}
          <Link href="https://threads.com/@thestreetartlist" target="_blank">
            Threads
          </Link>
        </span>
      ),
    },
    {
      id: "newsletter",
      subtitle: "Is there a newsletter?",
      text: "Yes, there is a newsletter. You can subscribe to the newsletter to get via the signup form in the website footer. In past months, the newsletter has been on hiatus while I've been working on the site. I'm planning to resume it soon!",
    },
  ],
};
// #endregion
// #region ------------- Open Call FAQs --------------
export const openCallFaqs: AccordionSection = {
  name: null,
  // title: "FAQ",
  sectionTitle: "Open Calls",

  // icon: <HelpCircle className='h-4 w-4' />,
  iconClosed: <Plus className={cn("mr-1 h-4 w-4", iconClosedClass)} />,
  iconOpen: <Minus className={cn("mr-1 h-4 w-4", iconOpenClass)} />,

  items: [
    {
      id: "call-formats",
      subtitle: "RFQ vs RFP vs RFA",
      text: "RFQ is an open call in which you ask for artists to submit their previous work/qualifications — no designs/proposals. RFP is the opposite, in which you require artists to do a design — ideally with a design fee — prior to your selection. RFA is for artists to submit their already existing works for events like sticker and pasteup festivals/meetups",
    },
    {
      id: "all-inclusive",
      subtitle: "All-inclusive budgets",
      text: (
        <p>
          Term used to describe whether the project budget is provided with no
          other additional support (ie no design fee, no equipment, etc). If not
          &quot;All-inclusive&quot;, then the project budget is provided with
          additional support beyond the artist stipend.
        </p>
      ),
    },
    {
      id: "app-fees",
      subtitle: "Application Fees",
      text: "Application fees (highly discouraged) are clearly identified on all open calls to clearly let artists know if they will be required to pay a fee to apply. Free open calls cannot have application fees.",
    },
    {
      id: "submission-costs",
      subtitle: "Submission Costs",
      text: (
        <span>
          <p>
            Events are always fee to submit. Open calls are free for Graffiti
            Jams, Pasteup/Sticker Projects, Street Art Festivals, and Mural
            Projects with a budget of $1,000 or less.
          </p>

          <p>
            Otherwise, the fee is on a sliding scale with breakpoints being $50
            (up to $5,000 budget), $100 (up to $10,000 budget), $200 (up to
            $20,000 budget), and $250 (anything above $25,000). Beyond that,
            there are no additional fees and the first open call listing is
            always free so you can see how the system works.
          </p>
        </span>
      ),
    },
  ],
};
// #endregion
// #region ------------- Pricing FAQs --------------
export const pricingFaqs: AccordionSection = {
  name: null,
  title: "FAQ",
  description:
    "What do you get with a membership? How does it work for artists vs organizers? ",
  // icon: <HelpCircle className='h-4 w-4' />,
  iconClosed: <Plus className={cn("mr-1 h-4 w-4", iconClosedClass)} />,
  iconOpen: <Minus className={cn("mr-1 h-4 w-4", iconOpenClass)} />,

  items: [
    {
      id: "trial",
      subtitle: "Is there a free trial?",
      text: "Yes, there is a free trial. You can sign up for a free trial and then cancel at any time. The trial will last for 14 days and you can decide whether you want to continue your membership or not at any time.",
    },

    {
      id: "paid",
      subtitle: "Why is it paid? It was free",
      text: (
        <p>
          The list takes an extraordinary amount of time and effort to maintain.
          I search for and manually add the majority of what&apos;s here, and I
          code and maintain the site and socials by myself. I&apos;ve always
          tried to keep it free, but have reconciled that there are costs
          involved with such work and I feel that it&apos;s worth $3 per month
          if you use it.
          <br />
          <br /> If you&apos;re still unable to pay that,{" "}
          <Link
            href={`mailto:${supportEmail}?subject=Membership%20Support`}
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
      id: "benefits",
      subtitle: "What do I get if I become a member?",
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
      id: "organizers",
      subtitle: "What about for organizers?",
      text: (
        <>
          <p>
            Accounts for organizers are free. They don&apos;t grant access to
            the open call sections of the list (aside from their own
            events/projects or archived open calls, which are public record for
            everyone).
          </p>

          <p>
            Organizers only pay a one-time fee when they want to list an open
            call with a budget of $1,000+ and listing events is always free. For
            a full pricing breakdown, see the Submission Costs section below.
          </p>
        </>
      ),
    },
    {
      id: "patreon",
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
          really not a fan of. So I&apos;m handling the memberships myself, so
          that I can charge less and still get enough to continue the site for
          years to come.
        </span>
      ),
    },
    {
      id: "submission-costs",
      subtitle: "Submission Costs",
      text: (
        <div className="space-y-2">
          <span>
            <p>
              <b>Events</b> are always fee to submit.
            </p>
            <p>
              {" "}
              <b>Open calls</b> are free for Graffiti Jams, Pasteup/Sticker
              Projects, Street Art Festivals, and Mural Projects with a budget
              less than $1,000.
            </p>
          </span>

          <span>
            <p>
              Otherwise, the fee is on a sliding scale with breakpoints being
              $50 (up to $5,000 budget), $100 (up to $10,000 budget), $200 (up
              to $20,000 budget), and $250 (anything up to and above $25,000).
            </p>

            {/* <p>
              Beyond that, there are no additional fees and the first open call
              listing is always free so you can see how the system works.
            </p> */}
          </span>
        </div>
      ),
    },
    {
      id: "cancel",
      subtitle: "What if I don't want to pay? Can I cancel?",
      text: "Yep, you can cancel at any time and you'll keep the benefits of your membership for the remainder of that billing period. You can also access your invoices and manage your membership from the billing portal at any time.",
    },
  ],
};
// #endregion
