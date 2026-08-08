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
    description: product.description.substring(0, 160),
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
      <div className="min-h-[70vh] bg-[#0a0a0a] flex items-center justify-center text-slate-300">
        This product is currently unavailable.
      </div>
    );
  }

  // Sanitize the product object to pass to client
  // Passing direct Prisma Decimal objects to Client Components can cause warnings, so we map them to numbers
  const serializedProduct = {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    }))
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-slate-200">
      <ProductDetailsClient 
        product={serializedProduct} 
        reviews={reviews} 
        canReview={canReview} 
      />
    </div>
  );
}
