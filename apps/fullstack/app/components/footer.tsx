import { styledInlineA } from "app/components/elements";
import { ThemeSwitcher } from "app/components/theme_switcher";
import type { ThemePreference } from "app/lib/theme";
import Link from "next/link";
import React from "react";
import { useMutation } from "@blitzjs/rpc";
import updateUserOptions from "app/auth/mutations/updateUserOptions";

/**
 * Footer component with theme switcher.
 *
 * Theme syncing architecture:
 * - DarkModeEffect component handles DB → localStorage sync on mount
 * - Footer handles user clicks → save to DB via mutation
 * - Mutations don't cause SSR issues (only queries do)
 */
export function Footer({
  maxWidthClassName,
}: {
  maxWidthClassName: string;
}) {
  // useMutation is safe during SSR - it doesn't fetch data, just prepares the mutation
  const [updateUserOptionsMutation] = useMutation(updateUserOptions);

  return (
    <footer className={maxWidthClassName}>
      <div className="order-last w-full py-4 text-sm flex items-center justify-between gap-x-3">
        <Link className={styledInlineA} href="/about">
          © Planner
        </Link>
        
        <ThemeSwitcher
          onChange={(themePreference) => {
            // Save theme preference to database when user changes it
            void updateUserOptionsMutation({ themePreference });
          }}
        />
      </div>
    </footer>
  );
}
