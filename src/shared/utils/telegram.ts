declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  close: () => void;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
};

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function extractTelegramProfile(webApp = getTelegramWebApp()) {
  const user = webApp?.initDataUnsafe?.user;

  if (!user?.id) {
    return null;
  }

  return {
    telegramId: String(user.id),
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    username: user.username ?? "",
  };
}

export function applyTelegramTheme(webApp: TelegramWebApp) {
  const theme = webApp.themeParams ?? {};
  const root = document.documentElement;

  root.style.setProperty("--tg-bg-color", theme.bg_color ?? "#f4f7fb");
  root.style.setProperty("--tg-secondary-bg-color", theme.secondary_bg_color ?? "#ffffff");
  root.style.setProperty("--tg-text-color", theme.text_color ?? "#102033");
  root.style.setProperty("--tg-hint-color", theme.hint_color ?? "#708198");
  root.style.setProperty("--tg-button-color", theme.button_color ?? "#1690ff");
  root.style.setProperty("--tg-button-text-color", theme.button_text_color ?? "#ffffff");
  root.style.setProperty(
    "--tg-section-separator-color",
    theme.section_separator_color ?? "rgba(16, 32, 51, 0.08)",
  );
}
