import { useCurrentUser } from "app/core/hooks/useCurrentUser";
import {
  applyTheme,
  readThemePreferenceFromLocalStorage,
  resolveTheme,
  THEME_PREFERENCE_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  writeThemePreferenceToLocalStorage,
} from "app/lib/theme";
import React, { Suspense, useEffect, memo } from "react";

export const DarkModeEffect = memo(function DarkModeEffect() {
  return (
    <Suspense fallback={null}>
      <DarkModeEffectInner />
    </Suspense>
  );
});

export const ThemeEffect = memo(function ThemeEffect() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyFromPreference = () => {
      const preference = readThemePreferenceFromLocalStorage() || "SYSTEM";
      applyTheme(resolveTheme(preference, media.matches));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== THEME_STORAGE_KEY) return;
      applyFromPreference();
    };

    applyFromPreference();
    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_PREFERENCE_CHANGE_EVENT, applyFromPreference);

    if (media.addEventListener) {
      media.addEventListener("change", applyFromPreference);
    } else {
      media.addListener(applyFromPreference);
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        THEME_PREFERENCE_CHANGE_EVENT,
        applyFromPreference
      );
      if (media.removeEventListener) {
        media.removeEventListener("change", applyFromPreference);
      } else {
        media.removeListener(applyFromPreference);
      }
    };
  }, []);

  return null;
});

function DarkModeEffectInner() {
  const { themePreference } = useCurrentUser();

  useEffect(() => {
    const stored = readThemePreferenceFromLocalStorage();
    if (!stored) {
      writeThemePreferenceToLocalStorage(themePreference);
      window.dispatchEvent(new Event(THEME_PREFERENCE_CHANGE_EVENT));
    }
  }, [themePreference]);

  return <ThemeEffect />;
}
