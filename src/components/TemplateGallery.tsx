import React, { useState } from "react";
import { MemeTemplate } from "../types";
import { Sparkles, Search, Image as ImageIcon, Flame, Check, Loader2 } from "lucide-react";

interface TemplateGalleryProps {
  onSelectTemplate: (url: string, name: string) => void;
  selectedTemplateUrl: string | null;
}

const DEFAULT_TEMPLATES: MemeTemplate[] = [
  {
    id: "grumpy-cat",
    name: "Sarcastic Grumpy Cat",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80",
    description: "Classic annoyed cat looking at the camera, perfect for disappointment, sarcasm, or disapproval.",
    category: "classic",
    defaultTexts: { top: "WHEN SOMETHING GOES WRONG", bottom: "AND NO ONE IS SURPRISED" },
  },
  {
    id: "determined-shiba",
    name: "The Focused Shiba",
    url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80",
    description: "Shiba Inu on a desk looking at a computer. Ideal for coding struggles, deep work, or confusion.",
    category: "reaction",
    defaultTexts: { top: "ME IN THE FIRST 5 MINUTES OF CODING", bottom: "VS THE REST OF THE DAY" },
  },
  {
    id: "sweating-decisions",
    name: "Anxious Decision Making",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    description: "Anxious look, perfect for choosing between two equally difficult or ridiculous options.",
    category: "reaction",
    defaultTexts: { top: "FIX THE BUG WITHOUT TOUCHING OTHER CODE", bottom: "REWRITE THE ENTIRE PROJECT FROM SCRATCH" },
  },
  {
    id: "ultimate-success",
    name: "The Ultimate Victory",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80",
    description: "Determined toddler with clenched fist. Perfect for small daily victories or surviving an ordeal.",
    category: "classic",
    defaultTexts: { top: "CODE BUILDS SUCCESSFULLY", bottom: "ON THE VERY FIRST TRY" },
  },
  {
    id: "mind-blown-space",
    name: "Brain Expansion",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    description: "Cosmic mind blown visual, ideal for absurd shower thoughts, deep insights, or sudden realizations.",
    category: "modern",
    defaultTexts: { top: "REALIZING THAT COOKIES ARE JUST", bottom: "CRUSTY CAKE SLICES" },
  },
  {
    id: "coffee-shock",
    name: "Shocked Programmer",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    description: "Person at a laptop looking shocked, perfect for seeing bad code, unexpected messages, or notifications.",
    category: "modern",
    defaultTexts: { top: "CHECKING MY REPO'S OPEN ISSUES", bottom: "AFTER ONE DAY OF DEPLOYMENT" },
  },
  {
    id: "disaster-flame",
    name: "This Is Fine Fire",
    url: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=800&auto=format&fit=crop&q=80",
    description: "Bright burning campfire, ideal for pretending everything is fine while chaos happens.",
    category: "classic",
    defaultTexts: { top: "THE PROD SERVER IS CURRENTLY DOWN", bottom: "I AM SURE IT WILL REBOOT ITSELF" },
  },
  {
    id: "thinker-suit",
    name: "Galaxy Brain Thinking",
    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    description: "Thoughtful man in suit with pointing finger, excellent for galaxy brain logic or clever lifehacks.",
    category: "classic",
    defaultTexts: { top: "CAN'T HAVE SECURITY BUGS IN YOUR CODE", bottom: "IF YOU NEVER WRITE ANY CODE" },
  },
];

export default function TemplateGallery({
  onSelectTemplate,
  selectedTemplateUrl,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<MemeTemplate[]>(DEFAULT_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // AI Base Image Generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateAIImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          aspectRatio: "1:1",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate AI template");
      }

      const data = await response.json();
      
      const newTemplate: MemeTemplate = {
        id: `ai-template-${Date.now()}`,
        name: `AI: ${aiPrompt.slice(0, 25)}...`,
        url: data.imageUrl,
        description: `AI-generated template from prompt: "${aiPrompt}"`,
        category: "ai-generated",
        defaultTexts: { top: "AI GENERATED", bottom: "ADD YOUR TEXT HERE" }
      };

      setTemplates((prev) => [newTemplate, ...prev]);
      onSelectTemplate(newTemplate.url, newTemplate.name);
      setAiPrompt("");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong generating the template.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6" id="template-gallery">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            1. Select a Base Image
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {filteredTemplates.length} Templates
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search classic templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            id="template-search"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 flex-wrap" id="category-filters">
          {["all", "classic", "reaction", "modern", "ai-generated"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "🔥 All Trends" : cat === "ai-generated" ? "✨ AI Generated" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of templates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1 mb-6 scrollbar-thin scrollbar-thumb-slate-800" id="template-grid">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplateUrl === template.url;
          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.url, template.name)}
              className={`group relative rounded-xl overflow-hidden bg-slate-950 aspect-square border cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-500/40"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <img
                src={template.url}
                alt={template.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-2 flex flex-col justify-end opacity-90 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[11px] font-bold truncate">{template.name}</p>
                <p className="text-slate-400 text-[9px] truncate line-clamp-1">{template.description}</p>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="col-span-4 py-8 text-center text-slate-500 text-sm">
            No templates found matching your search.
          </div>
        )}
      </div>

      {/* AI Template Prompt Box */}
      <div className="border-t border-slate-800/80 pt-5">
        <form onSubmit={handleGenerateAIImage} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Create a custom AI Template
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Describe any template concept and we'll use <span className="font-mono text-indigo-300">gemini-3.1-flash-image-preview</span> to generate a brand new base image.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., 'A cute programmer hamster panicking over code'..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isGenerating}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              id="ai-prompt-input"
            />
            <button
              type="submit"
              disabled={isGenerating || !aiPrompt.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/15"
              id="generate-ai-template-btn"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Drawing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>

          {aiError && (
            <p className="text-red-400 text-xs mt-1 bg-red-950/30 border border-red-900/30 rounded-lg p-2">
              ⚠️ {aiError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
