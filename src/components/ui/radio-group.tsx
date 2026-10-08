"use client";
import * as React from "react";
import * as Radio from "@radix-ui/react-radio-group";
export const RadioGroup = Radio.Root;
export function RadioGroupItem(props: React.ComponentPropsWithoutRef<typeof Radio.Item>) {
  return <Radio.Item className="radio-item" {...props}><Radio.Indicator className="radio-indicator" /></Radio.Item>;
}
