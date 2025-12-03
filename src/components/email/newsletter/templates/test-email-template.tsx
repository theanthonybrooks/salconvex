import { siteUrl } from "@/constants/siteInfo";

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
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

const baseUrl = siteUrl[0];

export const RecentLoginEmail = ({
  userFirstName,
  loginDate,
  loginDevice,
  loginLocation,
  loginIp,
}: RecentLoginEmailProps) => {
  const userLoginDate = new Date(loginDate);
  const formattedDate = userLoginDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Tailwind config={emailTailwindConfig}>
        <Head />
        <Body className="font-yelp bg-white">
          <Preview>Sally recent login</Preview>
          <Container>
            <Section className="px-5 py-[30px]">
              <Img src={`${baseUrl}/static/yelp-logo.png`} alt="Yelp logo" />
            </Section>

            <Section className="overflow-hidden rounded border border-solid border-black/10">
              <Row>
                <Img
                  className="max-w-full"
                  width={620}
                  src={`${baseUrl}/static/yelp-header.png`}
                  alt="Yelp header illustration"
                />
              </Row>

              <Row className="p-5 pb-0">
                <Column>
                  <Heading className="text-center text-[32px] font-bold">
                    Hi {userFirstName},
                  </Heading>
                  <Heading
                    as="h2"
                    className="text-center text-[26px] font-bold"
                  >
                    We noticed a recent login to your Sally account.
                  </Heading>

                  <Text className="text-base">
                    <b>Time: </b>
                    {formattedDate}
                  </Text>
                  <Text className="-mt-[5px] text-base">
                    <b>Device: </b>
                    {loginDevice}
                  </Text>
                  <Text className="-mt-[5px] text-base">
                    <b>Location: </b>
                    {loginLocation}
                  </Text>
                  <Text className="-mt-[5px] text-sm leading-[24px] text-black/50">
                    *Approximate geographic location based on IP address:
                    {loginIp}
                  </Text>

                  <Text className="text-base">
                    If this was you, there&apos;s nothing else you need to do.
                  </Text>
                  <Text className="-mt-[5px] text-base">
                    If this wasn&apos;t you or if you have additional questions,
                    please see our support page.
                  </Text>
                </Column>
              </Row>
              <Row className="p-5 pt-0">
                <Column className="text-center" colSpan={2}>
                  <Button className="inline-block cursor-pointer rounded border border-solid border-black/10 bg-[#e00707] px-[30px] py-3 font-bold text-white no-underline">
                    Learn More
                  </Button>
                </Column>
              </Row>
            </Section>

            <Section className="pt-[45px]">
              <Img
                className="max-w-full"
                width={620}
                src={`${baseUrl}/static/yelp-footer.png`}
                alt="Yelp footer decoration"
              />
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

export const TestNewsletterEmail = (props: TestNewsletterEmailProps) => {
  const { userFirstName, email, plan } = props;

  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Tailwind config={emailTailwindConfig}>
        <Head />
        <Body className="font-yelp bg-white">
          <Preview>Sally email test</Preview>
          <Container>
            <Section className="px-5 py-[30px]">
              <Img
                src={`${baseUrl}/saltext.png`}
                alt="The Street Art List logo"
              />
            </Section>

            <Section className="overflow-hidden rounded border border-solid border-black/10">
              <Row>
                <Img
                  className="max-w-full"
                  width={620}
                  src={`${baseUrl}/static/yelp-header.png`}
                  alt="Yelp header illustration"
                />
              </Row>

              <Row className="p-5 pb-0">
                <Column>
                  <Heading className="text-center text-[32px] font-bold">
                    Hi {userFirstName},
                  </Heading>
                  <Heading
                    as="h2"
                    className="text-center text-[26px] font-bold"
                  >
                    We noticed a recent login to your Sally account.
                  </Heading>
                  <Text className="text-2xl">Your plan: {plan}</Text>
                  <Text className="text-xl font-bold">Your email: {email}</Text>

                  <Text className="text-base">
                    If this was you, there&apos;s nothing else you need to do.
                  </Text>
                  <Text className="-mt-[5px] text-base">
                    If this wasn&apos;t you or if you have additional questions,
                    please see our support page.
                  </Text>
                </Column>
              </Row>
              <Row className="p-5 pt-0">
                <Column className="text-center" colSpan={2}>
                  <Button className="inline-block cursor-pointer rounded border border-solid border-black/10 bg-[#e00707] px-[30px] py-3 font-bold text-white no-underline">
                    Learn More
                  </Button>
                </Column>
              </Row>
            </Section>

            <Section className="pt-[45px]">
              <Img
                className="max-w-full"
                width={620}
                src={`${baseUrl}/static/yelp-footer.png`}
                alt="Yelp footer decoration"
              />
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
