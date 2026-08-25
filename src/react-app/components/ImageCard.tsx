import React, { useState, useCallback, useRef, useMemo, useLayoutEffect } from "react";
import { ImageFile } from "../types";
import { getFullUrl } from "../utils/baseUrl";
import { thumbnailSrc } from "../utils/cdnImage";
import { LoadingSpinner } from "./LoadingSpinner";
import { getFormatLabel, getOrientationLabel } from "../utils/imageUtils";
import ContextMenu, { ContextMenuGroup } from "./ContextMenu";
import { showToast } from "./ToastContainer";
import {
  copyOriginalUrl,
  copyWebpUrl,
  copyAvifUrl,
  copyMarkdownLink,
  copyHtmlImgTag,
  copyToClipboard,
} from "../utils/copyImageUtils";
import {
  ClipboardCopyIcon,
  EyeOpenIcon,
  TrashIcon,
  FileIcon,
  CheckIcon,
  Cross1Icon,
  CopyIcon
} from './ui/icons';

// 根据方向确定兜底比例（优先使用元数据 width/height）
const getFallbackAspectRatio = (orientation: string): string => {
  switch (orientation.toLowerCase()) {
    case "portrait":
      return "3 / 4";
    case "landscape":
      return "4 / 3";
    case "square":
      return "1 / 1";
    default:
      return "4 / 3";
  }
};

interface ImageCardProps {
  image: ImageFile;
  onClick: (image: ImageFile) => void;
  onDelete: (id: string) => Promise<void>;
  displayWidth: number;
}

const ImageCard = React.memo(function ImageCard({
  image,
  onClick,
  onDelete,
  displayWidth,
}: ImageCardProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // 使用 useMemo 缓存计算结果
  const isGif = useMemo(() => image.format.toLowerCase() === "gif", [image.format]);
  const aspectRatio = useMemo(() => {
    if (image.width > 0 && image.height > 0) {
      return `${image.width} / ${image.height}`;
    }
    return getFallbackAspectRatio(image.orientation);
  }, [image.width, image.height, image.orientation]);

  const thumb = useMemo(
    () => thumbnailSrc(image.urls?.original || '', displayWidth, isGif),
    [displayWidth, image.urls?.original, isGif]
  );

  useLayoutEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [thumb.src]);

  const handleOpen = useCallback(() => {
    onClick(image);
  }, [onClick, image]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // 处理右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 复制回调
  const handleCopy = useCallback(async (type: string) => {
    try {
      let success = false;

      switch (type) {
        case "original":
          success = await copyOriginalUrl(image);
          break;
        case "webp":
          success = await copyWebpUrl(image);
          break;
        case "avif":
          success = await copyAvifUrl(image);
          break;
        case "markdown":
          success = await copyMarkdownLink(image);
          break;
        case "html":
          success = await copyHtmlImgTag(image);
          break;
      }

      if (success) {
        showToast("复制成功", "success");
      } else {
        showToast("复制失败", "error");
      }
    } catch {
      showToast("复制失败", "error");
    }
  }, [image]);

  // 删除图片
  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return; // 防止重复点击

    // 立即关闭右键菜单，乐观更新会立即移除图片
    closeContextMenu();
    setIsDeleting(true);

    try {
      await onDelete(image.id);
      // 不需要 toast，乐观更新已经处理了 UI
    } catch {
      showToast("删除失败", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [image.id, onDelete, isDeleting, closeContextMenu]);

  // 鼠标事件处理
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // 快捷复制按钮
  const handleQuickCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(getFullUrl(image.urls?.webp || image.urls?.original || ''));
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 2000);
  }, [image.urls]);

  // 右键菜单项 - 使用 useMemo 缓存
  const menuGroups: ContextMenuGroup[] = useMemo(() => [
    {
      id: "copy",
      items: [
        {
          id: "copy-original",
          label: `复制原始链接 (${image.format.toUpperCase()})`,
          onClick: () => handleCopy("original"),
          icon: <ClipboardCopyIcon className="h-4 w-4" />,
        },
        {
          id: "copy-webp",
          label: "复制WebP链接",
          onClick: () => handleCopy("webp"),
          icon: <ClipboardCopyIcon className="h-4 w-4" />,
          disabled: !image.urls?.webp,
        },
        {
          id: "copy-avif",
          label: "复制AVIF链接",
          onClick: () => handleCopy("avif"),
          icon: <ClipboardCopyIcon className="h-4 w-4" />,
          disabled: !image.urls?.avif,
        },
      ],
    },
    {
      id: "format",
      items: [
        {
          id: "copy-markdown",
          label: "复制Markdown标签",
          onClick: () => handleCopy("markdown"),
          icon: <FileIcon className="h-4 w-4" />,
        },
        {
          id: "copy-html",
          label: "复制HTML标签",
          onClick: () => handleCopy("html"),
          icon: <FileIcon className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "actions",
      items: [
        {
          id: "preview",
          label: "预览图片",
          onClick: (e) => {
            e.preventDefault();
            handleOpen();
          },
          icon: <EyeOpenIcon className="h-4 w-4" />,
        },
        {
          id: "delete",
          label: isDeleting ? "删除中..." : "删除图片",
          onClick: handleDelete,
          danger: true,
          disabled: isDeleting,
          icon: isDeleting ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : <TrashIcon className="h-4 w-4" />,
        },
      ],
    },
  ], [image.format, image.urls, handleCopy, handleOpen, handleDelete, isDeleting]);

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden group cursor-pointer bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-gray-700 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:shadow-[0_8px_32px_-8px_rgba(99,102,241,0.25),0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:border-indigo-300/70 dark:hover:border-indigo-500/70 dark:shadow-[0_2px_12px_-3px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_32px_-8px_rgba(99,102,241,0.35)] transition-transform duration-200 h-full ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
        onClick={handleOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        <div
          className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 w-full"
          style={{ aspectRatio }}
        >
          <img
            ref={imgRef}
            src={thumb.src}
            srcSet={thumb.srcSet || undefined}
            sizes={thumb.sizes || undefined}
            alt={image.originalName}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            className={`w-full h-full object-cover ${
              isLoading ? "opacity-0" : "opacity-100 group-hover:scale-105"
            } ${isLoading ? "" : "transition-transform duration-300"}`}
          />

          {isLoading && <LoadingSpinner />}

          {/* Image info overlay */}
          <div
            className={`absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-linear-to-b from-black/60 to-transparent text-white transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex space-x-1">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-xs ${
                  isGif ? "bg-green-500/70" : "bg-blue-500/70"
                }`}
              >
                {getFormatLabel(image.format)}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/70 backdrop-blur-xs">
                {getOrientationLabel(image.orientation)}
              </span>
            </div>

            <button
              onClick={handleQuickCopy}
              className={`p-1.5 rounded-full bg-white/20 backdrop-blur-xs hover:bg-white/40 transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              title="复制URL"
            >
              {copyStatus === "idle" && (
                <CopyIcon className="h-4 w-4" />
              )}
              {copyStatus === "copied" && (
                <CheckIcon className="h-4 w-4 text-green-400" />
              )}
              {copyStatus === "error" && (
                <Cross1Icon className="h-4 w-4 text-red-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 右键菜单 */}
      <ContextMenu
        items={menuGroups}
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={closeContextMenu}
      />
    </>
  );
});

export default ImageCard;
