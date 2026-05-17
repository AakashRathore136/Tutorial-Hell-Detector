"use client";

import { useState, useEffect } from "react";
import { HistoryEntry } from "@/lib/history";
import { 
  buildShareText, 
  buildWhatsAppUrl, 
  buildXUrl, 
  buildFacebookUrl, 
  buildEmailUrl, 
  copyToClipboard 
} from "@/lib/sharing";
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Mail, 
  Share2 
} from "lucide-react";

// Local SVG brand icons to avoid Lucide version dependency issues
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: HistoryEntry;
}

export function ShareModal({ isOpen, onClose, result }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [resultUrl, setResultUrl] = useState("");

  const shareText = buildShareText(result);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Build the absolute sharing link pointing directly to the result page
      const currentUrl = `${window.location.origin}/result?id=${result.id}`;
      setResultUrl(currentUrl);
      
      // Check native share sheet support
      if (typeof navigator !== "undefined" && "share" in navigator) {
        setCanNativeShare(true);
      }
    }
  }, [result.id]);

  const handleCopy = async () => {
    const success = await copyToClipboard(resultUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "My Developer Habit Audit - Tutorial Hell Detector",
          text: shareText,
          url: resultUrl,
        });
      } catch (err) {
        // Suppress abort errors from user canceling the share sheet
        if ((err as Error).name !== "AbortError") {
          console.error("Native share failed:", err);
        }
      }
    }
  };

  const platforms = [
    {
      name: "WhatsApp",
      icon: <Send className="h-5 w-5 text-emerald-400" />,
      url: buildWhatsAppUrl(shareText, resultUrl),
      bg: "hover:bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "X (Twitter)",
      icon: <XIcon className="h-5 w-5 text-sky-400" />,
      url: buildXUrl(shareText, resultUrl),
      bg: "hover:bg-sky-500/10 border-sky-500/20",
    },
    {
      name: "Facebook",
      icon: <FacebookIcon className="h-5 w-5 text-blue-400" />,
      url: buildFacebookUrl(resultUrl),
      bg: "hover:bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5 text-orange-400" />,
      url: buildEmailUrl("My Developer Habit Audit Results", `${shareText}\n\n${resultUrl}`),
      bg: "hover:bg-orange-500/10 border-orange-500/20",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6 shadow-xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 right-top top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
              <h2 className="text-xl font-bold leading-none tracking-tight">
                Share Your Developer Audit
              </h2>
              <p className="text-sm text-muted-foreground">
                Let other developers witness your actual coding score or learning traps.
              </p>
            </div>

            {/* Content box showing the URL */}
            <div className="flex items-center space-x-2 rounded-lg border bg-muted/40 p-2 mb-6">
              <input
                type="text"
                readOnly
                value={resultUrl}
                className="flex-1 bg-transparent px-2 text-sm text-muted-foreground overflow-x-auto focus:outline-none select-all"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="shrink-0 h-8 gap-1.5"
                variant={copied ? "default" : "outline"}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>

            {/* Platform grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {platforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-card/50 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${platform.bg}`}
                >
                  <div className="mb-2 p-2 rounded-lg bg-muted/50">
                    {platform.icon}
                  </div>
                  <span className="text-xs font-semibold">{platform.name}</span>
                </a>
              ))}
            </div>

            {/* Native Mobile Share sheet when supported */}
            {canNativeShare && (
              <Button
                onClick={handleNativeShare}
                className="w-full gap-2 border bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                variant="outline"
              >
                <Share2 className="h-4 w-4" />
                <span>Open System Share Sheet</span>
              </Button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
