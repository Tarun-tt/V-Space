import React, { createContext, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export const ToastContext = createContext({
  showToast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");

  const showToast = useCallback((msgOrObj, sev = "info") => {
    let text = "";
    let level = sev;

    if (typeof msgOrObj === "object" && msgOrObj !== null) {
      const { message: m, title, type } = msgOrObj;
      text = title ? `${title}: ${m}` : m || "";
      level = type === "danger" ? "error" : type || sev || "info";
    } else {
      text = String(msgOrObj || "");
      level = sev === "danger" ? "error" : sev || "info";
    }

    setMessage(text);
    setSeverity(level);
    setOpen(true);

    if (typeof window !== "undefined" && window.Liferay?.Util?.openToast) {
      window.Liferay.Util.openToast({
        message: text,
        type: level,
        autoClose: 5000,
      });
    }
  }, []);

  const success = useCallback((msg) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg) => showToast(msg, "error"), [showToast]);
  const warning = useCallback((msg) => showToast(msg, "warning"), [showToast]);
  const info = useCallback((msg) => showToast(msg, "info"), [showToast]);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
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

export default ToastContext;
