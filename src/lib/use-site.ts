import { useLoaderData } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { useLanguage } from "./language";
import { formatMoney } from "./pricing";
import { DEFAULT_CONFIG, type SiteConfig } from "./site-config";
import { buildContact, buildFleet } from "./site-data";

/** Fleet and contact details with the admin changes from the root loader applied. */
export function useSite() {
  const config = (useLoaderData({ from: "__root__" }) as SiteConfig | undefined) ?? DEFAULT_CONFIG;
  return useMemo(() => ({ config, fleet: buildFleet(config), contact: buildContact(config.settings) }), [config]);
}

/** Formats an AED amount in the visitor's chosen currency and language. */
export function useMoney() {
  const { config } = useSite();
  const { currency, language } = useLanguage();
  const rate = config.settings.aedPerEur;
  return useCallback((aed: number) => formatMoney(aed, currency, language, rate), [currency, language, rate]);
}
