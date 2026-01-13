/**
 * Banned words and phrases for copyright/trademark protection
 * Auto-flag system to detect potential IP violations
 */

export interface BannedWord {
  word: string;
  category: "brand" | "celebrity" | "movie" | "logo" | "trademark" | "other";
  severity: "WARNING" | "AUTO_FLAG" | "AUTO_HIDE";
}

// Default banned words - brands, celebrities, movies, etc.
export const DEFAULT_BANNED_WORDS: BannedWord[] = [
  // Major Brands
  { word: "nike", category: "brand", severity: "AUTO_FLAG" },
  { word: "disney", category: "brand", severity: "AUTO_FLAG" },
  { word: "marvel", category: "brand", severity: "AUTO_FLAG" },
  { word: "gucci", category: "brand", severity: "AUTO_FLAG" },
  { word: "nfl", category: "brand", severity: "AUTO_FLAG" },
  { word: "nba", category: "brand", severity: "AUTO_FLAG" },
  { word: "adidas", category: "brand", severity: "AUTO_FLAG" },
  { word: "puma", category: "brand", severity: "AUTO_FLAG" },
  { word: "chanel", category: "brand", severity: "AUTO_FLAG" },
  { word: "louis vuitton", category: "brand", severity: "AUTO_FLAG" },
  { word: "versace", category: "brand", severity: "AUTO_FLAG" },
  { word: "prada", category: "brand", severity: "AUTO_FLAG" },
  { word: "apple", category: "brand", severity: "WARNING" },
  { word: "samsung", category: "brand", severity: "WARNING" },
  { word: "sony", category: "brand", severity: "WARNING" },
  { word: "microsoft", category: "brand", severity: "WARNING" },
  { word: "google", category: "brand", severity: "WARNING" },
  { word: "amazon", category: "brand", severity: "WARNING" },
  { word: "netflix", category: "brand", severity: "AUTO_FLAG" },
  { word: "hbo", category: "brand", severity: "AUTO_FLAG" },
  { word: "warner bros", category: "brand", severity: "AUTO_FLAG" },
  { word: "paramount", category: "brand", severity: "AUTO_FLAG" },
  { word: "universal studios", category: "brand", severity: "AUTO_FLAG" },
  
  // Celebrities (common ones)
  { word: "taylor swift", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "beyonce", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "justin bieber", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "ariana grande", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "drake", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "kanye west", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "rihanna", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "selena gomez", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "miley cyrus", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "harry styles", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "billie eilish", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "the weeknd", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "post malone", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "travis scott", category: "celebrity", severity: "AUTO_FLAG" },
  { word: "kendrick lamar", category: "celebrity", severity: "AUTO_FLAG" },
  
  // Movies/Franchises
  { word: "star wars", category: "movie", severity: "AUTO_FLAG" },
  { word: "marvel", category: "movie", severity: "AUTO_FLAG" },
  { word: "avengers", category: "movie", severity: "AUTO_FLAG" },
  { word: "spider-man", category: "movie", severity: "AUTO_FLAG" },
  { word: "batman", category: "movie", severity: "AUTO_FLAG" },
  { word: "superman", category: "movie", severity: "AUTO_FLAG" },
  { word: "harry potter", category: "movie", severity: "AUTO_FLAG" },
  { word: "lord of the rings", category: "movie", severity: "AUTO_FLAG" },
  { word: "game of thrones", category: "movie", severity: "AUTO_FLAG" },
  { word: "stranger things", category: "movie", severity: "AUTO_FLAG" },
  { word: "breaking bad", category: "movie", severity: "AUTO_FLAG" },
  { word: "the walking dead", category: "movie", severity: "AUTO_FLAG" },
  { word: "frozen", category: "movie", severity: "AUTO_FLAG" },
  { word: "toy story", category: "movie", severity: "AUTO_FLAG" },
  { word: "pixar", category: "movie", severity: "AUTO_FLAG" },
  
  // Sports Teams/Leagues
  { word: "yankees", category: "trademark", severity: "AUTO_FLAG" },
  { word: "lakers", category: "trademark", severity: "AUTO_FLAG" },
  { word: "warriors", category: "trademark", severity: "AUTO_FLAG" },
  { word: "cowboys", category: "trademark", severity: "AUTO_FLAG" },
  { word: "patriots", category: "trademark", severity: "AUTO_FLAG" },
  { word: "chiefs", category: "trademark", severity: "AUTO_FLAG" },
  
  // Common trademark phrases
  { word: "official", category: "trademark", severity: "WARNING" },
  { word: "licensed", category: "trademark", severity: "WARNING" },
  { word: "authentic", category: "trademark", severity: "WARNING" },
];

/**
 * Check if text contains banned words
 * Returns array of flagged words found
 */
export function checkBannedWords(text: string, bannedWords: BannedWord[] = DEFAULT_BANNED_WORDS): BannedWord[] {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  const found: BannedWord[] = [];
  
  for (const bannedWord of bannedWords) {
    const wordLower = bannedWord.word.toLowerCase();
    // Check for exact word match or word boundary match
    const regex = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.push(bannedWord);
    }
  }
  
  return found;
}

/**
 * Get the highest severity level from flagged words
 */
export function getHighestSeverity(flaggedWords: BannedWord[]): "WARNING" | "AUTO_FLAG" | "AUTO_HIDE" | null {
  if (flaggedWords.length === 0) return null;
  
  const severities = flaggedWords.map(w => w.severity);
  if (severities.includes("AUTO_HIDE")) return "AUTO_HIDE";
  if (severities.includes("AUTO_FLAG")) return "AUTO_FLAG";
  if (severities.includes("WARNING")) return "WARNING";
  
  return null;
}

/**
 * Check listing for banned words and return flag status
 */
export function checkListingForBannedWords(
  title: string,
  description: string,
  brand?: string,
  tags?: string[],
  bannedWords: BannedWord[] = DEFAULT_BANNED_WORDS
): {
  flagged: boolean;
  flaggedWords: BannedWord[];
  severity: "WARNING" | "AUTO_FLAG" | "AUTO_HIDE" | null;
  message: string | null;
} {
  const allText = [
    title,
    description,
    brand,
    ...(tags || [])
  ].filter(Boolean).join(" ");
  
  const flaggedWords = checkBannedWords(allText, bannedWords);
  const severity = getHighestSeverity(flaggedWords);
  
  let message: string | null = null;
  if (flaggedWords.length > 0) {
    message = "⚠️ This listing may violate trademark or copyright law. Please confirm you have rights to use these terms: " + 
      flaggedWords.map(w => w.word).join(", ") + 
      ". If you proceed without authorization, your listing may be removed and your account may be suspended.";
  }
  
  return {
    flagged: flaggedWords.length > 0,
    flaggedWords,
    severity,
    message,
  };
}
