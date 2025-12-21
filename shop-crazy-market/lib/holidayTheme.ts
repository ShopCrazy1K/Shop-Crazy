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

  // 🎄 CHRISTMAS (Dec 1–31) - Extended to full month
  // Note: This overrides the winter theme for December
  if (month === 12) {
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

