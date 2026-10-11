"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import Alert from "@/components/ui/alert/Alert";

type Variant = "success" | "error" | "warning" | "info";
type Item = { id: number; variant: Variant; title: string; message: string };
const Ctx = createContext<{ notify: (v: Variant, title: string, message: string) => void }>({ notify: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const notify = useCallback((variant: Variant, title: string, message: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, variant, title, message }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 5000);
  }, []);
  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[999999] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((i) => (
          <div key={i.id} className="pointer-events-auto rounded-xl bg-white shadow-lg dark:bg-gray-900">
            <Alert variant={i.variant} title={i.title} message={i.message} />
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
