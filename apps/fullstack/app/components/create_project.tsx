import { Button } from "app/components/elements";
import { useCreateProject } from "app/hooks/use_create_project";

export function CreateProject({ mini = false }: { mini?: boolean }) {
  const { createProject, isSubmitting } = useCreateProject();

  return (
    <Button
      variant="primary"
      size={mini ? "sm" : "md"}
      disabled={isSubmitting}
      onClick={createProject}
    >
      New project
    </Button>
  );
}
