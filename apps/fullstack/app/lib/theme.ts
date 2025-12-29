export type ThemePreference = "LIGHT" | "SYSTEM" | "DARK";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme-preference";
export const THEME_PREFERENCE_CHANGE_EVENT = "theme-preference-change";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "LIGHT" || value === "SYSTEM" || value === "DARK";
}

export function readThemePreferenceFromLocalStorage():
  | ThemePreference
  | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!value) return null;
    return isThemePreference(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeThemePreferenceToLocalStorage(
  preference: ThemePreference
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore quota or privacy-mode errors.
  }
}

export function notifyThemePreferenceChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(THEME_PREFERENCE_CHANGE_EVENT));
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme {
  switch (preference) {
    case "DARK":
      return "dark";
    case "LIGHT":
      return "light";
    case "SYSTEM":
      return systemPrefersDark ? "dark" : "light";
  }
}

export function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("dark", theme === "dark");
}

