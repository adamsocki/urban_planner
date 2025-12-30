import { gSSP } from "app/blitz-server";
import Head from "next/head";
import { getSession } from "@blitzjs/auth";
import { BlitzPage, Routes } from "@blitzjs/next";
import { useQuery } from "@blitzjs/rpc";
import Link from "next/link";
import { useState } from "react";
import AuthenticatedPageLayout from "app/core/layouts/authenticated_page_layout";
import { CreateMap } from "app/components/create_map";
import { CreateProject } from "app/components/create_project";
import { WrappedFeatureCollectionList } from "app/components/wrapped_feature_collection_list";
import { CompatibilityCheck } from "app/components/compatibility_check";
import { DropIndex } from "app/components/drop_index";
import { formatTitle } from "app/lib/utils";
import getProjects from "app/projects/queries/getProjects";

export const featureRowColumns = "40px 1fr 1fr 1fr 80px";

type ViewType = "projects" | "maps";

const PlacemarkIndex: BlitzPage = () => {
  const [currentView, setCurrentView] = useState<ViewType>("projects");
  const [projects] = useQuery(getProjects, {});

  return (
    <>
      <Head>
        <title>{formatTitle("Projects")}</title>
      </Head>

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Index views">
            <button
              type="button"
              onClick={() => setCurrentView("projects")}
              className={[
                "py-2 px-1 border-b-2 font-medium text-sm",
                currentView === "projects"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200",
              ].join(" ")}
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("maps")}
              className={[
                "py-2 px-1 border-b-2 font-medium text-sm",
                currentView === "maps"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200",
              ].join(" ")}
            >
              Maps
            </button>
          </nav>
        </div>
      </div>

      <CompatibilityCheck />

      {currentView === "projects" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-x-2">
            <h2 className="text-2xl font-bold">Projects</h2>
            <CreateProject />
          </div>

          {projects.length === 0 ? (
            <div className="rounded border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-400">
              No projects yet. Create your first project to get started.
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={Routes.PersistedProject({ projectId: project.id })}
                  className="rounded border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-semibold text-lg">{project.name}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {project.description || "No description"}
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {project._count.maps}{" "}
                      {project._count.maps === 1 ? "map" : "maps"}
                    </span>
                    <span>
                      Created{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-x-2">
            <h2 className="text-2xl font-bold">Maps</h2>
            <CreateMap />
          </div>
          <WrappedFeatureCollectionList />
        </div>
      )}

      <DropIndex />
    </>
  );
};

PlacemarkIndex.authenticate = { redirectTo: Routes.SigninPage().pathname };
PlacemarkIndex.getLayout = (page) => (
  <AuthenticatedPageLayout title="">{page}</AuthenticatedPageLayout>
);

export const getServerSideProps = gSSP(async ({ req, res }) => {
  const session = await getSession(req, res);

  if (session.userId === null) {
    return {
      redirect: {
        destination: Routes.SigninPage().pathname,
        permanent: false,
      },
    };
  }

  if (session.orgId === undefined) {
    return {
      redirect: {
        destination: Routes.NewOrganization().pathname,
        permanent: false,
      },
    };
  }

  return { props: {} };
});

export default PlacemarkIndex;
