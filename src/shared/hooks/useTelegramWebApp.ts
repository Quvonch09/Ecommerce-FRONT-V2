import { useEffect, useState } from "react";
import { applyTelegramTheme, getTelegramWebApp, type TelegramWebApp } from "@/shared/utils/telegram";

export function useTelegramWebApp() {
  const [telegram, setTelegram] = useState<TelegramWebApp | undefined>(getTelegramWebApp());

  useEffect(() => {
    if (!telegram) {
      const interval = setInterval(() => {
        const tg = getTelegramWebApp();
        if (tg) {
          setTelegram(tg);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [telegram]);

  useEffect(() => {
    if (!telegram) return;

    telegram.ready();
    telegram.expand();
    applyTelegramTheme(telegram);
  }, [telegram]);

  return telegram;
}
