// ============================================================
// Utility helpers for shadcn/ui + Tailwind
// ============================================================
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely, resolving conflicts.
 * @param  {...string} inputs - Class names to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
