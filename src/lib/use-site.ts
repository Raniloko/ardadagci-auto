import { useLoaderData } from "@tanstack/react-router";
import { useMemo } from "react";
import { DEFAULT_CONFIG, type SiteConfig } from "./site-config";
import { buildContact, buildFleet } from "./site-data";

/** Fleet and contact details with the admin changes from the root loader applied. */
export function useSite() {
  const config = (useLoaderData({ from: "__root__" }) as SiteConfig | undefined) ?? DEFAULT_CONFIG;
  return useMemo(() => ({ config, fleet: buildFleet(config), contact: buildContact(config.settings) }), [config]);
}
