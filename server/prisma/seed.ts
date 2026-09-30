import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleGifts = [
  {
    title: "Temperature-Control Smart Mug",
    description: "Keeps coffee or tea at the exact preferred temperature for up to 3 hours or all day on the charging coaster.",
    estimatedPrice: 129.99,
    category: "Tech & Gadgets",
    tags: ["tech", "coffee", "office", "practical"],
    vibe: "Practical",
    detectiveClue: "The subject frequently reheats coffee in the microwave or works long desk hours.",
    affiliateUrl: "https://example.com/smart-mug",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
  {
    title: "Artisan Sourdough Baking Kit",
    description: "Complete banneton basket, lame scoring tool, Danish dough whisk, and starter crock for home bakers.",
    estimatedPrice: 48.0,
    category: "Food & Cooking",
    tags: ["baking", "cooking", "diy", "foodie"],
    vibe: "Thoughtful",
    detectiveClue: "The subject enjoys hands-on hobbies, homemade meals, or therapeutic weekend rituals.",
    affiliateUrl: "https://example.com/sourdough-kit",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
  {
    title: "Noise-Cancelling Over-Ear Headphones",
    description: "Spatial audio, active noise cancellation, 30-hour battery life, and ultra-plush memory foam cushions.",
    estimatedPrice: 249.99,
    category: "Tech & Gadgets",
    tags: ["tech", "audio", "travel", "music", "focus"],
    vibe: "Luxury",
    detectiveClue: "The subject loves deep focus, commutes regularly, or is passionate about music and podcasts.",
    affiliateUrl: "https://example.com/headphones",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
  {
    title: "Vintage Leather Travel Watch Roll",
    description: "Handcrafted full-grain leather organizer holds 3 timepieces safely with removable cushions.",
    estimatedPrice: 65.0,
    category: "Fashion & Accessories",
    tags: ["leather", "style", "travel", "accessories"],
    vibe: "Luxury",
    detectiveClue: "The subject pays attention to personal style, travels frequently, or collects timepieces.",
    affiliateUrl: "https://example.com/watch-roll",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
  {
    title: "Indoor Herb Garden Hydroponic Kit",
    description: "LED grow light garden with auto-watering timer for fresh basil, mint, and thyme right on the kitchen counter.",
    estimatedPrice: 79.5,
    category: "Home & Living",
    tags: ["gardening", "green", "home", "cooking"],
    vibe: "Thoughtful",
    detectiveClue: "The subject loves fresh ingredients or greenery but may lack outdoor garden space.",
    affiliateUrl: "https://example.com/herb-garden",
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
  {
    title: "Retro Mechanical Keyboard with Custom Switches",
    description: "Clicky tactile mechanical keyboard with typewriter-inspired round keycaps and RGB backlighting.",
    estimatedPrice: 95.0,
    category: "Tech & Gadgets",
    tags: ["gaming", "desk", "retro", "aesthetic"],
    vibe: "Fun",
    detectiveClue: "The subject spends hours typing, gaming, or curating an aesthetic desk setup.",
    affiliateUrl: "https://example.com/mechanical-keyboard",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
  {
    title: "World Coffee Tour Tasting Box",
    description: "Curated whole bean samples from Ethiopia, Colombia, Guatemala, and Sumatra with roast notes and tasting guide.",
    estimatedPrice: 38.0,
    category: "Food & Cooking",
    tags: ["coffee", "tasting", "gourmet", "drinks"],
    vibe: "Thoughtful",
    detectiveClue: "The subject is a coffee enthusiast who appreciates distinct origins and brewing methods.",
    affiliateUrl: "https://example.com/coffee-tour",
    imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
  {
    title: "Weighted Bamboo Cooling Blanket",
    description: "15 lb breathable bamboo viscose weighted blanket designed to reduce stress and improve deep sleep without overheating.",
    estimatedPrice: 89.0,
    category: "Home & Living",
    tags: ["wellness", "sleep", "cozy", "relaxation"],
    vibe: "Thoughtful",
    detectiveClue: "The subject values wellness, relaxation, or complains about stress and restless sleep.",
    affiliateUrl: "https://example.com/weighted-blanket",
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
    isCurated: true,
  },
];

async function main() {
  console.log("Seeding initial gift ideas...");
  for (const gift of sampleGifts) {
    await prisma.giftIdea.create({
      data: gift,
    });
  }
  console.log(`Successfully seeded ${sampleGifts.length} gift ideas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
