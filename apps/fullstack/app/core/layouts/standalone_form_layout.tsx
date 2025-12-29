import { H1, MinimalHeader } from "app/components/elements";
import { Footer } from "app/components/footer";
import Notifications from "app/components/notifications";
import { ThemeEffect } from "app/components/dark_mode_effect";
import clsx from "clsx";
import type { LayoutProps } from "./shared";
import { LayoutHead } from "./shared";

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
        <Footer maxWidthClassName="mx-auto max-w-sm px-8 md:px-0 w-full" />
      </div>
      <Notifications />
      <ThemeEffect />
    </>
  );
};

export default StandaloneFormLayout;
