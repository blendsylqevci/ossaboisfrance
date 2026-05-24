import { useState, useEffect } from "react";

const FAVORITES_KEY = "ossabois_favorite_slugs";

// Helper to get raw favorites list from localStorage
export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn("Failed to get favorites from localStorage:", err);
    return [];
  }
}

// Helper to toggle favorite status in localStorage and notify other components
export function toggleFavorite(slug: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getFavorites();
    const isFav = current.includes(slug);
    const next = isFav ? current.filter((s) => s !== slug) : [...current, slug];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    
    // Dispatch custom event to notify all other client components in real time
    window.dispatchEvent(new CustomEvent("ossabois_favorites_changed", { detail: next }));
    return next;
  } catch (err) {
    console.warn("Failed to toggle favorite in localStorage:", err);
    return [];
  }
}

// React hook to use favorites in any client component
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Initial fetch on mount
    setFavorites(getFavorites());

    // Event listener to sync updates across different components in real time
    const handleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setFavorites(customEvent.detail);
      }
    };

    window.addEventListener("ossabois_favorites_changed", handleChanged);
    return () => {
      window.removeEventListener("ossabois_favorites_changed", handleChanged);
    };
  }, []);

  const isFavorite = (slug: string) => favorites.includes(slug);

  const handleToggle = (slug: string) => {
    toggleFavorite(slug);
  };

  return { favorites, isFavorite, handleToggle };
}
