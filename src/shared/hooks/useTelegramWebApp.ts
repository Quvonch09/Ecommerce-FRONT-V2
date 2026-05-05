import { useEffect, useState } from "react";
import { applyTelegramTheme, getTelegramWebApp } from "@/shared/utils/telegram";

export function useTelegramWebApp() {
  const [telegram, setTelegram] = useState(() => getTelegramWebApp());

  useEffect(() => {
    if (telegram) {
      return;
    }

    const maxAttempts = 20;
    let attempts = 0;

    const timer = window.setInterval(() => {
      const nextTelegram = getTelegramWebApp();
      attempts += 1;

      if (nextTelegram) {
        setTelegram(nextTelegram);
        window.clearInterval(timer);
        return;
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [telegram]);

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
