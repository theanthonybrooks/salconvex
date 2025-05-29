import { Link } from "@/components/ui/custom-link";
import { infoEmail, supportEmail } from "@/constants/siteInfo";

const TermsPage = () => {
  return (
    <div className="mx-auto mb-10 mt-8 flex h-full w-full max-w-[80vw] flex-col gap-y-3 px-4 lg:max-w-[60vw]">
      <span className="mb-8">
        <h1 className="text-center font-tanker text-3xl lowercase tracking-wide lg:text-[5rem] lg:leading-[6.5rem]">
          Terms of Service
        </h1>
        <p className="text-center text-sm">
          Last updated: May 23<sup>rd</sup>, 2025
        </p>
      </span>

      <section className="mb-3 mt-3 border-b-2 border-dashed border-foreground/30 pb-6">
        <h2 className="mb-3 text-center text-lg font-semibold">Definitions</h2>
        <span className="text-sm">
          <p className="mb-3">
            The following definitions apply to these Terms of Service and will
            be referenced throughout this document:
          </p>{" "}
          <ul className="list-inside list-none pl-6">
            <li>
              <b>Account Type</b> - The selected account type during the
              sign-up/registration process. Account Types can be combined and
              are not exclusive.
            </li>
            <li>
              <b>Artist</b> - any person or entity who has signed up with an
              account type of &quot;Artist&quot;.
            </li>
            <li>
              <b>Organizer</b> - any person or entity who has signed up with an
              account type of &quot;Organizer&quot;.
            </li>
            <li>
              <b>Application</b> - the submission of an Project Category to The
              Street Art List by an Artist.
            </li>
            <li>
              <b>Open Call</b> - the submission of an application for an open
              call, call for entry, call for artists, expression of interest,
              etc to The Street Art List by an Organizer.
            </li>
            <li>
              <b>Project Category</b> - categories include &quot;Event&quot;,
              &quot;Project&quot;, &quot;Residency&quot;,
              &quot;Grant/Fund&quot;, &quot;Roster&quot;, &quot;Other&quot;.
              Additional categories may be added in the future.
            </li>
            <li>
              <b>Event Type</b> - types of event when the Project Category is
              &quot;Event&quot;. Included types are &quot;Graffiti Jam&quot;,
              &quot;Street Art Festival&quot;, &quot;Mural Project&quot;,
              &quot;Sticker/Paste Up&quot;, &quot;At Music Festival&quot;, and
              &quot;Other&quot; (for any other event type).
            </li>
            <li>
              <b>The Archive</b> - the database of street art-related Project
              Categories. The Archive is a public database that is accessible to
              all users free of charge. Included information includes the name,
              location, category, type, date, and description of the event or
              project as well as any information pertaining to past Open Calls
              (pertaining only to information submitted by the Organizer and not
              Artist data).
            </li>
          </ul>
        </span>
      </section>
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
        &nbsp;
        <p className="text-sm">
          Any information or media shared in the application process is subject
          to the Terms of Service and Privacy Policy. You agree to comply with
          the terms of service and privacy policy when using the application
          process and agree that by submitting, you grant the recipient of the
          submitted material the right to use, display, and distribute the
          submitted content for the operation of their Project Category.
        </p>
        &nbsp;
        <p className="text-sm">
          You are solely responsible for your content. You agree not to upload,
          post, or share any material that is unlawful, offensive, or infringes
          upon the rights of others.
        </p>
      </section>
      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          4. Events and Open Calls
        </h2>
        <p className="text-sm">
          Any information submitted by an Organizer for a Project Category or
          Open Call grants The Street Art List permission for indefinite
          non-commercial use of the submitted content for archival purposes
          only.
        </p>
        &nbsp;
        <p className="text-sm">
          By submitting an Open Call or Project Category to be posted, you agree
          to the display and use of the submitted content by The Street Art List
          and understand that by posting said content, The Street Art List is
          not claiming to be the Organizer. You also agree that the submitted
          content can be saved by The Street Art List in its database. Any
          submitted Open Call information will be retained in The Street Art
          List&apos;s archive and cannot be deleted by users once it is
          published.
        </p>
        <p className="text-sm">
          You agree to the condition that you can change/archive your submitted
          Project Category at any time, though you may not delete it once it is
          posted. Open calls may only be edited by the Organizer who submitted
          the Open Call and only while the Open Call deadline has not passed.
          After this, the Open Call will be archived and cannot be edited.
        </p>
        &nbsp; &nbsp;
        <p className="text-sm">
          You agree that The Street Art List has the right to remove any
          submitted content that is deemed inappropriate, offensive, or
          objectionable. You also agree that The Street Art List has the right
          to remove any submitted content that is not in compliance with the
          Terms of Service and Privacy Policy.
        </p>
        &nbsp;
        <p className="text-sm">
          You agree that the submission of any information and/or content to an
          Open Call grants the recipent the right to use, display, and
          distribute the submitted content for the operation of their Project
          Category for non-commercial purposes only.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          5. Purchases &amp; Memberships
        </h2>
        <p className="text-sm">
          We offer both one-time purchases and membership plans, some of which
          may include a free trial. All payments are handled securely.
          Memberships will automatically renew unless canceled before the end of
          the billing period. By purchasing a membership, you authorize us to
          charge your payment method on a recurring basis until canceled.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          6. Intellectual Property & Ownership
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
          7. DMCA &amp; Copyright
        </h2>
        <p className="text-sm">
          If you believe that your copyrighted work has been used in a way that
          constitutes copyright infringement, please send a detailed notice to:{" "}
          <Link
            className="font-semibold"
            href={`mailto:${supportEmail}&subject=T&C`}
          >
            {supportEmail}
          </Link>
          {/* //TODO: Change this to admin@thestreetartlist.com when I get it set up */}
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">8. Feedback</h2>
        <p className="text-sm">
          We value your feedback. Any suggestions or ideas submitted to us will
          not be used commercially without your consent or appropriate credit.
        </p>
      </section>

      <section className="mt-3">
        <h2 className="mb-3 text-center text-lg font-semibold">
          9. Promotions &amp; Contests
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
            href={`mailto:${infoEmail}&subject=T&C`}
          >
            {infoEmail}
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
