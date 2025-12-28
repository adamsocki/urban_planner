import { H1, styledInlineA } from "app/components/elements";
import Notifications from "app/components/notifications";
import clsx from "clsx";
import Link from "next/link";
import type { LayoutProps } from "app/core/layouts/shared";
import { LayoutHead } from "app/core/layouts/shared";
import { MinimalHeader } from "app/planner/components/minimal_header";

const StandaloneFormLayout = ({
  title,
  wide,
  children,
}: LayoutProps & { wide?: boolean }) => {
  return (
    <>
      <LayoutHead title={title || ""} />
      <div className="min-h-screen text-gray-700 dark:bg-gray-900 dark:text-white flex flex-col">
        <MinimalHeader />
        <div className="flex-auto">
          <div
            className={clsx(
              wide ? "max-w-2xl" : "max-w-sm",
              "mx-auto px-8 md:px-0 pt-16 space-y-4"
            )}
          >
            <H1>{title}</H1>
            {children}
          </div>
        </div>
        <div className="mx-auto max-w-sm px-8 md:px-0 w-full py-4 text-sm">
          <Link className={styledInlineA} href="/planner/about">
            © Planner
          </Link>
        </div>
      </div>
      <Notifications />
    </>
  );
};

export default StandaloneFormLayout;
