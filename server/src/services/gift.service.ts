import prisma from "../lib/prisma";
import { ApiError } from "../middleware/error.middleware";

export interface GiftFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  vibe?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getFilteredGifts = async (params: GiftFilterParams) => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (params.category) {
    whereClause.category = {
      equals: params.category,
      mode: "insensitive",
    };
  }

  if (params.vibe) {
    whereClause.vibe = {
      equals: params.vibe,
      mode: "insensitive",
    };
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    whereClause.estimatedPrice = {};
    if (params.minPrice !== undefined) {
      whereClause.estimatedPrice.gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      whereClause.estimatedPrice.lte = params.maxPrice;
    }
  }

  if (params.search) {
    const term = params.search.trim();
    whereClause.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { tags: { has: term.toLowerCase() } },
      { category: { contains: term, mode: "insensitive" } },
    ];
  }

  const [gifts, total] = await Promise.all([
    prisma.giftIdea.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { estimatedPrice: "asc" },
    }),
    prisma.giftIdea.count({ where: whereClause }),
  ]);

  return {
    gifts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getGiftById = async (id: string) => {
  const gift = await prisma.giftIdea.findUnique({
    where: { id },
  });

  if (!gift) {
    throw new ApiError(404, "Gift not found");
  }

  return gift;
};
