import type { Metadata } from "next";

import ShopCategoryClient from "./ShopCategoryClient";

const titleByCategory: Record<string, string> = {
  consoles: "Consoles Shop – TitanGaming",
  peripherals: "Gaming Accessories Shop – TitanGaming",
  prebuilt: "Pre-built Gaming PCs – TitanGaming",
};

const descriptionByCategory: Record<string, string> = {
  consoles: "Browse PS5, Xbox Series X and Nintendo Switch consoles curated for next-gen gaming.",
  peripherals: "Discover esports-grade keyboards, mice and headsets for competitive play.",
  prebuilt:
    "Explore curated pre-built gaming PCs tuned for esports, 1440p arena matches and cinematic 4K campaigns.",
};

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const key = category.toLowerCase();

  const fallbackTitle = "Shop – TitanGaming";
  const fallbackDescription =
    "Browse TitanGaming's curated catalog of consoles, pre-built PCs and gaming accessories.";

  return {
    title: titleByCategory[key] ?? fallbackTitle,
    description: descriptionByCategory[key] ?? fallbackDescription,
  };
}

const ShopCategoryPage = async ({ params }: PageProps) => {
  const { category } = await params;

  return <ShopCategoryClient category={category} />;
};

export default ShopCategoryPage;
