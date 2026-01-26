import { prisma } from "@/lib/prisma";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: string;
  color: string;
  popular: boolean;
  features: string[];
  notIncluded: string[];
}

export interface AdditionalService {
  id: string;
  name: string;
  price: string;
  description: string;
}

// Fetch all pricing plans
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const dbPlans = await prisma.pricingPackage.findMany({
    orderBy: { order: "asc" },
  });

  return dbPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    icon: p.icon,
    color: p.color,
    popular: p.popular,
    features: p.features,
    notIncluded: p.notIncluded,
  }));
}

// Get popular/highlighted plan
export async function getPopularPlan(): Promise<PricingPlan | null> {
  const dbPlan = await prisma.pricingPackage.findFirst({
    where: { popular: true },
  });

  if (!dbPlan) return null;

  return {
    id: dbPlan.id,
    name: dbPlan.name,
    price: dbPlan.price,
    description: dbPlan.description,
    icon: dbPlan.icon,
    color: dbPlan.color,
    popular: dbPlan.popular,
    features: dbPlan.features,
    notIncluded: dbPlan.notIncluded,
  };
}

// Fetch additional services
export async function getAdditionalServices(): Promise<AdditionalService[]> {
  const dbServices = await prisma.additionalService.findMany({
    orderBy: { order: "asc" },
  });

  return dbServices.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    description: s.description,
  }));
}
