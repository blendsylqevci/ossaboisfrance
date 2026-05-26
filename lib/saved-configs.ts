import { useState, useEffect } from "react";

// Helper to get all non-expired saved configurations house slugs from localStorage
export function getSavedConfigSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const slugs: string[] = [];
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ossa_house_config_")) {
        const slug = key.replace("ossa_house_config_", "");
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.selection && parsed.expiresAt > now) {
              slugs.push(slug);
            }
          } catch (e) {
            // Avoid JSON parse error breaking the loop
          }
        }
      }
    }
    return slugs;
  } catch (err) {
    console.warn("Failed to get saved configurations from localStorage:", err);
    return [];
  }
}

// React hook to use saved configuration slugs in any client component
export function useSavedConfigurations() {
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);

  const refreshConfigs = () => {
    setSavedConfigs(getSavedConfigSlugs());
  };

  useEffect(() => {
    // Initial fetch on mount
    refreshConfigs();

    // Event listener to sync updates across different components in real time
    const handleChanged = () => {
      refreshConfigs();
    };

    window.addEventListener("ossa_house_configs_changed", handleChanged);
    return () => {
      window.removeEventListener("ossa_house_configs_changed", handleChanged);
    };
  }, []);

  const hasSavedConfig = (slug: string) => savedConfigs.includes(slug);

  return { savedConfigs, hasSavedConfig, refreshConfigs };
}
