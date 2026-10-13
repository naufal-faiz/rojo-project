"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Alert from "@/components/ui/alert/Alert";

type Variant = "success" | "error" | "warning" | "info";
type Item = { id: number; variant: Variant; title: string; message: string };
const Ctx = createContext<{ notify: (v: Variant, title: string, message: string) => void }>({ notify: () => {} });
export const useToast = () => useContext(Ctx);

const progressColor: Record<Variant, string> = { success: "bg-success-500", error: "bg-error-500", warning: "bg-warning-500", info: "bg-blue-light-500" };
function ToastItem({ item, remove }: { item: Item; remove: (id: number) => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const exit = setTimeout(() => setLeaving(true), 5000);
    const done = setTimeout(() => remove(item.id), 5250);
    return () => { clearTimeout(exit); clearTimeout(done); };
  }, [item.id, remove]);
  return <div role={item.variant === "error" ? "alert" : "status"} aria-atomic="true" className={`toast-item pointer-events-auto relative overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-900 ${leaving ? "toast-leaving" : ""}`}>
    <Alert variant={item.variant} title={item.title} message={item.message} />
    <div aria-hidden="true" className={`toast-progress absolute inset-x-0 bottom-0 h-1 origin-left ${progressColor[item.variant]}`} />
  </div>;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const notify = useCallback((variant: Variant, title: string, message: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, variant, title, message }]);
  }, []);
  const remove = useCallback((id: number) => setItems((s) => s.filter((i) => i.id !== id)), []);
  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[999999] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((i) => (
          <ToastItem key={i.id} item={i} remove={remove} />
        ))}
      </div>
    </Ctx.Provider>
  );
}
