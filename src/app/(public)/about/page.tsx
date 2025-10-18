"use client";
import { Link } from "@/components/ui/custom-link";
import { PopoverSimple } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/helpers/utilsFns";
import { useQuery } from "convex-helpers/react/cache/hooks";
import Image from "next/image";
import { ReactNode } from "react";
import { api } from "~/convex/_generated/api";

const AboutPage = () => {
  const fatCapUsers = useQuery(api.users.getFatcapUsers);

  return (
    <div
      className={cn(
        "mx-auto mb-12 flex w-full max-w-[1300px] flex-col items-center justify-center gap-2",
      )}
    >
      <div className={cn("mb-12 sm:mb-16")}>
        <Image
          src="/branding/about.png"
          alt="About The Street Art List"
          width={300}
          height={100}
          priority={true}
          className="[@media(max-width:724px)]:w-64"
        />
      </div>
      <div
        className={cn(
          "flex w-full max-w-[80vw] grid-cols-2 flex-col gap-10 md:grid md:gap-14",
        )}
      >
        <section
          className={cn(
            "relative mx-auto flex w-full flex-col gap-3 [@media(max-width:724px)]:max-w-[80vw]",
          )}
        >
          <Image
            src="/full.png"
            alt="Logansport, Indiana (USA) mural (2020)"
            width={550}
            height={400}
            priority={true}
            className="[@media(max-width:724px)]:mx-auto"
          />
          <Link
            href="https://theanthonybrooks.com/timejump"
            target="_blank"
            className="italic text-foreground/70"
          >
            Time Jump - Logansport, IN (USA)
          </Link>
        </section>
        <section className={cn("flex flex-col gap-5")}>
          <QandASection
            question="What is The Street Art List?"
            answer={
              <p>
                The Street Art List is a directory of street art festivals,
                mural projects, graffiti jams, and public art interventions. In
                its current iteration, it&apos;s an application portal for
                artists to apply to projects, keep track of their submissions
                and interests, and more. Currently, there are over 1,000 events
                listed on the site (and the map), with more to come.
              </p>
            }
          />
          <QandASection
            question="Who am I/Who's behind it all?"
            answer={
              <>
                <span>
                  The person behind this project is me,{" "}
                  <PopoverSimple
                    content={
                      <div className="flex flex-col gap-2 font-semibold">
                        <Link
                          href="https://instagram.com/anthonybrooksart"
                          target="_blank"
                        >
                          Instagram
                        </Link>
                        <Link
                          href="https://theanthonybrooks.com/walls"
                          target="_blank"
                        >
                          Website
                        </Link>
                        <Link
                          href="mailto:hey@theanthonybrooks.com"
                          target="_blank"
                        >
                          Contact
                        </Link>
                      </div>
                    }
                    triggerClassName="font-semibold"
                    className="w-max"
                    stayOpenOnHover={true}
                    closeDelay={500}
                  >
                    Anthony Brooks
                  </PopoverSimple>
                  . I&apos;m a painter and visual artist based between the
                  Midwestern United States and Berlin, Germany. Since 2016,
                  I&apos;ve painted more than 70 murals in 15 countries and have
                  spent many, many hours applying for projects and grants. The
                  one thing that always made this profession difficult was the
                  lack of public and accessible info. Which, again, led to the
                  first iterations of this list :). In addition to being an
                  artist, I really like lists and making/organizing projects
                  like this and since I dabble in web dev, I decided in 2023 to
                  just make a website for it. Many, many, many hours later, here
                  we are!
                </span>
              </>
            }
          />
          <QandASection
            question="Why am I making it?"
            answer={
              <p>
                Since 2019, I&apos;ve freely/openly shared my list as I feel
                that by making this information accessible, artists and
                organizers alike will have a better resource around how to
                find/apply to projects, how to run projects that take care of
                the needs of artists, and everything in between. As the project
                has grown, the site has become paid to handle all of the time
                that it takes, but the desire to make it as affordable and
                accessible as possible remains and is still one of my main
                motivators.
              </p>
            }
          />
          <QandASection
            question="What's the future of The List?"
            answer={
              <p>
                I have big plans/dreams for this. It&apos;s already gone far
                beyond what I had imagined when I first shared it in 2019,
                reaching hundreds of artists and countries/continents that
                I&apos;ve yet to travel to. Word of mouth is a crazy thing.
                Soon, I&apos;ll be adding an application system for artists to
                apply directly through the site without the need for things like
                typeform or Google Forms.
              </p>
            }
          />
        </section>
      </div>
      <Separator className="mx-auto my-8 max-w-[90%]" thickness={2} />
      <div className="flex w-full max-w-[90%] flex-col justify-center gap-3">
        <h2 className="text-start font-tanker text-4xl lowercase tracking-wide text-foreground">
          Supporters:
        </h2>
        <div className="mt-4 columns-2 md:columns-3 lg:columns-5">
          {fatCapUsers?.map((user) => (
            <p
              key={user._id}
              className="mb-2 break-inside-avoid text-start text-lg text-foreground"
            >
              {user.name}
            </p>
          ))}
        </div>
      </div>
      {/* TODO: Add a contact form here */}
    </div>
  );
};

export default AboutPage;

interface QandASectionProps {
  question: string;
  answer: ReactNode;
}

const QandASection = ({ question, answer }: QandASectionProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <h2 className="flex items-start gap-1 font-semibold">
        <span className="mr-2">Q:</span>
        <span className="text-foreground">{question}</span>
      </h2>
      <div className="flex items-start gap-1">
        <span className="mr-2">A:</span>
        <div className="text-foreground">{answer}</div>
      </div>
    </div>
  );
};
