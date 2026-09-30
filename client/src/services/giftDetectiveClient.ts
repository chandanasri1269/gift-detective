import { INITIAL_GIFTS } from "../data/seedGifts";
import type { GiftItem } from "../data/seedGifts";

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
  date?: string;
}

export interface BudgetCriteria {
  min?: number;
  max?: number;
}

export interface ScoredRecommendation {
  gift: GiftItem;
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

export const matchBudget = (
  price: number,
  budget?: BudgetCriteria
): { score: number; fitsBudget: boolean; reason?: string } => {
  if (!budget || (!budget.min && !budget.max)) {
    return { score: 15, fitsBudget: true, reason: "No restrictive budget specified" };
  }

  const min = budget.min ?? 0;
  const max = budget.max ?? Infinity;

  if (price >= min && price <= max) {
    const formatted = max === Infinity ? `₹${min}+` : `₹${min.toLocaleString("en-IN")}–₹${max.toLocaleString("en-IN")}`;
    return {
      score: 30,
      fitsBudget: true,
      reason: `Fits comfortably within your ${formatted} budget (₹${price.toLocaleString("en-IN")})`,
    };
  }

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

  if (price > max) {
    const overage = (price - max) / max;
    if (overage <= 0.15) {
      return {
        score: 5,
        fitsBudget: false,
        reason: `Slightly exceeds budget (₹${price.toLocaleString("en-IN")} vs ₹${max.toLocaleString("en-IN")}) but provides exceptional value`,
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

export const calculateGiftScore = (
  gift: GiftItem,
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

  // 2. Interests & Likes
  const giftCorpus = [gift.title, gift.description, gift.category, ...gift.tags].join(" ").toLowerCase();
  const matchedInterests: string[] = [];
  let interestScore = 0;

  for (const item of [...interests, ...likes]) {
    if (giftCorpus.includes(item) || gift.tags.some((t) => t.toLowerCase().includes(item))) {
      matchedInterests.push(item);
      interestScore += 14;
    }
  }
  interestScore = Math.min(interestScore, 45);

  // 3. Personality Traits
  const affinityMap: Record<string, string[]> = {
    creative: ["art", "diy", "creative", "craft", "writing", "baking", "aesthetic", "music"],
    introvert: ["cozy", "reading", "books", "home", "sleep", "wellness", "tea", "coffee"],
    adventurous: ["travel", "outdoor", "fitness", "gear", "exploration", "action"],
    minimalist: ["sleek", "practical", "minimal", "desk", "functional", "organized"],
    "tech-savvy": ["tech", "gadgets", "gaming", "smart", "electronic", "audio"],
    calm: ["peaceful", "aromatherapy", "tea", "wellness", "cozy", "mindfulness"],
    foodie: ["gourmet", "tasting", "cooking", "chocolate", "coffee", "baking", "snacks"],
    sentimental: ["personalized", "custom", "keepsake", "memory", "jewelry", "engraved"],
  };

  const matchedTraits: string[] = [];
  let personalityScore = 0;
  for (const trait of personalityTraits) {
    const words = affinityMap[trait] || [trait];
    if (words.some((w) => giftCorpus.includes(w) || gift.vibe.toLowerCase().includes(w))) {
      matchedTraits.push(trait);
      personalityScore += 12;
    }
  }
  personalityScore = Math.min(personalityScore, 25);

  // 4. Occasion
  let occasionScore = 5;
  const occType = (occasion.type || "General").toLowerCase();
  const occasionAffinities: Record<string, string[]> = {
    birthday: ["celebration", "personal", "fun", "luxury", "gadgets", "personalized"],
    anniversary: ["romantic", "luxury", "keepsake", "jewelry", "personalized", "sentimental"],
    valentine: ["romantic", "chocolate", "sentimental", "cozy", "jewelry"],
    christmas: ["festive", "cozy", "gourmet", "family"],
    graduation: ["professional", "tech", "desk", "leather", "books"],
    housewarming: ["home", "kitchen", "living", "decor", "plants"],
  };
  const occasionWords = occasionAffinities[occType] || [occType];
  if (occasionWords.some((w) => giftCorpus.includes(w))) {
    occasionScore = 12;
  }

  // 5. Color Match
  const matchedColors: string[] = [];
  let colorScore = 0;
  for (const color of favoriteColors) {
    if (giftCorpus.includes(color)) {
      matchedColors.push(color);
      colorScore = 8;
    }
  }

  // 6. Dislikes Check
  let dislikePenalty = 0;
  let dislikeReason: string | undefined;
  for (const d of dislikes) {
    if (d && giftCorpus.includes(d)) {
      dislikePenalty = -45;
      dislikeReason = `Recipient indicated an aversion to "${d}".`;
      break;
    }
  }

  // Final Composite Score
  const baseScore = 20;
  const composite =
    baseScore +
    budgetResult.score +
    interestScore +
    personalityScore +
    occasionScore +
    colorScore +
    dislikePenalty;

  const finalScore = Math.max(0, Math.min(100, composite));

  // Assemble reasons
  const reasons: string[] = [];
  if (budgetResult.reason && budgetResult.fitsBudget) {
    reasons.push(budgetResult.reason);
  }
  if (matchedInterests.length > 0) {
    reasons.push(`Directly connects with their passion for ${Array.from(new Set(matchedInterests)).slice(0, 3).join(", ")}`);
  }
  if (matchedTraits.length > 0) {
    reasons.push(`Complements their ${matchedTraits.join(" & ")} personality`);
  }
  if (occasionScore > 5 && occasion.type) {
    reasons.push(`Handpicked to suit a festive ${occasion.type} celebration`);
  }
  if (matchedColors.length > 0) {
    reasons.push(`Available in their favorite color (${matchedColors.join(", ")})`);
  }

  // Match Level
  let matchLevel = "Possible Match";
  if (finalScore >= 85) matchLevel = "Investigation Breakthrough (Perfect Match)";
  else if (finalScore >= 70) matchLevel = "Exceptional Match";
  else if (finalScore >= 55) matchLevel = "Strong Match";
  else if (finalScore >= 40) matchLevel = "Promising Match";

  // Detective Deduction
  const name = profile.name || "the recipient";
  const relationship = profile.relationship || "friend";
  const clues: string[] = [];
  if (matchedInterests.length > 0) clues.push(`clear passion for ${matchedInterests.join(" and ")}`);
  if (matchedTraits.length > 0) clues.push(`distinctly ${matchedTraits.join(" & ")} traits`);
  const clueSentence =
    clues.length > 0
      ? `Evidence points to ${name}'s ${clues.join(", with a ")}.`
      : `Based on investigative clues gathered for your ${relationship} ${name}.`;
  const specificClue = gift.detectiveClue ? ` Clue: ${gift.detectiveClue}` : "";
  const detectiveClue = `Detective's Deduction: ${clueSentence} Recommended for their ${occasion.type || "celebration"}. ${budgetResult.fitsBudget ? "Fits your specified budget parameters." : ""}${specificClue}`;

  return {
    gift,
    score: finalScore,
    matchLevel,
    reasons,
    detectiveClue,
    potentialConcern: dislikeReason,
    breakdown: {
      budgetScore: budgetResult.score,
      interestScore,
      personalityScore,
      occasionScore,
      colorScore,
      dislikePenalty,
    },
  };
};

export const runLocalDetective = (
  profile: RecipientProfile,
  occasion: OccasionDetails = {},
  budget: BudgetCriteria = {},
  limit = 10
): ScoredRecommendation[] => {
  const scored = INITIAL_GIFTS.map((gift) => calculateGiftScore(gift, profile, occasion, budget))
    .filter((s) => s.breakdown.dislikePenalty === 0 || s.score > 50)
    .filter((s) => s.score >= 25);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
};
