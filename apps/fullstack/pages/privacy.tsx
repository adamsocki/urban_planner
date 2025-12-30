import Link from "next/link";
import { BlitzPage, Routes } from "@blitzjs/next";
import { styledInlineA, TextWell } from "app/components/elements";
import StandaloneFormLayout from "app/core/layouts/standalone_form_layout";

const PrivacyPage: BlitzPage = () => {
  return (
    <div className="space-y-4">
      <TextWell>
        <p className="font-medium text-lg">Privacy Policy</p>

        <div className="pt-4 space-y-4 text-sm">
          <section>
            <h2 className="font-medium">1. Information We Collect</h2>
            <p className="pt-2">
              We collect information you provide directly to us, including your name,
              email address, and organization name when you create an account.
            </p>
          </section>

          <section>
            <h2 className="font-medium">2. How We Use Your Information</h2>
            <p className="pt-2">
              We use the information we collect to provide, maintain, and improve our
              services, to process your requests, and to communicate with you.
            </p>
          </section>

          <section>
            <h2 className="font-medium">3. Data Storage and Security</h2>
            <p className="pt-2">
              We implement appropriate technical and organizational measures to protect
              your personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="font-medium">4. Information Sharing</h2>
            <p className="pt-2">
              We do not sell, trade, or otherwise transfer your personal information
              to third parties without your consent, except as described in this policy
              or as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-medium">5. Your Rights</h2>
            <p className="pt-2">
              You have the right to access, update, or delete your personal information
              at any time. You may also opt out of certain communications.
            </p>
          </section>

          <section>
            <h2 className="font-medium">6. Changes to This Policy</h2>
            <p className="pt-2">
              We may update this privacy policy from time to time. We will notify you
              of any changes by posting the new policy on this page.
            </p>
          </section>
        </div>

        <p className="pt-6">
          <Link href={Routes.SignupPage()} className={styledInlineA}>
            Back to sign up
          </Link>
        </p>
      </TextWell>
    </div>
  );
};

PrivacyPage.getLayout = (page) => (
  <StandaloneFormLayout title="Privacy Policy">{page}</StandaloneFormLayout>
);

export default PrivacyPage;
