import { useState } from "react";
import { ImageFile } from "../types";
import { ImageData } from "../types/image";
import { buildMarkdownLink } from "../utils/imageUtils";
import { copyToClipboard } from "../utils/clipboard";
import { getFullUrl } from "../utils/baseUrl";
import { CheckIcon, CopyIcon } from "./ui/icons";

type ImageType = ImageFile | (ImageData & { status: 'success' });

interface ImageUrlsProps {
  image: ImageType;
}

interface LinkItem {
  type: string;
  label: string;
  url: string;
  recommended?: boolean;
}

export const ImageUrls = ({ image }: ImageUrlsProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    copyToClipboard(text)
      .then((success) => {
        if (success) {
          setCopied(type);
          setTimeout(() => setCopied(null), 1600);
        }
      })
      .catch(console.error);
  };

  const originalUrl = getFullUrl(image.urls?.original || "");
  const webpUrl = getFullUrl(image.urls?.webp || "");
  const avifUrl = getFullUrl(image.urls?.avif || "");
  const format = (image.format || "").toLowerCase();
  const isGif = format === "gif";
  const recommendedType = isGif ? "original" : (webpUrl ? "webp" : (avifUrl ? "avif" : "original"));
  const markdownUrl = isGif ? originalUrl : (webpUrl || avifUrl || originalUrl);
  const markdownLink = buildMarkdownLink(markdownUrl, image.originalName || "");

  const links: LinkItem[] = [
    !isGif && webpUrl ? { type: "webp", label: "WebP", url: webpUrl, recommended: recommendedType === "webp" } : null,
    !isGif && avifUrl ? { type: "avif", label: "AVIF", url: avifUrl, recommended: recommendedType === "avif" } : null,
    originalUrl ? { type: "original", label: isGif ? "GIF" : "原图", url: originalUrl, recommended: recommendedType === "original" } : null,
    markdownLink ? { type: "markdown", label: "Markdown", url: markdownLink } : null,
  ].filter(Boolean) as LinkItem[];

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const isCopied = copied === link.type;
        return (
          <div
            key={link.type}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              link.recommended
                ? "border-indigo-200 bg-indigo-50/80 dark:border-indigo-800/60 dark:bg-indigo-950/30"
                : "border-gray-200/80 bg-gray-50/70 dark:border-gray-700/60 dark:bg-gray-800/40"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{link.label}</span>
                {link.recommended && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                    推荐
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-gray-500 dark:text-gray-400">
                {link.url}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(link.url, link.type)}
              className={`btn-secondary shrink-0 ${
                isCopied ? "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400" : ""
              }`}
            >
              {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              <span className="ml-1.5">{isCopied ? "已复制" : "复制"}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
