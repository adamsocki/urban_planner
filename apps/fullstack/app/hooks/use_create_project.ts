import { Routes } from "@blitzjs/next";
import { useMutation } from "@blitzjs/rpc";
import { UNTITLED } from "app/lib/constants";
import createProjectMutation from "app/projects/mutations/createProject";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useCreateProject() {
  const [createProject] = useMutation(createProjectMutation);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  return {
    createProject: useCallback(async () => {
      setIsSubmitting(true);
      await toast.promise(
        (async () => {
          try {
            const projectId = await createProject({
              name: UNTITLED,
              description: "",
            });
            await router.push(
              Routes.PersistedProject({ projectId })
            );
          } catch (e: any) {
            setIsSubmitting(false);
            throw e;
          }
        })(),
        {
          loading: "Creating project",
          success: "Created project",
          error: "Failed to create project",
        }
      );
    }, [router, createProject]),
    isSubmitting,
  };
}
