import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  return context || {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
    showToast: () => {},
  };
}

export default useToast;
