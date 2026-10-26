import React, { useState, useEffect, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ToastContext } from "./useToast";

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const showToast = useCallback((msg, sev = "success") => {
    setMessage(msg);
    const mappedSev = sev === "danger" ? "error" : sev;
    setSeverity(mappedSev);
    setOpen(true);
  }, []);

  const success = useCallback((msg) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg) => showToast(msg, "error"), [showToast]);
  const warning = useCallback((msg) => showToast(msg, "warning"), [showToast]);
  const info = useCallback((msg) => showToast(msg, "info"), [showToast]);

  useEffect(() => {
    const handleGlobalToast = (e) => {
      const { message: msg, type, title } = e.detail || {};
      if (msg) {
        const fullMsg = title ? `${title}: ${msg}` : msg;
        showToast(fullMsg, type === "danger" ? "error" : type || "info");
      }
    };
    window.addEventListener("app:toast", handleGlobalToast);
    return () => window.removeEventListener("app:toast", handleGlobalToast);
  }, [showToast]);

  const handleClose = () => setOpen(false);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
