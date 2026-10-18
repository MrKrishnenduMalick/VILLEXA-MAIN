import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const CinematicHeroContext = createContext<CinematicHeroContextType | undefined>(undefined);

export const CinematicHeroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const isHomePage = location === '/';

  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
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
      // On homepage, if at top, active and reset progress to current scroll
      setIsHeroActive(true);
      if (typeof window !== 'undefined' && window.scrollY <= 10) {
        setIsHeroCompleted(false);
        setScrollProgressState(0);
      }
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

  return (
    <CinematicHeroContext.Provider
      value={{
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
      }}
    >
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
