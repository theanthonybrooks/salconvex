import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { JSX } from "react";

// Define the types
interface AccordionItem {
  subtitle: string;
  text: string[] | string;
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
      subtitle: "Do I get access to this landing page in the starter kit?",
      text: "Yes, this page isn't even a real landing page more so a template for you to build on.",
    },
    {
      subtitle: "Is the starter kit regularly updated?",
      text: "Yes, we continuously update the starter kit with the latest features, security patches, and best practices to ensure you're always working with cutting-edge technology.",
    },
    {
      subtitle: "Do I get access to this landing page in the starter kit?",
      text: "Yes, this page isn't even a real landing page more so a template for you to build on.",
    },
    {
      subtitle: "Is the starter kit regularly updated?",
      text: "Yes, we continuously update the starter kit with the latest features, security patches, and best practices to ensure you're always working with cutting-edge technology.",
    },
    {
      subtitle: "Do I get access to this landing page in the starter kit?",
      text: "Yes, this page isn't even a real landing page more so a template for you to build on.",
    },
    {
      subtitle: "Is the starter kit regularly updated?",
      text: "Yes, we continuously update the starter kit with the latest features, security patches, and best practices to ensure you're always working with cutting-edge technology.",
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
