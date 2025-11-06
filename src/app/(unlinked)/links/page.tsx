"use client";

import { linktreeLinks } from "@/constants/links";
import { footerCRText } from "@/constants/text";

import { motion } from "framer-motion";

import { PiHeartBold } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import SalHeader from "@/components/ui/headers/sal-header";
import { cn } from "@/helpers/utilsFns";

const LinksPage = () => {
  const footerText = footerCRText();
  const groupedLinks = linktreeLinks.reduce<
    Record<string, typeof linktreeLinks>
  >((acc, link) => {
    const group = link.group ?? "Ungrouped";
    if (!acc[group]) acc[group] = [];
    acc[group].push(link);
    return acc;
  }, {});
  return (
    <>
      <div className="bottom-0 left-1/2 rounded-full bg-card">
        {/* <div className='bg-background h-[80px] w-[80px] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' /> */}

        <Link href="/" prefetch={true}>
          {/* <span className='font-semibold'>The Street Art List</span> */}

          <motion.img
            whileTap={{
              rotate: 180,
              transition: {
                type: "spring",
                stiffness: 120,
                damping: 5,
                mass: 1.2,
              },
            }}
            whileHover={{
              rotate: 180,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 5,
                mass: 1.2,
              },
            }}
            height={70}
            width={70}
            transition={{ duration: 0.3, ease: "easeOut" }}
            src="/logotransparency.png"
            alt="The Street Art List"
          />
        </Link>
      </div>
      <SalHeader source="links" className="mb-6" />
      <div className={cn("flex w-full flex-col items-center gap-6")}>
        {Object.entries(groupedLinks).map(([groupName, links]) => (
          <div
            key={groupName}
            className="flex w-full flex-col items-center gap-4"
          >
            {groupName !== "Ungrouped" && (
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                {groupName}
              </h2>
            )}
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  variant="salWithShadow"
                  className="w-full max-w-sm rounded-full py-7"
                  key={link.label}
                >
                  <Link
                    href={link.path}
                    className="flex items-center gap-x-4 text-center !text-base text-foreground [@media(max-width:640px)]:!no-underline"
                  >
                    <Icon className="size-5 shrink-0" />
                    <p>{link.label}</p>
                  </Link>
                </Button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center space-x-1 text-sm">
        <p className="inline-flex items-center gap-x-1">
          Made with <PiHeartBold className="size-4" /> by
        </p>
        <Link href="https://theanthonybrooks.com" target="_blank">
          Anthony Brooks
        </Link>
      </div>
      <div className="text-center text-sm text-foreground">
        {footerText.text}
      </div>
    </>
  );
};

export default LinksPage;
