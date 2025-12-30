import Link from "next/link";
import { BlitzPage, Routes } from "@blitzjs/next";
import { styledInlineA, TextWell } from "app/components/elements";
import StandaloneFormLayout from "app/core/layouts/standalone_form_layout";

const TermsPage: BlitzPage = () => {
  return (
    <div className="space-y-4">
      <TextWell>
        <p className="font-medium text-lg">Terms of Service</p>

        <div className="pt-4 space-y-4 text-sm">
          <section>
            <h2 className="font-medium">1. Acceptance of Terms</h2>
            <p className="pt-2">
              By accessing and using Planner, you accept and agree to be bound by the terms
              and provisions of this agreement.
            </p>
          </section>

          <section>
            <h2 className="font-medium">2. Use License</h2>
            <p className="pt-2">
              Permission is granted to temporarily use Planner for personal or commercial
              purposes. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="font-medium">3. User Account</h2>
            <p className="pt-2">
              You are responsible for maintaining the confidentiality of your account
              and password. You agree to accept responsibility for all activities that
              occur under your account.
            </p>
          </section>

          <section>
            <h2 className="font-medium">4. Modifications</h2>
            <p className="pt-2">
              We reserve the right to modify these terms at any time. Continued use
              of the service after changes constitutes acceptance of the modified terms.
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

TermsPage.getLayout = (page) => (
  <StandaloneFormLayout title="Terms of Service">{page}</StandaloneFormLayout>
);

export default TermsPage;
