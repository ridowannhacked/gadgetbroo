"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/store/useCart";
import { Check, ShoppingCart, Truck, ShieldCheck, Play, ArrowLeft, Minus, Plus, Star, Loader2, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import ProductCommentsClient from "@/components/storefront/ProductCommentsClient";

export default function ProductDetailsClient({
  product,
  reviews = [],
  canReview = false,
  relatedProducts = []
}: {
  product: any,
  reviews?: any[],
  canReview?: boolean,
  relatedProducts?: any[]
}) {
  const { addItem } = useCart();

  // Sort images so primary is first, or fallback to first uploaded
  const sortedImages = useMemo(() => {
    const arr = [...product.images];
    return arr.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
  }, [product.images]);

  const [activeMedia, setActiveMedia] = useState(sortedImages[0] || null);

  // Variant selection states
  const availableColors = useMemo(() => Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[], [product.variants]);
  const availableSizes = useMemo(() => Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) as string[], [product.variants]);
  const availableStorages = useMemo(() => Array.from(new Set(product.variants.map((v: any) => v.storage).filter(Boolean))) as string[], [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(availableColors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(availableSizes[0] || null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(availableStorages[0] || null);

  const [quantity, setQuantity] = useState<number>(1);

  // Safe selection handlers to prevent invalid combinations
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    const exists = product.variants.find((v: any) => v.color === color && v.size === selectedSize && v.storage === selectedStorage);
    if (!exists) {
      const valid = product.variants.find((v: any) => v.color === color);
      if (valid) {
        if (valid.size) setSelectedSize(valid.size);
        if (valid.storage) setSelectedStorage(valid.storage);
      }
    }
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const exists = product.variants.find((v: any) => v.color === selectedColor && v.size === size && v.storage === selectedStorage);
    if (!exists) {
      const valid = product.variants.find((v: any) => v.size === size);
      if (valid) {
        if (valid.color) setSelectedColor(valid.color);
        if (valid.storage) setSelectedStorage(valid.storage);
      }
    }
  };

  const handleSelectStorage = (storage: string) => {
    setSelectedStorage(storage);
    const exists = product.variants.find((v: any) => v.color === selectedColor && v.size === selectedSize && v.storage === storage);
    if (!exists) {
      const valid = product.variants.find((v: any) => v.storage === storage);
      if (valid) {
        if (valid.color) setSelectedColor(valid.color);
        if (valid.size) setSelectedSize(valid.size);
      }
    }
  };

  // Review form states
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [localReviews, setLocalReviews] = useState(reviews);
  const [localCanReview, setLocalCanReview] = useState(canReview);

  // Find the exact variant based on current selections
  const currentVariant = useMemo(() => {
    // If there is only one variant (e.g. no options), just return it
    if (product.variants.length === 1) return product.variants[0];

    return product.variants.find((v: any) => {
      const matchColor = selectedColor ? v.color === selectedColor : true;
      const matchSize = selectedSize ? v.size === selectedSize : true;
      const matchStorage = selectedStorage ? v.storage === selectedStorage : true;
      return matchColor && matchSize && matchStorage;
    });
  }, [product.variants, selectedColor, selectedSize, selectedStorage]);

  // Fallback to first available variant if combination is totally invalid
  const displayVariant = currentVariant || product.variants[0];

  // Reset quantity if it exceeds new variant's stock
  useEffect(() => {
    if (displayVariant && quantity > displayVariant.stock) {
      setQuantity(Math.max(1, displayVariant.stock));
    }
  }, [displayVariant, quantity]);

  const handleAddToCart = () => {
    if (!displayVariant) return;
    if (displayVariant.stock <= 0) {
      toast.error("This item is out of stock.");
      return;
    }

    const imageUrl = sortedImages[0]?.mediaFile.url || "";

    // Construct variant name
    const variantNameParts = [];
    if (displayVariant.color) variantNameParts.push(displayVariant.color);
    if (displayVariant.size) variantNameParts.push(displayVariant.size);
    if (displayVariant.storage) variantNameParts.push(displayVariant.storage);
    const variantName = variantNameParts.length > 0 ? variantNameParts.join(", ") : "Default";

    addItem({
      variantId: displayVariant.id,
      productId: product.id,
      name: product.name,
      variantName: variantName,
      price: displayVariant.price,
      image: imageUrl,
      stock: displayVariant.stock,
      quantity: quantity,
    });

    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      toast.error("Please enter a review.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating,
          title: reviewTitle,
          content: reviewContent
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Thank you! Your review has been submitted.");
      setLocalCanReview(false);

      // Optimistically add to list
      setLocalReviews([
        {
          id: data.review.id,
          rating,
          title: reviewTitle,
          body: reviewContent,
          createdAt: new Date().toISOString(),
          user: { name: "You" }
        },
        ...localReviews
      ]);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/store" className="hover:text-slate-300 transition-colors">Store</Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

        {/* Left Column: Image/Video Gallery */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 h-fit static lg:sticky lg:top-24 z-10">
          {/* Thumbnail Strip */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar pb-2 lg:pb-0 w-full lg:w-20 flex-shrink-0">
            {sortedImages.map((img: any, idx: number) => {
              const isActive = activeMedia?.id === img.id;
              const isVideo = img.mediaFile.fileType === "video";

              return (
                <button
                  key={img.id}
                  onClick={() => setActiveMedia(img)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-black ${isActive ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800 hover:border-slate-600"
                    }`}
                >
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 relative">
                      <video src={img.mediaFile.url} className="w-full h-full object-cover opacity-60" />
                      <Play className="absolute text-white w-6 h-6 drop-shadow-lg" fill="currentColor" />
                    </div>
                  ) : (
                    <Image
                      src={img.mediaFile.url}
                      alt={`Thumbnail ${idx}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Display */}
          <div className="relative w-full aspect-square lg:aspect-[4/5] bg-[#111318] rounded-3xl overflow-hidden border border-slate-800/60 shadow-2xl flex items-center justify-center">
            {activeMedia ? (
              activeMedia.mediaFile.fileType === "video" ? (
                <video
                  src={activeMedia.mediaFile.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={activeMedia.mediaFile.url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-2 sm:p-8"
                  priority
                />
              )
            ) : (
              <div className="text-slate-600 font-medium">No Image Available</div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFeatured && (
                <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="text-blue-500 font-semibold tracking-wide text-sm uppercase">
              {product.brand}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white">
                ৳{displayVariant.price.toLocaleString()}
              </div>
              {displayVariant.stock > 0 ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  In Stock ({displayVariant.stock})
                </span>
              ) : (
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-800 w-full" />

          {/* Options Selectors */}
          <div className="space-y-6">
            {availableColors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">
                  Color: <span className="text-white font-semibold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedColor === color
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-[#111318]"
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">
                  Size: <span className="text-white font-semibold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleSelectSize(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedSize === size
                        ? "border-white bg-white text-black"
                        : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-[#111318]"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableStorages.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">
                  Storage: <span className="text-white font-semibold">{selectedStorage}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableStorages.map(storage => (
                    <button
                      key={storage}
                      onClick={() => handleSelectStorage(storage)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedStorage === storage
                        ? "border-white bg-white text-black"
                        : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-[#111318]"
                        }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-2 border-slate-800 bg-[#111318] rounded-2xl p-2 w-full sm:w-32 flex-shrink-0">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-white font-semibold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(displayVariant.stock, q + 1))}
                disabled={quantity >= displayVariant.stock}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={displayVariant.stock <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-lg font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(37,99,235,0.2)] disabled:shadow-none"
            >
              <ShoppingCart className="w-5 h-5" />
              {displayVariant.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-800 text-slate-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-blue-400" />
              </div>
              <span>Free delivery on orders over ৳5000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <span>1 Year Official Warranty</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Product Description</h3>
            <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-400">
              {product.description.split('\n').map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 lg:mt-24 border-t border-slate-800 pt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">You Might Also Like</h2>
            <Link
              href={`/store?category=${product.category.slug}`}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              View more from {product.category.name} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {relatedProducts.map((relatedProd) => {
              const primaryImage = relatedProd.images[0]?.mediaFile.url || null;
              const startingPrice = relatedProd.variants[0]?.price;

              return (
                <Link
                  href={`/product/${relatedProd.slug}`}
                  key={relatedProd.id}
                  className="group flex flex-col bg-[#0f1219] border border-slate-800/60 rounded-2xl p-3 sm:p-5 hover:border-slate-700 transition-colors"
                >
                  <div className="aspect-square w-full rounded-xl bg-[#0a0a0a] flex items-center justify-center mb-4 sm:mb-6 overflow-hidden relative">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={relatedProd.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-slate-700 text-xs">No Image</div>
                    )}
                    {relatedProd.isFeatured && (
                      <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] sm:text-xs text-slate-500">{relatedProd.brand}</span>
                      <span className="text-[8px] sm:text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{relatedProd.category.name}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {relatedProd.name}
                    </h3>

                    <div className="mt-auto pt-2 sm:pt-4 flex items-center justify-between">
                      <div className="text-base sm:text-lg font-bold text-slate-200">
                        {startingPrice ? `৳${Number(startingPrice).toFixed(2)}` : 'TBA'}
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <ArrowRight size={12} className="text-white sm:w-[14px] sm:h-[14px]" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {/* Reviews Section */}
      <div className="mt-16 lg:mt-24 border-t border-slate-800 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} fill={
                      localReviews.length > 0 && i < Math.round(localReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / localReviews.length)
                        ? "currentColor" : "none"
                    } className={
                      localReviews.length > 0 && i < Math.round(localReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / localReviews.length)
                        ? "text-amber-500" : "text-slate-700"
                    } />
                  ))}
                </div>
                <span className="text-sm text-slate-400">
                  {localReviews.length > 0
                    ? `Based on ${localReviews.length} review${localReviews.length === 1 ? '' : 's'}`
                    : "No reviews yet"}
                </span>
              </div>
            </div>

            {localCanReview && (
              <div className="bg-[#111318] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 transition-colors"
                        >
                          <Star
                            size={24}
                            fill={star <= rating ? "currentColor" : "none"}
                            className={star <= rating ? "text-amber-500" : "text-slate-700 hover:text-slate-500"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Title (Optional)</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Summary of your experience"
                      className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Review</label>
                    <textarea
                      required
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="What did you like or dislike?"
                      className="w-full h-32 bg-[#0a0a0a] border border-slate-800 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmittingReview && <Loader2 size={16} className="animate-spin" />}
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {!localCanReview && (
              <div className="bg-[#111318]/50 border border-slate-800/50 rounded-2xl p-5 text-sm text-slate-400 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  Only logged-in customers who have purchased and received this item can leave a review. This guarantees 100% verified authentic reviews.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {localReviews.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <Star className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {localReviews.map((review: any) => (
                  <div key={review.id} className="border-b border-slate-800/50 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            {review.user.name}
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border border-blue-500/20">
                              Verified
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(review.createdAt), "MMMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "currentColor" : "none"}
                            className={i < review.rating ? "text-amber-500" : "text-slate-700"}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-white mb-2 text-sm">{review.title}</h4>
                    )}
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {review.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Q&A / Comments Section */}
      <ProductCommentsClient productId={product.id} />

    </div>
  );
}
