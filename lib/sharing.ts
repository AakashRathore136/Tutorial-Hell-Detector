import { HistoryEntry } from './history';

/**
 * Builds a highly customized text for sharing a developer habit assessment.
 */
export function buildShareText(result: HistoryEntry): string {
  const { scores } = result;
  return `My Tutorial Hell Detector result:\n• Builder Score: ${scores.builderScore}/100\n• Tutorial Hell Score: ${scores.tutorialHellScore}/100\n• Burnout Risk: ${scores.burnoutRisk}/100\n• Execution Rating: ${scores.executionRating}/100\n\nAnalyze your developer habits here:`;
}

/**
 * Generates WhatsApp sharing URL with proper encoding.
 */
export function buildWhatsAppUrl(text: string, url: string): string {
  const fullText = `${text} ${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
}

/**
 * Generates X (Twitter) sharing URL with proper encoding.
 */
export function buildXUrl(text: string, url: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/**
 * Generates Facebook sharing URL with proper encoding.
 */
export function buildFacebookUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Generates Email sharing URL with proper encoding.
 */
export function buildEmailUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Copies the provided string link to system clipboard securely.
 */
export async function copyToClipboard(url: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    // Fallback for older/non-secure context environments
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error("Failed to copy clipboard:", err);
    return false;
  }
}
export type SharePlatform = 'whatsapp' | 'x' | 'facebook' | 'email' | 'copy';
