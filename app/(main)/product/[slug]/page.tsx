import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/helpers/get-servesession";
import ProductDetailsClient from "./ProductDetailsClient";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate SEO Metadata
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      images: {
        where: { isPrimary: true },
        include: { mediaFile: true },
        take: 1,
      }
    }
  });

  if (!product) {
    return { title: "Product Not Found | GadgetBroo" };
  }

  return {
    title: `${product.name} - GadgetBroo`,
    description: product.description.replace(/<[^>]*>?/gm, '').substring(0, 160),
    keywords: product.tags?.join(", "),
    openGraph: {
      images: product.images[0]?.mediaFile.url ? [`${product.images[0].mediaFile.url}?tr=w-1200`] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await prisma.product.findFirst({
    where: { 
      slug: resolvedParams.slug,
      isActive: true,
      isDeleted: false,
    },
    include: {
      category: true,
      images: {
        include: { mediaFile: true },
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        where: { isActive: true, isDeleted: false },
        orderBy: { price: 'asc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const session = await getServerSession();

  // Fetch verified reviews for this product
  const reviews = await prisma.review.findMany({
    where: { productId: product.id, isVisible: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate if the current user can leave a review
  let canReview = false;
  if (session?.user) {
    const deliveredOrder = await prisma.orderItem.findFirst({
      where: {
        order: { userId: session.user.id, status: "DELIVERED" },
        variant: { productId: product.id }
      }
    });
    
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId: session.user.id
        }
      }
    });

    canReview = !!deliveredOrder && !existingReview;
  }

  // Ensure there's at least one variant available to purchase
  if (product.variants.length === 0) {
    return (
      <div className="min-h-[70vh] bg-background flex items-center justify-center text-muted-foreground">
        This product is currently unavailable.
      </div>
    );
  }

  // Fetch related products (same category, excluding this one)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      isDeleted: false,
    },
    take: 4,
    include: {
      category: true,
      images: {
        where: { isPrimary: true },
        include: { mediaFile: true },
        take: 1
      },
      variants: {
        where: { isActive: true, isDeleted: false },
        orderBy: { price: 'asc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Sanitize the product object to pass to client
  const serializedProduct = {
    ...product,
    options: product.options as any,
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      attributes: v.attributes as Record<string, string> | null,
    }))
  };

  const serializedRelatedProducts = relatedProducts.map(rp => ({
    ...rp,
    variants: rp.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      attributes: v.attributes as Record<string, string> | null,
    }))
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images[0]?.mediaFile.url || "",
    "description": product.description.replace(/<[^>]*>?/gm, ''),
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "keywords": product.tags?.join(", "),
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "BDT",
      "lowPrice": Math.min(...product.variants.map(v => Number(v.price))),
      "highPrice": Math.max(...product.variants.map(v => Number(v.price))),
      "offerCount": product.variants.length,
      "availability": product.variants.some(v => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient 
        product={serializedProduct} 
        reviews={reviews} 
        canReview={canReview} 
        relatedProducts={serializedRelatedProducts}
      />
    </div>
  );
}
