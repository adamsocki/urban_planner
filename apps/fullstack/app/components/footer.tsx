import { styledInlineA } from "app/components/elements";
import { ThemeSwitcher } from "app/components/theme_switcher";
import {
  notifyThemePreferenceChange,
  readThemePreferenceFromLocalStorage,
  writeThemePreferenceToLocalStorage,
} from "app/lib/theme";
import type { ThemePreference } from "app/lib/theme";
import Link from "next/link";
import React, { useEffect, useRef } from "react";

export function Footer({
  maxWidthClassName,
  user,
  onThemePreferenceChange,
}: {
  maxWidthClassName: string;
  user?: { id: number; themePreference: ThemePreference } | null;
  onThemePreferenceChange?: (themePreference: ThemePreference) => void;
}) {
  const syncedForUserId = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    if (syncedForUserId.current === user.id) return;
    syncedForUserId.current = user.id;

    const stored = readThemePreferenceFromLocalStorage();
    if (!stored) {
      writeThemePreferenceToLocalStorage(user.themePreference);
      notifyThemePreferenceChange();
      return;
    }
  }, [user]);

  return (
    <footer className={maxWidthClassName}>
      <div className="w-full py-4 text-sm flex items-center justify-between gap-x-3">
        <Link className={styledInlineA} href="/about">
          © Planner
        </Link>
        <ThemeSwitcher
          onChange={(themePreference) => {
            onThemePreferenceChange?.(themePreference);
          }}
        />
      </div>
    </footer>
  );
}
