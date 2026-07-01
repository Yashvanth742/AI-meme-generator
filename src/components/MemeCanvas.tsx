import React, { useRef, useState, useEffect } from "react";
import { MemeText, MemeStyle } from "../types";
import { Upload, Download, Sparkles, Sliders, Type as TypeIcon, Image as ImageIcon, RotateCcw } from "lucide-react";

interface MemeCanvasProps {
  imageUrl: string | null;
  onImageChange: (url: string) => void;
  topText: string;
  setTopText: (text: string) => void;
  bottomText: string;
  setBottomText: (text: string) => void;
  styleMode: MemeStyle;
  setStyleMode: (style: MemeStyle) => void;
  fontFamily: "Impact" | "Inter" | "Space Grotesk" | "JetBrains Mono";
  setFontFamily: (font: "Impact" | "Inter" | "Space Grotesk" | "JetBrains Mono") => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  isMagicLoading: boolean;
  onTriggerMagicCaption: () => void;
  filter: string;
  setFilter: (filter: string) => void;
}

export default function MemeCanvas({
  imageUrl,
  onImageChange,
  topText,
  setTopText,
  bottomText,
  setBottomText,
  styleMode,
  setStyleMode,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textColor,
  setTextColor,
  strokeColor,
  setStrokeColor,
  isMagicLoading,
  onTriggerMagicCaption,
  filter,
  setFilter,
}: MemeCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [topY, setTopY] = useState(10); // percentage from top
  const [bottomY, setBottomY] = useState(90); // percentage from top
  const [isDownloading, setIsDownloading] = useState(false);

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      loadImage(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadImage(files[0]);
    }
  };

  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to trigger download of the compiled meme
  const handleDownload = async () => {
    if (!imageUrl) return;
    setIsDownloading(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d canvas context");

      // Dimensions based on style mode
      let canvasWidth = img.naturalWidth || 800;
      let canvasHeight = img.naturalHeight || 800;
      
      // Let's keep canvas sizing reasonable
      if (canvasWidth > 1200) {
        const ratio = canvasHeight / canvasWidth;
        canvasWidth = 1200;
        canvasHeight = Math.round(1200 * ratio);
      }

      if (styleMode === "twitter") {
        // Twitter style adds a white header block for text
        // Let's compute height for white block: standard is about 20-30% of image height
        const headerHeight = Math.round(canvasHeight * 0.25);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight + headerHeight;

        // Draw white header
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, headerHeight);

        // Draw the image with selected filter
        ctx.save();
        if (filter !== "none") {
          ctx.filter = getCanvasFilterString();
        }
        ctx.drawImage(img, 0, headerHeight, canvasWidth, canvasHeight);
        ctx.restore();

        // Draw Twitter Text
        ctx.fillStyle = "#0f1419"; // dark charcoal
        ctx.textAlign = "left";
        
        // Font size relative to width
        const relativeFontSize = Math.max(16, Math.round(canvasWidth * 0.038));
        const selectedFont = fontFamily === "Impact" ? "Inter" : fontFamily; // Fallback from Impact for Twitter style
        ctx.font = `500 ${relativeFontSize}px "${selectedFont}", sans-serif`;

        // Text wrapping for header
        const text = topText || bottomText || "Meme template";
        const marginX = Math.round(canvasWidth * 0.05);
        const marginY = Math.round(headerHeight * 0.35);
        const maxWidth = canvasWidth - marginX * 2;
        wrapText(ctx, text, marginX, marginY, maxWidth, relativeFontSize * 1.3);

      } else if (styleMode === "news") {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Draw base image with filter
        ctx.save();
        if (filter !== "none") {
          ctx.filter = getCanvasFilterString();
        }
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        ctx.restore();

        // Draw translucent bottom banner
        const bannerHeight = Math.round(canvasHeight * 0.15);
        const bannerY = canvasHeight - bannerHeight;
        
        // Semi-transparent black strip
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, bannerY, canvasWidth, bannerHeight);

        // Live/Breaking badge
        const badgeWidth = Math.round(canvasWidth * 0.22);
        const badgeHeight = Math.round(bannerHeight * 0.6);
        const badgeX = Math.round(canvasWidth * 0.04);
        const badgeY = bannerY + Math.round((bannerHeight - badgeHeight) / 2);

        ctx.fillStyle = "#dc2626"; // red
        ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

        // Draw white badge text
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        const badgeFontSize = Math.max(12, Math.round(badgeHeight * 0.5));
        ctx.font = `900 ${badgeFontSize}px "Space Grotesk", sans-serif`;
        ctx.fillText("BREAKING", badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + badgeFontSize * 0.35);

        // Draw text next to badge
        ctx.fillStyle = "#facc15"; // yellow text
        ctx.textAlign = "left";
        const newsFontSize = Math.max(14, Math.round(bannerHeight * 0.4));
        ctx.font = `bold ${newsFontSize}px "Inter", sans-serif`;
        const textX = badgeX + badgeWidth + Math.round(canvasWidth * 0.03);
        const textY = bannerY + bannerHeight / 2 + newsFontSize * 0.35;
        const textWidth = canvasWidth - textX - Math.round(canvasWidth * 0.04);
        
        const text = bottomText || topText || "Breaking news overlay...";
        const displayNewsText = text.length > 55 ? text.slice(0, 52) + "..." : text;
        ctx.fillText(displayNewsText, textX, textY);

      } else {
        // Classic overlay mode
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Draw image with filter
        ctx.save();
        if (filter !== "none") {
          ctx.filter = getCanvasFilterString();
        }
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        ctx.restore();

        // Configure text style
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Scale font relative to canvas width
        const baseFontSize = (fontSize / 450) * canvasWidth;
        const relativeFontSize = Math.max(14, Math.round(baseFontSize));
        ctx.font = `900 ${relativeFontSize}px "${fontFamily}", sans-serif`;

        // Set colors
        ctx.fillStyle = textColor;
        ctx.strokeStyle = strokeColor;
        // Stroke width relative to canvas size
        ctx.lineWidth = Math.max(2, Math.round(canvasWidth * 0.008));
        ctx.lineJoin = "round";

        // Draw Top Text
        if (topText) {
          const finalTopText = fontFamily === "Impact" ? topText.toUpperCase() : topText;
          const yPos = (topY / 100) * canvasHeight;
          ctx.strokeText(finalTopText, canvasWidth / 2, yPos);
          ctx.fillText(finalTopText, canvasWidth / 2, yPos);
        }

        // Draw Bottom Text
        if (bottomText) {
          const finalBottomText = fontFamily === "Impact" ? bottomText.toUpperCase() : bottomText;
          const yPos = (bottomY / 100) * canvasHeight;
          ctx.strokeText(finalBottomText, canvasWidth / 2, yPos);
          ctx.fillText(finalBottomText, canvasWidth / 2, yPos);
        }
      }

      // Convert to file download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ai_meme_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to render and download meme. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper: Text Wrapping for canvas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  // Helper to map filters to Canvas Filter strings
  const getCanvasFilterString = () => {
    switch (filter) {
      case "grayscale": return "grayscale(100%)";
      case "sepia": return "sepia(100%)";
      case "invert": return "invert(100%)";
      case "vintage": return "contrast(120%) saturate(140%) sepia(30%)";
      case "blur": return "blur(4px)";
      default: return "none";
    }
  };

  // Helper to map filter options to CSS classes
  const getFilterClass = () => {
    switch (filter) {
      case "grayscale": return "grayscale";
      case "sepia": return "sepia";
      case "invert": return "invert";
      case "vintage": return "contrast-125 saturate-125 sepia-[0.2]";
      case "blur": return "blur-xs";
      default: return "";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6" id="meme-canvas-root">
      
      {/* Upload Dropzone / Canvas Preview */}
      <div className="relative">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            2. Design Meme Canvas
          </span>
          {imageUrl && (
            <button
              onClick={onTriggerMagicCaption}
              disabled={isMagicLoading}
              className="text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              id="canvas-magic-caption-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Magic AI Captions
            </button>
          )}
        </h2>

        {/* Dropzone Area */}
        {!imageUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl h-[360px] flex flex-col items-center justify-center gap-4 cursor-pointer p-8 transition-all ${
              isDragOver
                ? "border-indigo-500 bg-indigo-600/5"
                : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/30"
            }`}
            id="upload-dropzone"
          >
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-indigo-400">
              <Upload className="w-8 h-8 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-slate-100 font-semibold text-sm">Drag & drop your image here</p>
              <p className="text-slate-400 text-xs mt-1">Supports PNG, JPG, WebP, GIF</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/10">
              Or Choose File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          /* Live Canvas Preview rendering the meme using HTML Overlay */
          <div className="flex flex-col gap-4">
            <div
              ref={containerRef}
              className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[300px] border border-slate-800"
              style={{ maxHeight: "480px" }}
              id="meme-viewframe"
            >
              {/* If style mode is TWITTER: render a top white box */}
              {styleMode === "twitter" ? (
                <div className="w-full h-full flex flex-col bg-white">
                  <div className="p-4 bg-white text-slate-900 border-b border-slate-100 text-left">
                    <p
                      className="text-base font-semibold leading-relaxed tracking-tight break-words"
                      style={{
                        fontFamily: fontFamily === "Impact" ? "Inter" : fontFamily,
                      }}
                    >
                      {topText || bottomText || "Meme template..."}
                    </p>
                  </div>
                  <div className="relative flex-1 bg-slate-950">
                    <img
                      src={imageUrl}
                      alt="Base Meme"
                      referrerPolicy="no-referrer"
                      className={`w-full h-auto object-contain mx-auto max-h-[340px] ${getFilterClass()}`}
                    />
                  </div>
                </div>
              ) : styleMode === "news" ? (
                /* BREAKING NEWS BADGE STYLE */
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Base Meme"
                    referrerPolicy="no-referrer"
                    className={`w-full max-h-[440px] object-contain ${getFilterClass()}`}
                  />
                  {/* Bottom Red Banner */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-3 flex items-center gap-3 backdrop-blur-xs select-none border-t border-red-500/10">
                    <div className="bg-red-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 tracking-wider uppercase flex items-center shadow-lg shadow-red-600/20">
                      BREAKING
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-yellow-400 font-bold text-xs sm:text-sm tracking-wide truncate max-w-[90%] font-sans uppercase">
                        {bottomText || topText || "BREAKING OVERLAY TEXT..."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* CLASSIC OVERLAY MEME STYLE */
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Base Meme"
                    referrerPolicy="no-referrer"
                    className={`w-full max-h-[440px] object-contain select-none ${getFilterClass()}`}
                  />

                  {/* Top Text Overlay */}
                  {topText && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 text-center w-[92%] break-words select-none font-black leading-tight select-none"
                      style={{
                        top: `${topY}%`,
                        fontSize: `${fontSize}px`,
                        color: textColor,
                        fontFamily: fontFamily,
                        textTransform: fontFamily === "Impact" ? "uppercase" : "none",
                        textShadow: `-2px -2px 0 ${strokeColor}, 2px -2px 0 ${strokeColor}, -2px 2px 0 ${strokeColor}, 2px 2px 0 ${strokeColor}, -3px 0 0 ${strokeColor}, 3px 0 0 ${strokeColor}, 0 -3px 0 ${strokeColor}, 0 3px 0 ${strokeColor}`,
                      }}
                    >
                      {topText}
                    </div>
                  )}

                  {/* Bottom Text Overlay */}
                  {bottomText && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 text-center w-[92%] break-words select-none font-black leading-tight select-none"
                      style={{
                        top: `${bottomY}%`,
                        fontSize: `${fontSize}px`,
                        color: textColor,
                        fontFamily: fontFamily,
                        textTransform: fontFamily === "Impact" ? "uppercase" : "none",
                        textShadow: `-2px -2px 0 ${strokeColor}, 2px -2px 0 ${strokeColor}, -2px 2px 0 ${strokeColor}, 2px 2px 0 ${strokeColor}, -3px 0 0 ${strokeColor}, 3px 0 0 ${strokeColor}, 0 -3px 0 ${strokeColor}, 0 3px 0 ${strokeColor}`,
                      }}
                    >
                      {bottomText}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Editing and Download Toolbar */}
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={() => onImageChange("")}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                id="reset-canvas-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Template
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/15 cursor-pointer disabled:opacity-50"
                id="download-meme-btn"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rendering...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export & Download Meme
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {imageUrl && (
        /* Adjustments and Layout Sliders panel */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-5 text-left" id="design-modifiers">
          {/* Layout and style */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Meme Style & Layout
            </h3>

            <div className="flex gap-2">
              {(["classic", "twitter", "news"] as MemeStyle[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStyleMode(mode)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold capitalize border cursor-pointer transition-all ${
                    styleMode === mode
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/15"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Slider positions (only visible for classic mode) */}
            {styleMode === "classic" && (
              <div className="flex flex-col gap-3.5 mt-2 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Top Text Height</span>
                    <span className="text-slate-300">{topY}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    value={topY}
                    onChange={(e) => setTopY(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Bottom Text Height</span>
                    <span className="text-slate-300">{bottomY}%</span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="95"
                    value={bottomY}
                    onChange={(e) => setBottomY(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Photo Filter Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Photo Filter Overlay</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["none", "grayscale", "sepia", "vintage", "invert", "blur"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`py-1.5 px-2 rounded-lg text-xs border capitalize cursor-pointer transition-colors ${
                      filter === f
                        ? "bg-slate-800 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography options */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <TypeIcon className="w-4 h-4 text-indigo-400" />
              Typography & Fonts
            </h3>

            {/* Font family selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Impact">Impact (Classic Meme Style)</option>
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Space Grotesk">Space Grotesk (Tech Display)</option>
                <option value="JetBrains Mono">JetBrains Mono (Sarcastic Dev)</option>
              </select>
            </div>

            {/* Font size adjustments */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Font Size</span>
                <span className="text-slate-300">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="64"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Color controls */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Text Color</label>
                <div className="flex gap-1.5">
                  {["#ffffff", "#facc15", "#ef4444", "#22c55e", "#000000"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={`w-7 h-7 rounded-full border border-slate-700/60 cursor-pointer transition-transform duration-200 ${
                        textColor === c ? "ring-2 ring-indigo-500 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Stroke / Outline</label>
                <div className="flex gap-1.5">
                  {["#000000", "#ffffff", "#ef4444", "#3b82f6", "transparent"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setStrokeColor(c)}
                      className={`w-7 h-7 rounded-full border border-slate-700/60 cursor-pointer transition-transform duration-200 relative overflow-hidden ${
                        strokeColor === c ? "ring-2 ring-indigo-500 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c === "transparent" ? "white" : c }}
                    >
                      {c === "transparent" && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-red-500 rotate-45" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loader mock
const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
