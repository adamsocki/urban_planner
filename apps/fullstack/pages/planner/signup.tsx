import { BlitzPage } from "@blitzjs/next";
import { Suspense } from "react";
import { Loading } from "app/components/elements";
import { SignupForm } from "app/planner/auth/components/SignupForm";
import StandaloneFormLayout from "app/planner/layouts/standalone_form_layout";

const PlannerSignupPage: BlitzPage = () => {
  return (
    <div className="grid md:grid-cols-2">
      <div className="hidden md:block pr-10">
        <div className="pb-6 text-lg text-gray-700 dark:text-gray-200">
          Planner is an urban planning document generation tool built on top of
          Placemark’s mapping foundation.
        </div>
        <ul className="list-disc pl-6 text-purple-700 dark:text-purple-300">
          <li>Projects</li>
          <li>Modules</li>
          <li>Templates</li>
          <li>Exports</li>
        </ul>
      </div>
      <Suspense fallback={<Loading />}>
        <SignupForm />
      </Suspense>
    </div>
  );
};

PlannerSignupPage.redirectAuthenticatedTo = "/";
PlannerSignupPage.getLayout = (page) => (
  <StandaloneFormLayout wide title="Planner sign up">
    {page}
  </StandaloneFormLayout>
);

export default PlannerSignupPage;
