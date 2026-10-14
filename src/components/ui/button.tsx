import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}
const styles: Record<Variant, string> = {
  primary: "bg-gold text-white hover:opacity-90 border-transparent",
  outline: "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 border-transparent hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700 border-transparent",
};
export function Button({ variant = "primary", className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}
