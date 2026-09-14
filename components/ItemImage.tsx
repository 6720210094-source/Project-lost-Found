import type { ImgHTMLAttributes } from "react";

const PLACEHOLDER_IMAGE = "/images/item-placeholder.svg";

function resolveImageUrl(value?: string | null, fallback = PLACEHOLDER_IMAGE) {
  if (!value || !value.trim()) {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("data:") || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `${window.location.protocol}${trimmed}`;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${window.location.origin}${normalized}`;
}

type ItemImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

export default function ItemImage({
  src,
  alt,
  className,
  fallbackSrc = PLACEHOLDER_IMAGE,
  ...props
}: ItemImageProps) {
  const safeSrc = resolveImageUrl(src, fallbackSrc);

  return (
    <img
      {...props}
      src={safeSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        const target = event.currentTarget;
        const fallbackUrl = resolveImageUrl(fallbackSrc, PLACEHOLDER_IMAGE);

        if (target.src === fallbackUrl) {
          return;
        }

        target.onerror = null;
        target.src = fallbackUrl;
      }}
    />
  );
}
