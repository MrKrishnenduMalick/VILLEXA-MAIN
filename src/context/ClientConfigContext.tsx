import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ClientConfig, getClientConfig, applyClientTheme } from '../config/clientConfig';
import { siteConfigService } from '../services/siteConfigService';

interface ClientConfigContextType {
  config: ClientConfig;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const ClientConfigContext = createContext<ClientConfigContextType | null>(null);

export const ClientConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseConfig] = useState<ClientConfig>(() => getClientConfig());
  const [dbBrandOverride, setDbBrandOverride] = useState<Partial<ClientConfig['brand']> | null>(null);
  const [dbContactOverride, setDbContactOverride] = useState<Partial<ClientConfig['contact']> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDbOverrides = async () => {
    try {
      const siteConfig = await siteConfigService.getSiteConfig();
      if (siteConfig?.brand) {
        setDbBrandOverride({
          brandName: siteConfig.brand.brandName || baseConfig.brand.brandName,
          tagline: siteConfig.brand.tagline || baseConfig.brand.tagline,
          logoText: siteConfig.brand.brandName || baseConfig.brand.logoText
        });
        setDbContactOverride({
          contactEmail: siteConfig.brand.contactEmail || baseConfig.contact.contactEmail,
          contactPhone: siteConfig.brand.contactPhone || baseConfig.contact.contactPhone,
          whatsappNumber: siteConfig.brand.whatsappNumber || baseConfig.contact.whatsappNumber,
          showroomAddress: siteConfig.brand.showroomAddress || baseConfig.contact.showroomAddress,
          visitingHours: siteConfig.brand.visitingHours || baseConfig.contact.visitingHours
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyClientTheme(baseConfig.theme);
    fetchDbOverrides();
  }, [baseConfig]);

  const effectiveConfig = useMemo<ClientConfig>(() => {
    return {
      ...baseConfig,
      brand: {
        ...baseConfig.brand,
        ...(dbBrandOverride || {})
      },
      contact: {
        ...baseConfig.contact,
        ...(dbContactOverride || {})
      }
    };
  }, [baseConfig, dbBrandOverride, dbContactOverride]);

  return (
    <ClientConfigContext.Provider value={{ config: effectiveConfig, isLoading, refreshConfig: fetchDbOverrides }}>
      {children}
    </ClientConfigContext.Provider>
  );
};

export function useClientConfig(): ClientConfig {
  const ctx = useContext(ClientConfigContext);
  if (!ctx) {
    return getClientConfig();
  }
  return ctx.config;
}
