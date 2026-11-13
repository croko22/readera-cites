/**
 * Clipboard delivery for ReadEra Cites.
 *
 * Callers own what text to copy and how to report the outcome. This module
 * owns how delivery is attempted, including the DOM fallback and its cleanup.
 */

const CLIPBOARD = "clipboard";
const FALLBACK = "fallback";
const FAILED = "failed";

function copyWithTextarea(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);

  try {
    textarea.select();
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

/**
 * Copy text using the Clipboard API, falling back to a temporary textarea.
 *
 * @param {string} text
 * @returns {Promise<"clipboard" | "fallback" | "failed">} Which delivery path succeeded.
 */
export async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return CLIPBOARD;
  } catch {
    // Clipboard permission or availability failed; try the legacy path.
  }

  try {
    copyWithTextarea(text);
    return FALLBACK;
  } catch {
    return FAILED;
  }
}
