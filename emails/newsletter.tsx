import { baseEmailStyling } from "@/constants/emailStyling";

// import { siteUrl } from "@/constants/siteInfo";

import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { emailTailwindConfig } from "@/components/email/tailwind-email-config";

export type RecentLoginEmailProps = {
  userFirstName?: string;
  loginDate: number;
  loginDevice?: string;
  loginLocation?: string;
  loginIp?: string;
};

export type TestNewsletterEmailProps = {
  userFirstName: string;
  email: string;
  plan: number;
};

// const baseUrl = siteUrl[0];

export const RecentLoginEmail = (
  {
    //   userFirstName,
    //   loginDate,
    //   loginDevice,
    //   loginLocation,
    //   loginIp,
  }: RecentLoginEmailProps,
) => {
  //   const userLoginDate = new Date(loginDate);
  //   const formattedDate = userLoginDate.toLocaleDateString("en-US", {
  //     weekday: "short",
  //     month: "long",
  //     day: "numeric",
  //     year: "numeric",
  //     hour: "numeric",
  //     minute: "2-digit",
  //   });

  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Tailwind config={emailTailwindConfig}>
        <Head>
          <style>{baseEmailStyling}</style>
        </Head>
        <Body className="block bg-[#ffe770] p-4 font-spaceGrotesk leading-relaxed sm:p-8">
          <Preview>Your monthly newsletter has arrived</Preview>

          <Container>
            <Section className="pt-7">
              <Img
                src="https://thestreetartlist.com/branding/newsletter/newsletter-logo.png"
                alt="Street Art List logo"
                width={250}
                className="mx-auto w-auto max-w-[min(280px,100%)]"
              />
              <Row>
                <Column>
                  <Text className="mt-10 hidden text-sm font-bold sm:block">
                    {/* {formattedDate} */}
                    MONTHLY NEWSLETTER FOR <i>THE STREET ART LIST</i>
                  </Text>
                  <Text className="mt-10 text-sm font-bold sm:hidden">
                    {/* {formattedDate} */}
                    <i>THE STREET ART LIST</i>
                  </Text>
                </Column>
                <Column className="">
                  <Text className="mt-10 text-right text-sm font-bold">
                    {/* {formattedDate} */}
                    April 2025
                  </Text>
                </Column>
              </Row>
            </Section>
            <Hr className="mb-4 mt-2 w-full max-w-none border-t-2 border-black/80" />
            <Section>
              <Row className=" ">
                <Column>
                  <Text className="mt-10 text-sm font-medium leading-[1.8]">
                    Hey there, Anthony here. The newsletter is back! After the
                    past year of splitting my time between painting and coding
                    the site, I&apos;ve finally gotten around to building up a
                    newsletter system. More to come soon (newsletters for Open
                    Calls, personalized email reminders, etc.)
                  </Text>
                </Column>
              </Row>
              <Row className=" ">
                <Column>
                  <Heading as="h2" className="mt-8 font-bold">
                    Title Section that translates:
                  </Heading>
                </Column>
              </Row>

              <Row className=" ">
                <Column>
                  <p className="mt-6 text-sm leading-[1.8]">
                    Every month, things progress bit-by-bit with this. It&apos;s
                    tricky balancing (or grasping) what used to be something
                    super passive for me with what this has/is becoming.
                    Previously, it just involved me updating the spreadsheet for
                    my personal use and sharing it with friends (and friends of
                    friends), but has shifted to the responsibility of
                    building/keeping a site updated, social media posts (so
                    people know that the site is updated), weekly updates
                    because I don&apos;t want people missing things that have
                    come out since the newsletter, and well.. the newsletter
                    itself. <br />
                    <br />I try to find some balance, but it&apos;s difficult as
                    this is all kind of starting now and a lot needs done. All
                    while I&apos;m applying to projects myself, which was what
                    brought this entire thing about. That said, I&apos;m happy
                    with the progress that it&apos;s making! I&apos;ve long been
                    frustrated and annoyed with how difficult it is to find any
                    information or open calls, and being able to gather that
                    info in one place (as much as possible), while also having a
                    platform to hold discussions with many other artists and
                    organizers, has been amazing.
                  </p>
                </Column>
              </Row>
            </Section>

            <Section className="pt-[45px]">
              {/* <Img
                className="max-w-full"
                width={620}
                src={`${baseUrl}/static/yelp-footer.png`}
                alt="Yelp footer decoration"
              /> */}
            </Section>

            <Text className="text-center text-xs leading-[24px] text-black/70">
              © {currentYear} | The Street Art List | www.thestreetartlist.com
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

RecentLoginEmail.PreviewProps = {
  userFirstName: "Bobby",
  loginDate: 1663873200000,
  loginDevice: "Chrome on Mac OS X",
  loginLocation: "Upland, California, United States",
  loginIp: "47.149.53.167",
} as RecentLoginEmailProps;

export default RecentLoginEmail;
