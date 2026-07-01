import React, { useState } from "react";
import TemplateGallery from "./components/TemplateGallery";
import MemeCanvas from "./components/MemeCanvas";
import { AICaptionSuggestion, MemeStyle } from "./types";
import { 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  HelpCircle, 
  Image as ImageIcon,
  Check,
  CheckCircle,
  Mail,
  Zap,
  Paintbrush,
  Layers,
  Download,
  Send,
  TrendingUp,
  MessageSquare,
  DollarSign
} from "lucide-react";

const VIRAL_MEMES = [
  {
    title: "Friday Deployment",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    topText: "DEPLOYING DIRECTLY TO PROD ON FRIDAY",
    bottomText: "BECAUSE I TOO LIKE TO LIVE DANGEROUSLY",
    style: "classic" as MemeStyle,
    likes: "28.4k",
    shares: "9.2k",
    trope: "Relatable Pain",
  },
  {
    title: "AI & My Job",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    topText: "AI WILL DEFINITELY TAKE MY JOB",
    bottomText: "IF MY JOB IS JUST WRITING BUGS",
    style: "classic" as MemeStyle,
    likes: "19.8k",
    shares: "6.1k",
    trope: "Galaxy Brain",
  },
  {
    title: "Vibe Coding Problems",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80",
    topText: "ME VIBE CODING A REACT PAGE AT 3 AM",
    bottomText: "PLEASE DO NOT ASK TO SEE THE CONSOLE LOGS",
    style: "twitter" as MemeStyle,
    likes: "41.2k",
    shares: "15.3k",
    trope: "Developer Humour",
  },
  {
    title: "Breaking Production",
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=800&auto=format&fit=crop&q=80",
    topText: "VITE APP DELETED BY ACCIDENT",
    bottomText: "SENIOR ENGINEER DECLARES IT 'AN ELEGANT MINIMALIST REFACTOR'",
    style: "news" as MemeStyle,
    likes: "16.5k",
    shares: "4.8k",
    trope: "Breaking News",
  }
];

export default function App() {
  // Pre-load Grumpy Cat by default to prevent a blank editor
  const [imageUrl, setImageUrl] = useState<string | null>(
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80"
  );
  const [templateName, setTemplateName] = useState<string | null>("Sarcastic Grumpy Cat");

  // Core Captions state
  const [topText, setTopText] = useState("WHEN SOMETHING GOES WRONG");
  const [bottomText, setBottomText] = useState("AND NO ONE IS SURPRISED");

  // Style modifications
  const [styleMode, setStyleMode] = useState<MemeStyle>("classic");
  const [fontFamily, setFontFamily] = useState<"Impact" | "Inter" | "Space Grotesk" | "JetBrains Mono">("Impact");
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [filter, setFilter] = useState("none");

  // Magic AI Captions state
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [magicCaptions, setMagicCaptions] = useState<AICaptionSuggestion[]>([]);
  const [magicError, setMagicError] = useState<string | null>(null);
  const [magicSuccessMsg, setMagicSuccessMsg] = useState<string | null>(null);
  const [activeModelUsed, setActiveModelUsed] = useState<string>("gemini-2.5-flash");

  // AI Edit base image state
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);

  // Pricing Billing toggle
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  // Contact Form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("general");
  const [contactMessage, setContactMessage] = useState("");
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Upgrade Plan feedback
  const [pricingFeedback, setPricingFeedback] = useState<string | null>(null);

  // Select a template from gallery
  const handleSelectTemplate = (url: string, name: string) => {
    setImageUrl(url);
    setTemplateName(name);
    setMagicCaptions([]); // reset suggested captions for the new image
    setMagicError(null);
    setMagicSuccessMsg(null);
    setTopText("");
    setBottomText("");
  };

  // Magic Caption trigger (calls express API)
  const handleTriggerMagicCaption = async () => {
    if (!imageUrl) return;

    setIsMagicLoading(true);
    setMagicError(null);
    setMagicSuccessMsg(null);

    try {
      const response = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image with AI.");
      }

      const data = await response.json();
      if (data.captions && Array.isArray(data.captions)) {
        setMagicCaptions(data.captions);
        if (data.modelUsed) {
          setActiveModelUsed(data.modelUsed);
        }
        setMagicSuccessMsg(`AI analyzed the image successfully using ${data.modelUsed || "Gemini"}! Here are 5 tailor-made captions:`);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      console.error(err);
      setMagicError(err.message || "An unexpected error occurred while analyzing the image.");
    } finally {
      setIsMagicLoading(false);
    }
  };

  // AI Edit prompt trigger
  const handleAiEditImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !aiEditPrompt.trim()) return;

    setIsAiEditing(true);
    setAiEditError(null);

    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageUrl,
          prompt: aiEditPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit image.");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      setTemplateName(`AI Edited: ${aiEditPrompt}`);
      setAiEditPrompt("");
    } catch (err: any) {
      console.error(err);
      setAiEditError(err.message || "Something went wrong editing the image with AI.");
    } finally {
      setIsAiEditing(false);
    }
  };

  const handleApplyCaption = (caption: AICaptionSuggestion) => {
    setTopText(caption.topText);
    setBottomText(caption.bottomText);
  };

  // Remix template action
  const handleRemixMeme = (url: string, top: string, bottom: string, style: MemeStyle) => {
    setImageUrl(url);
    setTemplateName("Remixed Preset");
    setTopText(top);
    setBottomText(bottom);
    setStyleMode(style);
    
    // Clear old AI captions
    setMagicCaptions([]);
    setMagicError(null);
    setMagicSuccessMsg(null);

    // Scroll to sandbox
    const sandboxEl = document.getElementById("sandbox-section");
    if (sandboxEl) {
      sandboxEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle Contact Form Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsContactSubmitting(true);
    setTimeout(() => {
      setIsContactSubmitting(false);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      // Reset success status after 5s
      setTimeout(() => setContactSuccess(false), 5000);
    }, 1200);
  };

  // Handle Newsletter Submit
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsNewsletterSubmitting(true);
    setTimeout(() => {
      setIsNewsletterSubmitting(false);
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }, 1000);
  };

  const handleSelectPricing = (planName: string) => {
    setPricingFeedback(`Thank you for selecting the ${planName} plan! In a production system, this would open your Stripe payment drawer.`);
    setTimeout(() => setPricingFeedback(null), 6000);
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white" id="main-root">
      
      {/* 1. Cyber Navigation Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-all" id="nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-tr from-indigo-500 to-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white font-space flex items-center gap-1.5">
                MEME<span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">GEMINI</span>
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold px-2 py-0.5 rounded-full font-sans uppercase tracking-widest">
                  PRO
                </span>
              </h1>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <button onClick={() => handleScrollTo("features-section")} className="hover:text-indigo-400 transition-colors cursor-pointer">Features</button>
            <button onClick={() => handleScrollTo("sandbox-section")} className="hover:text-indigo-400 transition-colors cursor-pointer">Sandbox Console</button>
            <button onClick={() => handleScrollTo("showcase-section")} className="hover:text-indigo-400 transition-colors cursor-pointer">Trending Showcase</button>
            <button onClick={() => handleScrollTo("pricing-section")} className="hover:text-indigo-400 transition-colors cursor-pointer">Pricing</button>
            <button onClick={() => handleScrollTo("contact-section")} className="hover:text-indigo-400 transition-colors cursor-pointer">Contact</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 py-1.5 px-3 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>Gemini API Live</span>
            </div>
            <button 
              onClick={() => handleScrollTo("sandbox-section")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer font-space"
            >
              Try Free Now
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Hook Section */}
      <section className="relative overflow-hidden pt-20 pb-16 border-b border-slate-900" id="hero-section">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-1.5 mb-6 text-xs text-indigo-300 font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Introducing MemeGemini Creator Suite v2.0</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-space leading-tight max-w-4xl">
            Go from <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">Blank Canvas</span> to <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Viral Meme</span> in 3 seconds flat.
          </h1>

          <p className="text-base sm:text-xl text-slate-400 mt-6 max-w-2xl font-sans leading-relaxed">
            Powered by intelligent visual context analysis. Select templates, paint new details with AI, generate tailored jokes, and format memes with zero friction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={() => handleScrollTo("sandbox-section")}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer font-space"
            >
              <span>Launch Sandbox Editor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScrollTo("features-section")}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-355 font-semibold text-sm px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-space"
            >
              Explore AI Features
            </button>
          </div>

          {/* Feature Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full mt-16 pt-8 border-t border-slate-900/60 font-mono text-xs text-slate-500">
            <div className="text-center p-3">
              <p className="text-slate-300 font-bold text-xl sm:text-2xl font-space">1.2M+</p>
              <p className="mt-1">Memes Created</p>
            </div>
            <div className="text-center p-3">
              <p className="text-slate-300 font-bold text-xl sm:text-2xl font-space">3 sec</p>
              <p className="mt-1">Avg. AI Response</p>
            </div>
            <div className="text-center p-3">
              <p className="text-slate-300 font-bold text-xl sm:text-2xl font-space">99.9%</p>
              <p className="mt-1">API Fallback Success</p>
            </div>
            <div className="text-center p-3">
              <p className="text-slate-300 font-bold text-xl sm:text-2xl font-space">100%</p>
              <p className="mt-1">Royalty Free Downloads</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Sandbox Editor (The Main Editor App) */}
      <section className="py-20 bg-slate-950 border-b border-slate-900" id="sandbox-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white font-space tracking-tight">
              Interactive Creative Console
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Test out our Gemini integrations in real time below. Generate captions automatically or modify the base canvas structure.
            </p>
          </div>

          {/* Sandbox Wrapper with glowing border */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 sm:p-8 backdrop-blur-md animate-glow-indigo">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="bento-grid">
              
              {/* LEFT SIDEBAR: Template Selection & Gallery */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <TemplateGallery
                  onSelectTemplate={handleSelectTemplate}
                  selectedTemplateUrl={imageUrl}
                />

                {/* AI Image modification / Painting */}
                {imageUrl && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5" id="ai-painter-modifier">
                    <form onSubmit={handleAiEditImage} className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5 text-indigo-400">
                        <ImageIcon className="w-4 h-4 animate-bounce" />
                        <h3 className="text-sm font-bold text-slate-200">AI Image Modifier (Painter)</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">
                        Want to modify the base template? Describe a change (e.g. "Add futuristic sunglasses" or "Make it look like an oil painting") to rewrite this image.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 'Add futuristic neon cyber glasses'..."
                          value={aiEditPrompt}
                          onChange={(e) => setAiEditPrompt(e.target.value)}
                          disabled={isAiEditing}
                          className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={isAiEditing || !aiEditPrompt.trim()}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isAiEditing ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Modifying...
                            </>
                          ) : (
                            "Edit Image"
                          )}
                        </button>
                      </div>

                      {aiEditError && (
                        <p className="text-red-400 text-xs mt-1 bg-red-950/20 border border-red-900/30 rounded-lg p-2">
                          ⚠️ {aiEditError}
                        </p>
                      )}
                    </form>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Live Canvas & Manual Caption Controls */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <MemeCanvas
                  imageUrl={imageUrl}
                  onImageChange={(url) => handleSelectTemplate(url, "Custom upload")}
                  topText={topText}
                  setTopText={setTopText}
                  bottomText={bottomText}
                  setBottomText={setBottomText}
                  styleMode={styleMode}
                  setStyleMode={setStyleMode}
                  fontFamily={fontFamily}
                  setFontFamily={setFontFamily}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  textColor={textColor}
                  setTextColor={setTextColor}
                  strokeColor={strokeColor}
                  setStrokeColor={setStrokeColor}
                  isMagicLoading={isMagicLoading}
                  onTriggerMagicCaption={handleTriggerMagicCaption}
                  filter={filter}
                  setFilter={setFilter}
                />

                {/* Live Text Editing Form Fields */}
                {imageUrl && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5" id="text-edit-inputs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg">✍️</span>
                        3. Text Overlay Lines
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        Real-time overlay on the active canvas
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Top Text Line */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                          <span>Top Line Caption</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {fontFamily === "Impact" ? "AUTO-UPPERCASE" : "As written"}
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 'ME WHEN I DEPLOY TO PRODUCTION'..."
                          value={topText}
                          onChange={(e) => setTopText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-650 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                          id="input-top-text"
                        />
                      </div>

                      {/* Bottom Text Line */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                          <span>Bottom Line Caption</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {fontFamily === "Impact" ? "AUTO-UPPERCASE" : "As written"}
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 'BUT FORGOT TO TEST IT LOCALLY'..."
                          value={bottomText}
                          onChange={(e) => setBottomText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-655 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                          id="input-bottom-text"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AI MAGIC CAPTIONS CONTAINER PANEL */}
                {imageUrl && (
                  <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl shadow-indigo-950/10" id="ai-magic-captions">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400 animate-pulse" />
                          4. Magic AI Caption Board
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Powered by <span className="text-indigo-300 font-mono">gemini-2.5-flash / 3.1-pro</span>. Evaluates backdrop, expressions, and details.
                        </p>
                      </div>

                      <button
                        onClick={handleTriggerMagicCaption}
                        disabled={isMagicLoading}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer font-space"
                        id="trigger-magic-api-btn"
                      >
                        {isMagicLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Image...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Analyze & Suggest 5 Captions
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error Banner */}
                    {magicError && (
                      <div className="bg-red-950/40 border border-red-900/40 text-red-400 rounded-xl p-4 flex items-start gap-3 text-xs mb-4">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold">Caption Generation Failed</p>
                          <p className="mt-1 leading-normal">{magicError}</p>
                        </div>
                      </div>
                    )}

                    {/* Magic suggestions display */}
                    {magicCaptions.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {magicSuccessMsg && (
                          <p className="text-xs font-semibold text-indigo-300 text-left mb-1">
                            ✨ {magicSuccessMsg}
                          </p>
                        )}

                        <div className="grid grid-cols-1 gap-3.5" id="suggested-captions-list">
                          {magicCaptions.map((cap, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleApplyCaption(cap)}
                              className="bg-slate-950 hover:bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer text-left transition-all duration-200 group flex justify-between items-center gap-4 hover:shadow-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[10px] uppercase font-black tracking-wide text-indigo-400 bg-indigo-600/10 px-2 py-0.5 rounded">
                                    {cap.trope || "Funny"}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    Option {idx + 1}
                                  </span>
                                </div>

                                <div className="font-sans text-xs font-bold text-slate-200 space-y-0.5">
                                  {cap.topText && <p className="text-[11px] text-slate-400 font-medium">Top: {cap.topText}</p>}
                                  <p className="text-sm text-white">Bottom: {cap.bottomText}</p>
                                </div>

                                {cap.explanation && (
                                  <p className="text-[10px] text-slate-500 mt-2 italic leading-normal flex items-start gap-1">
                                    <HelpCircle className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                                    {cap.explanation}
                                  </p>
                                )}
                              </div>

                              <div className="bg-indigo-600/10 text-indigo-400 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200 shrink-0">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      !isMagicLoading && (
                        <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
                          <Sparkles className="w-6 h-6 text-slate-600 mb-1" />
                          <p>No suggestions generated yet.</p>
                          <p className="text-[11px] text-slate-600 font-mono">
                            Click the "Analyze & Suggest" button above to scan this image with Gemini.
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature Bento Grid */}
      <section className="py-20 bg-slate-900/30 border-b border-slate-900" id="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white font-space tracking-tight">
              Crafted for Modern Social Storytellers
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Our workspace fuses raw visual assets with deep generative context, giving you a full creative suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300 flex flex-col gap-4">
              <div className="bg-indigo-600/10 text-indigo-400 p-3 rounded-xl w-fit">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-space">Magic AI Captioning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No more writer's block. Gemini parses facial expressions, backdrops, and objects in your template to suggest 5 relevant captions covering multiple humor styles.
              </p>
              <div className="mt-auto text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                Smart Fallback Activated
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300 flex flex-col gap-4">
              <div className="bg-emerald-600/10 text-emerald-400 p-3 rounded-xl w-fit">
                <Paintbrush className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-space">AI Painter / Morphing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add objects, modify backdrops, or overlay artistic styles onto standard templates. Describe your concept in plain English and let our image models redraw it.
              </p>
              <div className="mt-auto text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                Powered by Gemini-3.1-Flash
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 flex flex-col gap-4">
              <div className="bg-purple-600/10 text-purple-400 p-3 rounded-xl w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-space">Multi-Format Overlays</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Shift instant formats. Recompile your memes instantly between classic text overlays, high-contrast Twitter thread block text, or breaking news TV banners.
              </p>
              <div className="mt-auto text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                Impact, Inter, Space Grotesk
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Extended Feature A */}
            <div className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 rounded-2xl p-5 shrink-0">
                <TrendingUp className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-space">Instant Social Exports</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Ready to post. Download high-definition PNG renders formatted for perfect aspect ratios, avoiding ugly cropped borders when shared on social networks.
                </p>
              </div>
            </div>

            {/* Extended Feature B */}
            <div className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-emerald-500/10 rounded-2xl p-5 shrink-0">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-space">Zero Configuration</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  No signups or keys needed for casual testing. Land on our console and click standard templates to begin visual generation immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Viral Meme Gallery (With "Remix" Button) */}
      <section className="py-20 bg-slate-950 border-b border-slate-900" id="showcase-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs mb-3 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>EXPORTED MINUTES AGO</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white font-space tracking-tight">
              Trending Creators Showcase
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Real exported templates generated by other creators. See one you like? Click "Remix Template" to copy details right into your editor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VIRAL_MEMES.map((meme, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
                <div className="relative aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  {/* Subtle Text Overlays simulating the styles */}
                  {meme.style === "twitter" && (
                    <div className="absolute top-0 inset-x-0 bg-white p-2.5 text-left border-b border-slate-100">
                      <p className="text-[10px] text-slate-900 font-semibold leading-tight font-sans">
                        {meme.topText || meme.bottomText}
                      </p>
                    </div>
                  )}
                  {meme.style === "news" && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 p-2 text-left flex items-center gap-1.5 border-t border-slate-800">
                      <span className="text-[7px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">BREAKING</span>
                      <span className="text-[9px] text-yellow-400 font-bold truncate">{meme.bottomText}</span>
                    </div>
                  )}
                  {meme.style === "classic" && (
                    <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
                      <p className="text-white text-[12px] font-black text-center uppercase tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,1)] font-sans">{meme.topText}</p>
                      <p className="text-white text-[12px] font-black text-center uppercase tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,1)] font-sans">{meme.bottomText}</p>
                    </div>
                  )}

                  {/* Remix Overlay Banner on Hover */}
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center p-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded-full mb-3 font-semibold">
                      {meme.trope}
                    </span>
                    <p className="text-white font-bold text-center text-xs px-2 line-clamp-2 mb-4">
                      "{meme.title}"
                    </p>
                    <button
                      onClick={() => handleRemixMeme(meme.imageUrl, meme.topText, meme.bottomText, meme.style)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1 font-space"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Remix Template
                    </button>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-900 flex items-center justify-between mt-auto">
                  <div className="text-[11px] text-slate-500 font-mono">
                    📈 {meme.likes} views
                  </div>
                  <div className="text-[11px] text-indigo-400 font-semibold font-space">
                    {meme.shares} remixes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pricing Plans Panel */}
      <section className="py-20 bg-slate-900/10 border-b border-slate-900" id="pricing-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white font-space tracking-tight">
              Flexible Plans for Every Scale
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Get started for free or upgrade to support custom enterprise teams, full API keys, and custom trained styling models.
            </p>

            {/* Toggle Switch */}
            <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl mt-6 text-xs">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  billingPeriod === "monthly" ? "bg-slate-950 text-indigo-400 border border-slate-850" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingPeriod === "annually" ? "bg-slate-950 text-indigo-400 border border-slate-850" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span>Annually</span>
                <span className="text-[9px] bg-emerald-600/10 border border-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {pricingFeedback && (
            <div className="max-w-md mx-auto bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 rounded-2xl p-4 flex items-start gap-3 text-xs mb-8">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Subscription Action Logged</p>
                <p className="mt-1 leading-relaxed">{pricingFeedback}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Pricing Tier 1 */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 flex flex-col hover:border-slate-800 transition-all">
              <p className="text-xs uppercase font-mono tracking-widest text-slate-500">Starter</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-space">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Test the waters. Perfect for casual jokes or making one-off posts for your Slack channels.
              </p>
              <div className="border-t border-slate-900/80 my-5 pt-5 space-y-3 text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>10 AI captions / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Access to 8+ classic templates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Standard image formats</span>
                </div>
              </div>
              <button
                onClick={() => handleSelectPricing("Starter")}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 text-xs font-semibold py-2.5 rounded-xl mt-auto transition-colors cursor-pointer"
              >
                Current Sandbox Tier
              </button>
            </div>

            {/* Pricing Tier 2 (Highlighted) */}
            <div className="bg-slate-900 border-2 border-indigo-600 rounded-3xl p-6 flex flex-col relative shadow-xl shadow-indigo-950/20 animate-glow-indigo">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase font-mono">
                Most Popular
              </div>
              <p className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">Viral Creator</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-space">
                  {billingPeriod === "monthly" ? "$9" : "$7"}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                Take content creation seriously. Generate unlimited variations, add personalized watermarks, and export HD renders.
              </p>
              <div className="border-t border-slate-800/80 my-5 pt-5 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5 font-semibold text-slate-200">
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Unlimited Magic Captions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>HD AI Image prompt generation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Remove MemeGemini badge</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Priority GPU generation queue</span>
                </div>
              </div>
              <button
                onClick={() => handleSelectPricing("Viral Creator")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 rounded-xl mt-auto transition-all shadow-md shadow-indigo-600/20 cursor-pointer font-space"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Pricing Tier 3 */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 flex flex-col hover:border-slate-800 transition-all">
              <p className="text-xs uppercase font-mono tracking-widest text-slate-500">Meme Studio</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-space">
                  {billingPeriod === "monthly" ? "$29" : "$23"}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Scale your branding team. Access automated REST APIs, webhooks, and collaborative dashboards for multi-seat projects.
              </p>
              <div className="border-t border-slate-900/80 my-5 pt-5 space-y-3 text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>All Pro features included</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Developer API & Webhooks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Collaborative team workspace panels</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>24/7 Priority support channel</span>
                </div>
              </div>
              <button
                onClick={() => handleSelectPricing("Meme Studio")}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 text-xs font-semibold py-2.5 rounded-xl mt-auto transition-colors cursor-pointer"
              >
                Choose Meme Studio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact & Newsletter Form */}
      <section className="py-20 bg-slate-950 border-b border-slate-900" id="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Newsletter Side (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-center">
              <div className="bg-indigo-600/10 text-indigo-400 p-3 rounded-2xl w-fit">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white font-space mt-4">Join the Creator Network</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Subscribe to receive weekly trending meme templates, upcoming comedy tropes, and algorithm updates from Twitter, Reddit, and TikTok. No spam, unsubscribe anytime.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your creator email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  disabled={isNewsletterSubmitting}
                  className="flex-1 bg-slate-950 border border-slate-850 text-slate-100 placeholder:text-slate-655 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isNewsletterSubmitting || !newsletterEmail.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-space"
                >
                  {isNewsletterSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Subscribe</span>
                </button>
              </form>

              {newsletterSuccess && (
                <p className="text-emerald-400 text-xs mt-3 flex items-center gap-1 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  Successfully registered! Check your inbox soon.
                </p>
              )}
            </div>

            {/* Contact Form Side (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white font-space flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  Have Questions? Let's Talk Shop
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  Reach out for custom enterprise workspaces, dedicated API quota licensing, or simply to suggest a template filter!
                </p>
              </div>

              {contactSuccess && (
                <div className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-xl p-4 text-xs mt-6 mb-6 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold font-space">Message Transmitted Successfully</p>
                    <p className="mt-0.5 text-slate-400 font-mono text-[10px]">Our meme consultants will reach out to you within 24 business hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Yash"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder:text-slate-655 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. yash@creator.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder:text-slate-655 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Area of Interest</label>
                  <select
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-855 text-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="general">General Inquiry / Feature Request</option>
                    <option value="api">Enterprise API Quotas</option>
                    <option value="brand">Brand Partnership & Licensing</option>
                    <option value="billing">Billing & Subscriptions</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Your Message</label>
                  <textarea
                    placeholder="Write details of your custom requirements here..."
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder:text-slate-655 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={isContactSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5 font-space"
                  >
                    {isContactSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 8. App Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600/10 p-1.5 rounded-lg text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-400 font-space tracking-tight">MEMEGEMINI CREATIVE</span>
          </div>

          <p className="font-mono text-[10px]">© 2026 MemeGemini Creative Suite. Generated with Google AI Studio.</p>
          
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Humour</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Magic Caption Policy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Developer API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

