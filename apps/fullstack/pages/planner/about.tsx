import Link from "next/link";
import { BlitzPage } from "@blitzjs/next";
import { styledInlineA, TextWell } from "app/components/elements";
import StandaloneFormLayout from "app/planner/layouts/standalone_form_layout";

const PlannerAboutPage: BlitzPage = () => {
  return (
    <div className="space-y-4">
      <TextWell>
        <p className="font-medium">About Planner</p>
        <p className="pt-2 text-sm">
          This is a Planner-only page at{" "}
          <code className="font-mono">/planner/about</code>.
        </p>
        <p className="pt-2">
          <Link href="/planner/signin" className={styledInlineA}>
            Back to Planner sign in
          </Link>
        </p>
      </TextWell>
    </div>
  );
};

PlannerAboutPage.getLayout = (page) => (
  <StandaloneFormLayout title="About">{page}</StandaloneFormLayout>
);

export default PlannerAboutPage;
