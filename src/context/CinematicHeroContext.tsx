import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { siteConfigService } from '../services/siteConfigService';
import { HeroConfig } from '../types/content';

interface CinematicHeroContextType {
  heroConfig: HeroConfig | null;
  scrollProgress: number; // 0.0 to 1.0
  setScrollProgress: (progress: number) => void;
  isHeroActive: boolean;
  setIsHeroActive: (active: boolean) => void;
  isHeroCompleted: boolean;
  setIsHeroCompleted: (completed: boolean) => void;
  isVideoReady: boolean;
  setIsVideoReady: (ready: boolean) => void;
  isHomePage: boolean;
  refreshHeroConfig: () => Promise<void>;
}

/**
 * Pure helper for robust homepage route detection.
 * Handles root ('/'), empty string (''), trailing slashes,
 * query parameters ('/?ref=...'), hash fragments ('/#hero'), and '/index.html'.
 */
export function isHomeRoute(path: string): boolean {
  if (!path) return true;
  const clean = path.split('?')[0].split('#')[0].replace(/\/index\.html$/, '').replace(/\/+$/, '');
  return clean === '' || clean === '/';
}

const CinematicHeroContext = createContext<CinematicHeroContextType | undefined>(undefined);

export const CinematicHeroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const isHomePage = isHomeRoute(location);

  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => siteConfigService.getLocalFallback().hero);
  const [scrollProgress, setScrollProgressState] = useState<number>(0);
  const [isHeroActive, setIsHeroActive] = useState<boolean>(isHomePage);
  const [isHeroCompleted, setIsHeroCompleted] = useState<boolean>(!isHomePage);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);

  const refreshHeroConfig = useCallback(async () => {
    try {
      const config = await siteConfigService.getSiteConfig();
      if (config?.hero) {
        setHeroConfig(config.hero);
      }
    } catch {
      // Fallback handled in siteConfigService
    }
  }, []);

  useEffect(() => {
    refreshHeroConfig();
  }, [refreshHeroConfig]);

  // Adjust completion and active status on route change
  useEffect(() => {
    if (!isHomePage) {
      // On non-homepage public routes, we preserve the final frame background
      setIsHeroActive(false);
      setIsHeroCompleted(true);
      setScrollProgressState(1.0);
    } else {
      // On homepage: activate hero and reset completion state for entrance
      setIsHeroActive(true);
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
      setIsHeroCompleted(false);
      setScrollProgressState(0);
    }
  }, [isHomePage, location]);

  const setScrollProgress = useCallback((progress: number) => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    setScrollProgressState(clamped);
    if (clamped >= 0.99) {
      setIsHeroCompleted(true);
    } else if (clamped < 0.95 && isHomePage) {
      setIsHeroCompleted(false);
    }
  }, [isHomePage]);

  const contextValue = useMemo(() => ({
    heroConfig,
    scrollProgress,
    setScrollProgress,
    isHeroActive,
    setIsHeroActive,
    isHeroCompleted,
    setIsHeroCompleted,
    isVideoReady,
    setIsVideoReady,
    isHomePage,
    refreshHeroConfig
  }), [
    heroConfig,
    scrollProgress,
    setScrollProgress,
    isHeroActive,
    isHeroCompleted,
    isVideoReady,
    isHomePage,
    refreshHeroConfig
  ]);

  return (
    <CinematicHeroContext.Provider value={contextValue}>
      {children}
    </CinematicHeroContext.Provider>
  );
};

export function useCinematicHero(): CinematicHeroContextType {
  const context = useContext(CinematicHeroContext);
  if (!context) {
    throw new Error('useCinematicHero must be used within a CinematicHeroProvider');
  }
  return context;
}
