"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastContextValue = { flash: (message: string) => void };

const ToastContext = createContext<ToastContextValue>({ flash: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ flash }}>
      {children}
      {message && (
        <div className="toast">
          <i className="ph ph-check-circle" />
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
