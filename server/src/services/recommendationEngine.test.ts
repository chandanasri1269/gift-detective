import assert from "node:assert/strict";
import { test } from "node:test";
import type { GiftIdea } from "@prisma/client";
import { matchBudget, runGiftDetective } from "./recommendationEngine";

const createGift = (overrides: Partial<GiftIdea> = {}): GiftIdea => ({
  id: "gift-1",
  title: "Watercolor painting kit",
  description: "A creative painting set for weekend projects",
  estimatedPrice: 1500,
  currency: "INR",
  category: "Hobbies",
  tags: ["painting", "art", "creative"],
  affiliateUrl: null,
  imageUrl: null,
  detectiveClue: "A thoughtful gift for a creative artist.",
  vibe: "creative",
  isCurated: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

test("budget matching accepts prices inside the selected range", () => {
  assert.equal(matchBudget(1500, { min: 1000, max: 2000 }).fitsBudget, true);
  assert.equal(matchBudget(2500, { min: 1000, max: 2000 }).fitsBudget, false);
});

test("recommendations rank gifts matching recipient clues first", () => {
  const genericGift = createGift({
    id: "generic",
    title: "Basic desk organizer",
    description: "A practical organizer for everyday office supplies",
    category: "Home",
    tags: ["office", "storage"],
    vibe: "practical",
  });
  const paintingGift = createGift();

  const recommendations = runGiftDetective(
    [genericGift, paintingGift],
    { interests: ["painting"], personalityTraits: ["creative"] },
    { type: "Birthday" },
    { min: 1000, max: 2000 },
    { minScoreThreshold: 0 }
  );

  assert.equal(recommendations[0]?.gift.id, paintingGift.id);
});

test("recommendations exclude gifts that conflict with strong dislikes", () => {
  const dislikedGift = createGift();
  const safeGift = createGift({
    id: "safe",
    title: "Basic desk organizer",
    description: "A practical organizer for everyday office supplies",
    category: "Home",
    tags: ["office", "storage"],
    vibe: "practical",
  });

  const recommendations = runGiftDetective(
    [dislikedGift, safeGift],
    { dislikes: ["painting"] },
    {},
    {},
    { minScoreThreshold: 0 }
  );

  assert.deepEqual(recommendations.map(({ gift }) => gift.id), [safeGift.id]);
});