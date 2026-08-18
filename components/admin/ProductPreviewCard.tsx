import { ArrowRight, Play } from "lucide-react";

type UploadedMedia = {
  url: string;
  fileId: string;
  name: string;
  isPrimary: boolean;
  mediaType: "image" | "video";
};

interface ProductPreviewCardProps {
  name?: string;
  brand?: string;
  price?: number | string;
  isFeatured?: boolean;
  uploadedMedia: UploadedMedia[];
  youtubeUrls?: string[];
}

export function ProductPreviewCard({
  name,
  brand,
  price,
  isFeatured,
  uploadedMedia,
  youtubeUrls,
}: ProductPreviewCardProps) {
  const primaryMedia = uploadedMedia.find((m) => m.isPrimary) || uploadedMedia[0];
  const hasVideo = uploadedMedia.some((m) => m.mediaType === "video");

  return (
    <div className="hidden xl:block w-[320px] 2xl:w-[380px] shrink-0 sticky top-24 pt-10">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
        Customer Preview
      </h2>

      <div className="bg-card border border-border/60 rounded-2xl p-4 hover:border-primary/50 transition-colors relative shadow-sm">
        <div className="aspect-square w-full rounded-xl bg-muted/30 flex items-center justify-center mb-4 overflow-hidden relative">
          {primaryMedia ? (
            primaryMedia.mediaType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${primaryMedia.url}${primaryMedia.url.includes("?") ? "&" : "?"}tr=w-400`}
                alt="Preview"
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <video src={primaryMedia.url} className="w-full h-full object-cover" muted playsInline />
            )
          ) : (
            <div className="text-muted-foreground text-xs">No Image</div>
          )}
          {isFeatured && (
            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>{brand || "Brand"}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 min-h-[40px]">
            {name || "Product Name"}
          </h3>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="text-base font-bold text-foreground">
              {price ? `৳${Number(price).toFixed(2)}` : "৳0.00"}
            </div>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <ArrowRight size={12} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Small thumbnails preview */}
      {uploadedMedia.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
          {uploadedMedia.slice(0, 4).map((m) => (
            <div
              key={m.fileId}
              className={`w-12 h-12 rounded-md overflow-hidden shrink-0 border-2 ${
                m.isPrimary ? "border-primary" : "border-border"
              }`}
            >
              {m.mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${m.url}${m.url.includes("?") ? "&" : "?"}tr=w-100`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <video src={m.url} className="w-full h-full object-cover bg-black" />
              )}
            </div>
          ))}
        </div>
      )}

      {hasVideo && (
        <div className="mt-3 flex items-center gap-2 bg-card border border-border rounded-lg p-2.5 text-xs text-muted-foreground">
          <div className="bg-primary/20 p-1.5 rounded-full text-primary">
            <Play size={12} />
          </div>
          Video attached
        </div>
      )}

      {youtubeUrls && youtubeUrls.length > 0 && (
        <div className="mt-2 flex items-center gap-2 bg-card border border-border rounded-lg p-2.5 text-xs text-muted-foreground">
          <div className="bg-red-500/20 p-1.5 rounded-full text-red-500">
            <Play size={12} />
          </div>
          {youtubeUrls.length} YouTube Ad{youtubeUrls.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
