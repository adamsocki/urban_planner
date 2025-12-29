import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "app/components/elements";
import type { ThemePreference } from "app/lib/theme";
import {
  THEME_PREFERENCE_CHANGE_EVENT,
  notifyThemePreferenceChange,
  readThemePreferenceFromLocalStorage,
  writeThemePreferenceToLocalStorage,
} from "app/lib/theme";
import React, { useEffect, useState } from "react";

export function ThemeSwitcher({
  onChange,
}: {
  onChange?: (preference: ThemePreference) => void | Promise<void>;
}) {
  const [value, setValue] = useState<ThemePreference>(() => {
    return readThemePreferenceFromLocalStorage() || "SYSTEM";
  });

  useEffect(() => {
    const syncFromStorage = () => {
      setValue(readThemePreferenceFromLocalStorage() || "SYSTEM");
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(THEME_PREFERENCE_CHANGE_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(THEME_PREFERENCE_CHANGE_EVENT, syncFromStorage);
    };
  }, []);

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      aria-label="Theme"
      className="inline-flex items-center border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-md"
      onValueChange={(next) => {
        if (!next) return;
        const preference = next as ThemePreference;
        setValue(preference);
        writeThemePreferenceToLocalStorage(preference);
        notifyThemePreferenceChange();
        void onChange?.(preference);
      }}
    >
      <ToggleGroup.Item asChild value="LIGHT">
        <Button
          variant="quiet"
          side="left"
          title="Light"
          aria-label="Light theme"
        >
          <SunIcon />
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item asChild value="SYSTEM">
        <Button
          variant="quiet"
          side="middle"
          title="System"
          aria-label="System theme"
        >
          <DesktopIcon />
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item asChild value="DARK">
        <Button
          variant="quiet"
          side="right"
          title="Dark"
          aria-label="Dark theme"
        >
          <MoonIcon />
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
