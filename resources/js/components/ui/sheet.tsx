"use client";
import * as React from "react";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
export const Sheet = Primitive.Root;
export const SheetTitle = Primitive.Title;
export const SheetDescription = Primitive.Description;
export function SheetContent({ children, ...props }: React.ComponentPropsWithoutRef<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Overlay className="dialog-overlay detail-overlay" /><Primitive.Content className="detail-panel" {...props}>{children}<Primitive.Close className="dialog-close" aria-label="Cerrar detalle"><X size={20} /></Primitive.Close></Primitive.Content></Primitive.Portal>;
}
