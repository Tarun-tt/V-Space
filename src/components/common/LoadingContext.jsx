import React, { createContext, useContext, useState, useCallback } from "react";
import LoadingSpinner from "./LoadingSpinner";

export const LoadingContext = createContext({
  isLoading: false,
  loadingMessage: "",
  subMessage: "",
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: async () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading, please wait...");
  const [subMessage, setSubMessage] = useState("Please wait while we process your request");

  const showLoading = useCallback(
    (
      msg = "Loading, please wait...",
      subMsg = "Please wait while we process your request"
    ) => {
      setLoadingMessage(msg);
      setSubMessage(subMsg);
      setIsLoading(true);
    },
    []
  );

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    async (
      asyncFn,
      msg = "Loading, please wait...",
      subMsg = "Please wait while we process your request"
    ) => {
      showLoading(msg, subMsg);
      try {
        return await asyncFn();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        subMessage,
        showLoading,
        hideLoading,
        withLoading,
      }}
    >
      {children}
      <LoadingSpinner
        open={isLoading}
        message={loadingMessage}
        subMessage={subMessage}
      />
    </LoadingContext.Provider>
  );
}

export default LoadingContext;
