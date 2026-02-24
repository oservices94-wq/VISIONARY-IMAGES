/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Trash2, 
  Loader2, 
  Maximize2, 
  ChevronRight,
  LayoutGrid,
  Square,
  RectangleHorizontal,
  RectangleVertical
} from 'lucide-react';
import { generateImage } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
}

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', icon: Square },
  { id: '16:9', label: 'Landscape', icon: RectangleHorizontal },
  { id: '9:16', label: 'Portrait', icon: RectangleVertical },
  { id: '4:3', label: 'Classic', icon: LayoutGrid },
];

const SAMPLE_PROMPTS = [
  "A majestic phoenix rising from crystal ashes, cinematic lighting, 8k resolution",
  "Cyberpunk street market in Tokyo, neon rain, hyper-realistic, intricate details",
  "An underwater library with glowing jellyfish, ethereal atmosphere, digital art",
  "A tiny dragon sleeping on a pile of gold coins, macro photography, soft bokeh",
  "Surreal landscape where mountains are made of floating silk, pastel colors",
  "Astronaut sitting on a swing attached to a crescent moon, starry background",
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  
  const statusMessages = [
    "Analyzing your vision...",
    "Sketching the composition...",
    "Applying artistic textures...",
    "Optimizing lighting and shadows...",
    "Finalizing high-quality details...",
    "Almost there..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      let i = 0;
      setGenerationStatus(statusMessages[0]);
      interval = setInterval(() => {
        i = (i + 1) % statusMessages.length;
        setGenerationStatus(statusMessages[i]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const surpriseMe = () => {
    const randomPrompt = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(randomPrompt);
  };
  const [selectedRatio, setSelectedRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateImage({
        prompt: prompt.trim(),
        aspectRatio: selectedRatio,
      });

      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substring(7),
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        aspectRatio: selectedRatio,
      };

      setImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const downloadImage = (url: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `visionary-${prompt.substring(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-bottom border-white/5 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Visionary</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">AI Image Studio</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12">
        {/* Controls */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Create</h2>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-medium text-zinc-500">Prompt</label>
                  <button 
                    type="button"
                    onClick={surpriseMe}
                    className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold hover:text-emerald-400 transition-colors"
                  >
                    Surprise Me
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city with floating gardens and neon waterfalls..."
                  className="w-full h-40 bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-zinc-500 ml-1">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map((ratio) => {
                    const Icon = ratio.icon;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => setSelectedRatio(ratio.id as any)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all text-sm",
                          selectedRatio === ratio.id 
                            ? "bg-white/10 border-emerald-500/50 text-white" 
                            : "bg-zinc-900 border-white/5 text-zinc-500 hover:bg-white/5"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {ratio.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={cn(
                  "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                  isGenerating || !prompt.trim()
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl shadow-emerald-500/20"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {generationStatus}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Fast Generation Mode Active
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center animate-pulse">{error}</p>
              )}
            </form>
          </section>

          <section className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tips</h3>
            <ul className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <li className="flex gap-2">
                <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                Be specific about styles like "cinematic", "cyberpunk", or "minimalist".
              </li>
              <li className="flex gap-2">
                <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                Mention lighting: "golden hour", "neon glow", or "soft studio light".
              </li>
              <li className="flex gap-2">
                <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                Describe the camera: "macro shot", "wide angle", or "bokeh".
              </li>
              <li className="flex gap-2 pt-2 border-t border-white/5">
                <p className="text-[10px] text-zinc-500 italic">
                  Note: Generation usually takes 10-20 seconds. If it takes longer, please check your connection.
                </p>
              </li>
            </ul>
          </section>
        </div>

        {/* Gallery */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Gallery</h2>
            <span className="text-[10px] text-zinc-600 font-mono">{images.length} IMAGES GENERATED</span>
          </div>

          {images.length === 0 && !isGenerating ? (
            <div className="h-[600px] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">Your masterpieces will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="aspect-square rounded-3xl bg-zinc-900 border border-white/5 flex flex-col items-center justify-center space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent animate-pulse" />
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-xs font-medium text-emerald-500/80 animate-pulse uppercase tracking-widest text-center px-4">
                      {generationStatus}
                    </p>
                  </motion.div>
                )}
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden shadow-2xl"
                  >
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                      <p className="text-sm text-white font-medium line-clamp-2 mb-4 drop-shadow-lg">
                        {img.prompt}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadImage(img.url, img.prompt)}
                          className="flex-1 bg-white text-black py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        <button
                          onClick={() => deleteImage(img.id)}
                          className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 text-center border-t border-white/5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-medium">
          Powered by Gemini 2.5 Flash Image
        </p>
      </footer>
    </div>
  );
}
