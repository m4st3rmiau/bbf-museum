import "@fontsource-variable/dm-sans";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";
import { Providers } from "@/components/providers";

createInertiaApp({
  title: (title) => title ? `${title} · Galería de los recuerdos` : "Galería de los recuerdos",
  resolve: (name) => {
    const pages = import.meta.glob("./Pages/**/*.tsx", { eager: true }) as Record<string, { default: ComponentType }>;
    return pages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) { createRoot(el).render(<Providers><App {...props} /></Providers>); },
  progress: { color: "#ec4579" },
});
