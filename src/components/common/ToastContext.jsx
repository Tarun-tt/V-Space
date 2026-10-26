import { createContext, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const showToast = (msg, sev = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const success = (msg) => showToast(msg, "success");
  const error = (msg) => showToast(msg, "error");
  const warning = (msg) => showToast(msg, "warning");
  const info = (msg) => showToast(msg, "info");

  const handleClose = () => setOpen(false);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
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
