import { useMutation } from "@blitzjs/rpc";
import { AuthenticationError } from "blitz";
import signin from "app/auth/mutations/signin";
import { Signin } from "app/auth/validations";
import { AlreadyHaveAccount } from "app/planner/components/already_have_account";
import { LabeledTextField } from "app/core/components/LabeledTextField";
import { Form, FORM_ERROR } from "app/core/components/Form";

type SigninFormProps = {
  onSuccess?: () => void;
};

export const SigninForm = (props: SigninFormProps) => {
  const [signinMutation] = useMutation(signin);

  return (
    <div>
      <Form
        submitText="Sign in to Planner"
        schema={Signin}
        fullWidthSubmit
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            await signinMutation(values);
            props.onSuccess?.();
          } catch (error: any) {
            if (error instanceof AuthenticationError) {
              return { [FORM_ERROR]: error.message };
            }
            return {
              [FORM_ERROR]: `Sorry, we had an unexpected error. Please try again. - ${(
                error as Error
              ).toString()}`,
            };
          }
        }}
      >
        <LabeledTextField
          name="email"
          type="email"
          label="Email"
          autoComplete="username"
        />
        <LabeledTextField
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
      </Form>
      <AlreadyHaveAccount signup forgotPasswordLink />
    </div>
  );
};

export default SigninForm;
