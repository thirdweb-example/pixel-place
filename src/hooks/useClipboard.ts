"use client";

import { useCallback, useState } from "react";

/**
 * todo: this hook is copied from the SDK, so might as well expose it from the SDK
 * and use it here?
 */
export function useClipboard(text: string, delay = 1500) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, delay);
  }, [text, delay]);

  return { hasCopied, onCopy };
}
