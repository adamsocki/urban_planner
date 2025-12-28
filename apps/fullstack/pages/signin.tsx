import { useRouter } from "next/router";
import { BlitzPage, Routes } from "@blitzjs/next";
import StandaloneFormLayout from "app/core/layouts/standalone_form_layout";
import { SigninForm } from "app/auth/components/SigninForm";

// Sign-in page component
const SigninPage: BlitzPage = () => {
  // Get the Next.js router to redirect after successful sign-in
  const router = useRouter();

  return (
    <SigninForm
      // After successful authentication, determine where to redirect the user
      onSuccess={async () => {
        // Step 1: Check if a 'next' query parameter exists in the URL
        // If yes: decode the URL-encoded path
        // If no: use the default Placemark index page
        const next = router.query.next
          ? decodeURIComponent(router.query.next as string)
          : Routes.PlacemarkIndex();
        // Step 2: Redirect the user to the determined page
        await router.push(next);
      }}
    />
  );
};

// Auto-redirect users who are already signed in to the home page
SigninPage.redirectAuthenticatedTo = "/";
// Wrap the page content with the sign-in layout template
SigninPage.getLayout = (page) => (
  <StandaloneFormLayout title="Sign in">{page}</StandaloneFormLayout>
);

export default SigninPage;
