import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.discountCode.deleteMany();

  // Create Products
  const luxeHairOil = await prisma.product.create({
    data: {
      sku: "BUCCI-OIL-001",
      name: "Luxe Hair Oil",
      slug: "luxe-hair-oil",
      shortDescription: "Argan & vitamin E blend for ultimate shine and strength",
      description:
        "Our signature Luxe Hair Oil combines cold-pressed argan oil with vitamin E and a proprietary blend of botanical extracts to deliver unparalleled shine and strength. This lightweight formula absorbs quickly without leaving residue, taming frizz and adding luminous shine from root to tip. Perfect for all hair types.",
      priceCents: 4800,
      compareAtPriceCents: null,
      category: "oils",
      tags: ["bestseller", "shine", "strength", "argan"],
      isActive: true,
      isFeatured: true,
      weightGrams: 120,
      images: {
        create: [
          {
            url: "/images/products/luxe-hair-oil.jpg",
            altText: "Luxe Hair Oil bottle",
            position: 0,
            isPrimary: true,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 100,
          reservedQuantity: 0,
          lowStockThreshold: 10,
          allowBackorder: false,
        },
      },
    },
  });

  const hydraShampoo = await prisma.product.create({
    data: {
      sku: "BUCCI-SHMP-001",
      name: "Hydra Shampoo",
      slug: "hydra-shampoo",
      shortDescription: "Sulfate-free cleansing with keratin repair complex",
      description:
        "Experience the perfect cleanse with our Hydra Shampoo. This sulfate-free formula gently removes buildup while infusing hair with our keratin repair complex. Fortified with hyaluronic acid for deep hydration that lasts. Leaves hair feeling clean, soft, and beautifully refreshed.",
      priceCents: 3600,
      compareAtPriceCents: null,
      category: "shampoo",
      tags: ["sulfate-free", "keratin", "hydrating", "gentle"],
      isActive: true,
      isFeatured: true,
      weightGrams: 350,
      images: {
        create: [
          {
            url: "/images/products/hydra-shampoo.jpg",
            altText: "Hydra Shampoo bottle",
            position: 0,
            isPrimary: true,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 150,
          reservedQuantity: 0,
          lowStockThreshold: 15,
          allowBackorder: false,
        },
      },
    },
  });

  const silkConditioner = await prisma.product.create({
    data: {
      sku: "BUCCI-COND-001",
      name: "Silk Conditioner",
      slug: "silk-conditioner",
      shortDescription: "Deep moisture treatment with silk proteins",
      description:
        "Transform your hair with our Silk Conditioner. Enriched with hydrolyzed silk proteins and shea butter, this luxurious conditioner delivers intense moisture and detangling power. Hair is left impossibly soft, manageable, and protected against environmental stressors.",
      priceCents: 3800,
      compareAtPriceCents: null,
      category: "conditioner",
      tags: ["silk", "moisture", "detangling", "protein"],
      isActive: true,
      isFeatured: true,
      weightGrams: 350,
      images: {
        create: [
          {
            url: "/images/products/silk-conditioner.jpg",
            altText: "Silk Conditioner bottle",
            position: 0,
            isPrimary: true,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 150,
          reservedQuantity: 0,
          lowStockThreshold: 15,
          allowBackorder: false,
        },
      },
    },
  });

  const defineCream = await prisma.product.create({
    data: {
      sku: "BUCCI-STY-001",
      name: "Define Cream",
      slug: "define-cream",
      shortDescription: "Hold & definition without the crunch",
      description:
        "Achieve perfect definition with our Define Cream. This lightweight styling cream provides flexible hold that moves with you, never crunchy or stiff. Formulated with natural butters and botanical extracts to enhance curls, tame flyaways, and add touchable definition that lasts all day.",
      priceCents: 3200,
      compareAtPriceCents: null,
      category: "styling",
      tags: ["new", "styling", "definition", "curls", "hold"],
      isActive: true,
      isFeatured: true,
      weightGrams: 200,
      images: {
        create: [
          {
            url: "/images/products/define-cream.jpg",
            altText: "Define Cream jar",
            position: 0,
            isPrimary: true,
          },
        ],
      },
      inventory: {
        create: {
          quantity: 80,
          reservedQuantity: 0,
          lowStockThreshold: 10,
          allowBackorder: false,
        },
      },
    },
  });

  // Create the Signature Set Bundle
  const signatureSet = await prisma.bundle.create({
    data: {
      name: "The Signature Set",
      slug: "signature-set",
      description:
        "Our complete hair care ritual. Includes Hydra Shampoo, Silk Conditioner, and Luxe Hair Oil—everything you need for salon-worthy results at home.",
      priceCents: 11000,
      compareAtPriceCents: 12200,
      imageUrl: "/images/products/signature-set.jpg",
      isActive: true,
      items: {
        create: [
          { productId: hydraShampoo.id, quantity: 1 },
          { productId: silkConditioner.id, quantity: 1 },
          { productId: luxeHairOil.id, quantity: 1 },
        ],
      },
    },
  });

  // Create a discount code
  await prisma.discountCode.create({
    data: {
      code: "WELCOME15",
      type: "PERCENTAGE",
      value: 15,
      minimumOrderCents: 5000,
      maxUses: 1000,
      currentUses: 0,
      isActive: true,
    },
  });

  console.log("✅ Seeding complete!");
  console.log(`   Created ${4} products`);
  console.log(`   Created ${1} bundle (The Signature Set)`);
  console.log(`   Created ${1} discount code (WELCOME15)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
