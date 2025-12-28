import Link from "next/link";
import { BlitzPage, Routes } from "@blitzjs/next";
import { styledInlineA, TextWell } from "app/components/elements";
import StandaloneFormLayout from "app/core/layouts/standalone_form_layout";

const AboutPage: BlitzPage = () => {
  return (
    <div className="space-y-4">
      <TextWell>
        <p className="font-medium">About</p>
        <p className="pt-2 text-sm">
          This is a simple public page you can edit at{" "}
          <code className="font-mono">apps/fullstack/pages/about.tsx</code>.
        </p>
        <p className="pt-2">
          <Link href={Routes.SigninPage()} className={styledInlineA}>
            Back to sign in
          </Link>
        </p>
      </TextWell>
    </div>
  );
};

AboutPage.getLayout = (page) => (
  <StandaloneFormLayout title="About">{page}</StandaloneFormLayout>
);

export default AboutPage;
