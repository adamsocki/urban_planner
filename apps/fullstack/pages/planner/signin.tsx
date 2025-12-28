import { BlitzPage, Routes } from "@blitzjs/next";
import { useRouter } from "next/router";
import { SigninForm } from "app/planner/auth/components/SigninForm";
import StandaloneFormLayout from "app/planner/layouts/standalone_form_layout";

const PlannerSigninPage: BlitzPage = () => {
  const router = useRouter();

  return (
    <SigninForm
      onSuccess={async () => {
        const next = router.query.next
          ? decodeURIComponent(router.query.next as string)
          : Routes.PlacemarkIndex();
        await router.push(next);
      }}
    />
  );
};

PlannerSigninPage.redirectAuthenticatedTo = "/";
PlannerSigninPage.getLayout = (page) => (
  <StandaloneFormLayout title="Sign in">{page}</StandaloneFormLayout>
);

export default PlannerSigninPage;
