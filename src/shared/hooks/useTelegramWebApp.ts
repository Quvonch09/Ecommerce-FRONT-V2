import { useEffect, useMemo } from "react";
import { applyTelegramTheme, getTelegramWebApp } from "@/shared/utils/telegram";

export function useTelegramWebApp() {
  const telegram = useMemo(() => getTelegramWebApp(), []);

  useEffect(() => {
    if (!telegram) {
      return;
    }

    telegram.ready();
    telegram.expand();
    applyTelegramTheme(telegram);
  }, [telegram]);

  return telegram;
}
