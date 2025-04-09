import { Link } from "@/components/ui/custom-link";

const TermsPage = () => {
  return (
    <div className="mx-auto mb-10 mt-8 flex h-full w-full max-w-[80vw] flex-col gap-y-3 px-4 lg:max-w-[60vw]">
      <span className="mb-8">
        <h1 className="text-center font-tanker text-3xl lowercase tracking-wide lg:text-[5rem] lg:leading-[6.5rem]">
          Terms of Service
        </h1>
        <p className="text-center text-sm">
          Last updated: April 7<sup>th</sup>, 2025
        </p>
      </span>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          1. Acceptance of Terms
        </h2>
        <p className="text-sm">
          By accessing or using The Street Art List website{" "}
          <i>(&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)</i>, you agree
          to be bound by these Terms &amp; Conditions. If you do not agree,
          please do not use the site.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">2. Accounts</h2>
        <p className="text-sm">
          To use certain features of our website, you may be required to create
          an account. You are responsible for maintaining the confidentiality of
          your login credentials and for all activities that occur under your
          account.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          3. User Content &amp; Conduct
        </h2>
        <p className="text-sm">
          You may upload or submit content, including text and images. You
          retain ownership of your content, but by uploading it to our site, you
          grant us a worldwide, non-exclusive license to use, display, and
          distribute that content for the operation and promotion of the site.
        </p>
        <p className="text-sm">
          You are solely responsible for your content. You agree not to upload,
          post, or share any material that is unlawful, offensive, or infringes
          upon the rights of others.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          4. Purchases &amp; Subscriptions
        </h2>
        <p className="text-sm">
          We offer both one-time purchases and subscription plans, some of which
          may include a free trial. All payments are handled securely.
          Subscriptions will automatically renew unless canceled before the end
          of the billing period. By purchasing a subscription, you authorize us
          to charge your payment method on a recurring basis until canceled.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          5. Intellectual Property & Ownership
        </h2>
        <p className="text-sm">
          All content provided by us — including but not limited to our name,
          logo, site design, branding, and original content — is our exclusive
          property. You may not copy, reproduce, or use our intellectual
          property without our prior written permission. Unauthorized use may
          violate intellectual property laws.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          6. DMCA &amp; Copyright
        </h2>
        <p className="text-sm">
          If you believe that your copyrighted work has been used in a way that
          constitutes copyright infringement, please send a detailed notice to:{" "}
          <Link
            className="font-semibold"
            href="mailto:support@thestreetartlist.com"
          >
            support@thestreetartlist.com
          </Link>
          {/* //TODO: Change this to admin@thestreetartlist.com when I get it set up */}
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">7. Feedback</h2>
        <p className="text-sm">
          We value your feedback. Any suggestions or ideas submitted to us will
          not be used commercially without your consent or appropriate credit.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          8. Promotions &amp; Contests
        </h2>
        <p className="text-sm">
          We currently do not offer promotions, contests, or sweepstakes. If
          this changes, additional terms may apply and will be updated here
          accordingly.
        </p>
      </section>

      <section className="mt-3 text-center">
        <h2 className="mb-3 text-lg font-semibold">9. Contact</h2>
        <p className="text-sm">
          If you have any questions about these Terms &amp; Conditions, you can
          contact us at{" "}
          <Link
            className="font-semibold"
            href="mailto:info@thestreetartlist.com"
          >
            info@thestreetartlist.com
          </Link>
          .
        </p>
      </section>

      <p className="mt-5 text-center font-bold">
        By continuing to use our site, you acknowledge that you have read and
        agree to these Terms &amp; Conditions.
      </p>
    </div>
  );
};

export default TermsPage;
