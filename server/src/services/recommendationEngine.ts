import { GiftIdea } from "@prisma/client";

export interface RecipientProfile {
  name?: string;
  relationship?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  personalityTraits?: string[];
  favoriteColors?: string[];
  likes?: string[];
  dislikes?: string[] | string;
}

export interface OccasionDetails {
  type?: string;
  title?: string;
  date?: Date;
}

export interface BudgetCriteria {
  min?: number;
  max?: number;
}

export interface ScoredRecommendation {
  gift: GiftIdea;
  score: number;
  matchLevel: string;
  reasons: string[];
  detectiveClue: string;
  potentialConcern?: string;
  breakdown: {
    budgetScore: number;
    interestScore: number;
    personalityScore: number;
    occasionScore: number;
    colorScore: number;
    dislikePenalty: number;
  };
}

/**
 * Normalizes strings or arrays into clean lowercase token arrays
 */
const normalizeList = (input?: string[] | string | null): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => item.toLowerCase().trim()).filter(Boolean);
  }
  return input
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Evaluates budget compatibility
 */
export const matchBudget = (
  price: number,
  budget?: BudgetCriteria
): { score: number; fitsBudget: boolean; reason?: string } => {
  if (!budget || (!budget.min && !budget.max)) {
    return { score: 15, fitsBudget: true, reason: "No restrictive budget specified" };
  }

  const min = budget.min ?? 0;
  const max = budget.max ?? Infinity;

  // Exact fit
  if (price >= min && price <= max) {
    const formatted = max === Infinity ? `₹${min}+` : `₹${min.toLocaleString("en-IN")}–₹${max.toLocaleString("en-IN")}`;
    return {
      score: 30,
      fitsBudget: true,
      reason: `Fits comfortably within your ${formatted} budget (₹${price.toLocaleString("en-IN")})`,
    };
  }

  // Slightly below minimum (great bargain)
  if (price < min) {
    const diffPercent = (min - price) / min;
    if (diffPercent <= 0.25) {
      return {
        score: 22,
        fitsBudget: true,
        reason: `Great value just under your ₹${min.toLocaleString("en-IN")} threshold at ₹${price.toLocaleString("en-IN")}`,
      };
    }
    return {
      score: 10,
      fitsBudget: true,
      reason: `Budget-friendly option at ₹${price.toLocaleString("en-IN")}`,
    };
  }

  // Above maximum
  if (price > max) {
    const overage = (price - max) / max;
    if (overage <= 0.15) {
      return {
        score: 5,
        fitsBudget: false,
        reason: `Slightly exceeds budget (₹${price.toLocaleString("en-IN")} vs ₹${max.toLocaleString("en-IN")}) but provides premium value`,
      };
    }
    return {
      score: -30,
      fitsBudget: false,
      reason: `Exceeds target budget of ₹${max.toLocaleString("en-IN")}`,
    };
  }

  return { score: 0, fitsBudget: false };
};

/**
 * Evaluates hobby, interest, and specific likes match
 */
export const matchInterests = (
  gift: GiftIdea,
  interests: string[],
  likes: string[]
): { score: number; reasons: string[]; matchedTerms: string[] } => {
  const giftCorpus = [
    gift.title,
    gift.description,
    gift.category,
    ...gift.tags,
  ]
    .join(" ")
    .toLowerCase();

  const matchedTerms: string[] = [];
  const reasons: string[] = [];
  let score = 0;

  // Interest match
  for (const interest of interests) {
    if (giftCorpus.includes(interest) || gift.tags.some((t) => t.toLowerCase().includes(interest))) {
      matchedTerms.push(interest);
      score += 15;
    }
  }

  // Likes match
  for (const like of likes) {
    if (giftCorpus.includes(like) || gift.tags.some((t) => t.toLowerCase().includes(like))) {
      matchedTerms.push(like);
      score += 12;
    }
  }

  // Deduplicate matched terms
  const uniqueMatches = Array.from(new Set(matchedTerms));

  if (uniqueMatches.length > 0) {
    reasons.push(`Directly connects with their passion for ${uniqueMatches.slice(0, 3).join(", ")}`);
  }

  return {
    score: Math.min(score, 45), // Cap interest points
    reasons,
    matchedTerms: uniqueMatches,
  };
};

/**
 * Evaluates personality and vibe alignment
 */
export const matchPersonality = (
  gift: GiftIdea,
  personalityTraits: string[]
): { score: number; reasons: string[]; matchedTraits: string[] } => {
  const giftVibe = (gift.vibe || "").toLowerCase();
  const giftTags = gift.tags.map((t) => t.toLowerCase());
  const giftText = `${gift.title} ${gift.description} ${giftVibe}`.toLowerCase();

  const matchedTraits: string[] = [];
  let score = 0;

  // Personality to vibe/keyword mappings
  const affinityMap: Record<string, string[]> = {
    creative: ["art", "diy", "creative", "craft", "writing", "baking", "aesthetic", "music"],
    introvert: ["cozy", "reading", "books", "home", "sleep", "wellness", "tea", "coffee"],
    adventurous: ["travel", "outdoor", "fitness", "gear", "exploration", "action"],
    minimalist: ["sleek", "practical", "minimal", "desk", "functional", "organized"],
    "tech-savvy": ["tech", "gadgets", "gaming", "smart", "electronic", "audio"],
    calm: ["peaceful", "aromatherapy", "tea", "wellness", "cozy", "mindfulness"],
    foodie: ["gourmet", "tasting", "cooking", "chocolate", "coffee", "baking", "snacks"],
    sentimental: ["personalized", "custom", "keepsake", "memory", "jewelry", "engraved"],
    organized: ["planner", "journal", "organizer", "desk", "storage"],
  };

  for (const trait of personalityTraits) {
    const relatedWords = affinityMap[trait] || [trait];
    const isDirectMatch = giftVibe.includes(trait) || giftTags.includes(trait);
    const isAffinityMatch = relatedWords.some((w) => giftText.includes(w) || giftTags.includes(w));

    if (isDirectMatch || isAffinityMatch) {
      matchedTraits.push(trait);
      score += 12;
    }
  }

  const reasons: string[] = [];
  if (matchedTraits.length > 0) {
    reasons.push(`Complements their ${matchedTraits.join(" & ")} personality`);
  }

  return {
    score: Math.min(score, 25),
    reasons,
    matchedTraits,
  };
};

/**
 * Evaluates occasion compatibility
 */
export const matchOccasion = (
  gift: GiftIdea,
  occasionType?: string
): { score: number; reasons: string[] } => {
  if (!occasionType || occasionType.toLowerCase() === "general") {
    return { score: 5, reasons: [] };
  }

  const occasion = occasionType.toLowerCase();
  const giftTags = gift.tags.map((t) => t.toLowerCase());
  const giftCorpus = `${gift.title} ${gift.description} ${gift.category}`.toLowerCase();

  let score = 0;
  const reasons: string[] = [];

  const occasionAffinities: Record<string, string[]> = {
    birthday: ["celebration", "personal", "fun", "luxury", "gadgets", "personalized"],
    anniversary: ["romantic", "luxury", "keepsake", "jewelry", "personalized", "sentimental", "watch"],
    valentine: ["romantic", "chocolate", "sentimental", "cozy", "jewelry", "personalized"],
    christmas: ["festive", "cozy", "gourmet", "winter", "family", "sharing"],
    graduation: ["professional", "tech", "desk", "leather", "books", "achievement"],
    wedding: ["home", "living", "luxury", "gourmet", "decor", "memories"],
    housewarming: ["home", "kitchen", "living", "decor", "plants", "aroma"],
    friendship: ["fun", "thoughtful", "snacks", "games", "photo"],
  };

  const relevantKeywords = occasionAffinities[occasion] || [occasion];
  const isMatch = relevantKeywords.some(
    (kw) => giftTags.includes(kw) || giftCorpus.includes(kw)
  );

  if (isMatch) {
    score = 12;
    reasons.push(`Handpicked to suit a festive ${occasionType} celebration`);
  } else {
    score = 5;
  }

  return { score, reasons };
};

/**
 * Checks for favorite color matches
 */
export const matchColors = (
  gift: GiftIdea,
  favoriteColors: string[]
): { score: number; reasons: string[]; matchedColors: string[] } => {
  if (favoriteColors.length === 0) {
    return { score: 0, reasons: [], matchedColors: [] };
  }

  const giftText = `${gift.title} ${gift.description} ${gift.tags.join(" ")}`.toLowerCase();
  const matchedColors: string[] = [];

  for (const color of favoriteColors) {
    if (giftText.includes(color.toLowerCase())) {
      matchedColors.push(color);
    }
  }

  const reasons: string[] = [];
  if (matchedColors.length > 0) {
    reasons.push(`Available in or features their favorite color (${matchedColors.join(", ")})`);
    return { score: 8, reasons, matchedColors };
  }

  return { score: 0, reasons: [], matchedColors: [] };
};

/**
 * Checks for conflict with recipient dislikes
 */
export const checkDislikes = (
  gift: GiftIdea,
  dislikes: string[]
): { hasConflict: boolean; penalty: number; reason?: string } => {
  if (dislikes.length === 0) {
    return { hasConflict: false, penalty: 0 };
  }

  const giftCorpus = [
    gift.title,
    gift.description,
    gift.category,
    gift.vibe,
    ...gift.tags,
  ]
    .join(" ")
    .toLowerCase();

  for (const dislike of dislikes) {
    if (dislike && giftCorpus.includes(dislike)) {
      return {
        hasConflict: true,
        penalty: -45,
        reason: `Notice: Recipient indicated a dislike for "${dislike}".`,
      };
    }
  }

  return { hasConflict: false, penalty: 0 };
};

/**
 * Generates an investigative deduction summary
 */
export const generateDetectiveReason = (
  gift: GiftIdea,
  profile: RecipientProfile,
  occasion: OccasionDetails,
  budget: BudgetCriteria,
  matchedInterests: string[],
  matchedTraits: string[],
  fitsBudget: boolean
): string => {
  const name = profile.name || "the recipient";
  const relationship = profile.relationship || "friend";
  const occType = occasion.type || "special day";

  const clues: string[] = [];

  if (matchedInterests.length > 0) {
    clues.push(`keen interest in ${matchedInterests.join(" and ")}`);
  }
  if (matchedTraits.length > 0) {
    clues.push(`distinctly ${matchedTraits.join(" & ")} disposition`);
  }

  const clueSentence =
    clues.length > 0
      ? `Evidence points to ${name}'s ${clues.join(", with a ")}.`
      : `Based on clues gathered for your ${relationship} ${name}.`;

  const budgetClause = fitsBudget
    ? `Matches your specified budget parameters perfectly.`
    : `A worthy consideration that brings standout value.`;

  // Pre-seed gift-specific clue if available
  const specificClue = gift.detectiveClue ? ` Clue: ${gift.detectiveClue}` : "";

  return `Detective's Deduction: ${clueSentence} Recommended for their ${occType}. ${budgetClause}${specificClue}`;
};

/**
 * Classifies match level by final composite score
 */
export const determineMatchLevel = (score: number): string => {
  if (score >= 85) return "Investigation Breakthrough (Perfect Match)";
  if (score >= 70) return "Exceptional Match";
  if (score >= 55) return "Strong Match";
  if (score >= 40) return "Promising Match";
  return "Possible Match";
};

/**
 * Scores an individual gift against the full profile
 */
export const calculateGiftScore = (
  gift: GiftIdea,
  profile: RecipientProfile,
  occasion: OccasionDetails = {},
  budget: BudgetCriteria = {}
): ScoredRecommendation => {
  const interests = normalizeList(profile.interests);
  const likes = normalizeList(profile.likes);
  const personalityTraits = normalizeList(profile.personalityTraits);
  const favoriteColors = normalizeList(profile.favoriteColors);
  const dislikes = normalizeList(profile.dislikes);

  // 1. Budget Match
  const budgetResult = matchBudget(gift.estimatedPrice, budget);

  // 2. Interests & Likes Match
  const interestResult = matchInterests(gift, interests, likes);

  // 3. Personality & Vibe Match
  const personalityResult = matchPersonality(gift, personalityTraits);

  // 4. Occasion Match
  const occasionResult = matchOccasion(gift, occasion.type);

  // 5. Favorite Color Match
  const colorResult = matchColors(gift, favoriteColors);

  // 6. Dislikes Check
  const dislikeResult = checkDislikes(gift, dislikes);

  // Composite Calculation
  let baseScore = 20; // Starting baseline
  const compositeScore =
    baseScore +
    budgetResult.score +
    interestResult.score +
    personalityResult.score +
    occasionResult.score +
    colorResult.score +
    dislikeResult.penalty;

  const finalScore = Math.max(0, Math.min(100, compositeScore));

  // Assemble human-readable reasons
  const reasons: string[] = [];
  if (budgetResult.reason && budgetResult.fitsBudget) {
    reasons.push(budgetResult.reason);
  }
  reasons.push(...interestResult.reasons);
  reasons.push(...personalityResult.reasons);
  reasons.push(...occasionResult.reasons);
  reasons.push(...colorResult.reasons);

  // Synthesize detective conclusion
  const detectiveClue = generateDetectiveReason(
    gift,
    profile,
    occasion,
    budget,
    interestResult.matchedTerms,
    personalityResult.matchedTraits,
    budgetResult.fitsBudget
  );

  return {
    gift,
    score: finalScore,
    matchLevel: determineMatchLevel(finalScore),
    reasons,
    detectiveClue,
    potentialConcern: dislikeResult.reason || (!budgetResult.fitsBudget ? budgetResult.reason : undefined),
    breakdown: {
      budgetScore: budgetResult.score,
      interestScore: interestResult.score,
      personalityScore: personalityResult.score,
      occasionScore: occasionResult.score,
      colorScore: colorResult.score,
      dislikePenalty: dislikeResult.penalty,
    },
  };
};

/**
 * Evaluates an entire gift catalog and returns the top recommendations
 */
export const runGiftDetective = (
  gifts: GiftIdea[],
  profile: RecipientProfile,
  occasion: OccasionDetails = {},
  budget: BudgetCriteria = {},
  options: { limit?: number; minScoreThreshold?: number } = {}
): ScoredRecommendation[] => {
  const limit = options.limit ?? 10;
  const threshold = options.minScoreThreshold ?? 35;

  const scoredList = gifts
    .map((gift) => calculateGiftScore(gift, profile, occasion, budget))
    // Filter out severe dislike conflicts
    .filter((scored) => scored.breakdown.dislikePenalty === 0 || scored.score > 50)
    // Filter out low scores unless the catalog is too sparse
    .filter((scored) => scored.score >= threshold);

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.slice(0, limit);
};
