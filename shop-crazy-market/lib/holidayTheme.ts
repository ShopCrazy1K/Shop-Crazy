export type HolidayTheme = {
  name: string;
  bg: string;
  accent: string;
  font: string;
  animation: string;
};

export function getHolidayTheme(): HolidayTheme | null {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const year = today.getFullYear();

  // 🎊 NEW YEAR'S (Dec 31 - Jan 2, 2026)
  if ((month === 12 && day === 31) || (month === 1 && day <= 2 && year <= 2026)) {
    return {
      name: "new-year",
      bg: "bg-gradient-to-br from-purple-900 via-indigo-900 to-black",
      accent: "text-yellow-300",
      font: "font-neon",
      animation: "animate-sparkle",
    };
  }

  // ❄️ WINTER SNOW THEME (Dec 26-30) - After Christmas, before New Year's
  if (month === 12 && day >= 26 && day < 31) {
    return {
      name: "winter-snow",
      bg: "bg-gradient-to-br from-blue-50 via-white to-blue-100",
      accent: "text-blue-800",
      font: "font-sans",
      animation: "animate-snow-fall",
    };
  }

  // 🎄 CHRISTMAS (Dec 1–25) - Extended to full month except late December
  // Note: This overrides the winter theme for early December
  if (month === 12 && day <= 25) {
    return {
      name: "christmas-toon",
      bg: "bg-gradient-to-br from-red-200 via-red-100 to-green-200",
      accent: "text-green-800",
      font: "font-cartoon",
      animation: "animate-wiggle",
    };
  }

  // 🖤 BLACK HISTORY MONTH (Feb)
  if (month === 2) {
    return {
      name: "black-history",
      bg: "bg-black",
      accent: "text-yellow-400",
      font: "font-neon",
      animation: "animate-neon-pulse",
    };
  }

  // 🐣 EASTER (April 1-30) - Overrides spring theme
  if (month === 4) {
    return {
      name: "easter-toon",
      bg: "bg-emerald-100",
      accent: "text-pink-500",
      font: "font-cartoon",
      animation: "animate-bounce-soft",
    };
  }

  // 🎃 HALLOWEEN (Oct 1–31)
  if (month === 10) {
    return {
      name: "halloween-spooky",
      bg: "bg-orange-900",
      accent: "text-purple-300",
      font: "font-spooky",
      animation: "animate-float",
    };
  }

  // 🇺🇸 JULY 4TH (July 1–4)
  if (month === 7 && day <= 4) {
    return {
      name: "july-4th",
      bg: "bg-blue-900",
      accent: "text-red-400",
      font: "font-neon",
      animation: "animate-neon-pulse",
    };
  }

  return null;
}

