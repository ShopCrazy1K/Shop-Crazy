import { getHolidayTheme } from "./holidayTheme";

export type ThemeConfig = {
  name: string;
  bg: string;
  accent: string;
  font: string;
  animation: string;
};

export function getMonthlyTheme(): ThemeConfig {
  // Check for holiday themes first (they take priority)
  const holiday = getHolidayTheme();
  if (holiday) return holiday;

  // Get current month (1-12)
  const month = new Date().getMonth() + 1;

  // 🧊 WINTER: December, January, February
  if (month === 12 || month === 1 || month === 2) {
    return {
      name: "winter-slime",
      bg: "bg-cyan-100",
      accent: "text-blue-600",
      font: "font-winter",
      animation: "animate-slime-drip",
    };
  }

  // 🌸 SPRING: March, April, May
  if (month === 3 || month === 4 || month === 5) {
    return {
      name: "spring-cartoon",
      bg: "bg-pink-100",
      accent: "text-green-600",
      font: "font-cartoon",
      animation: "animate-bounce-soft",
    };
  }

  // ☀️ SUMMER: June, July, August
  if (month === 6 || month === 7 || month === 8) {
    return {
      name: "summer-neon",
      bg: "bg-black",
      accent: "text-neon",
      font: "font-neon",
      animation: "animate-neon-pulse",
    };
  }

  // 🍂 FALL: September, October, November
  if (month === 9 || month === 10 || month === 11) {
    return {
      name: "spooky-toon",
      bg: "bg-purple-900",
      accent: "text-orange-400",
      font: "font-spooky",
      animation: "animate-float",
    };
  }

  // Fallback (shouldn't reach here, but just in case)
  return {
    name: "default-toon",
    bg: "bg-yellow-100",
    accent: "text-purple-600",
    font: "font-cartoon",
    animation: "animate-wiggle",
  };
}

