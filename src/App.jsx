import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import MainLayout from "./MainLayout";
import MySpace from "./pages/VDMS/MySpace";
import FileVersionHistory from "./pages/VDMS/FileVersionHistory";
import MySpaceForm from "./pages/VDMS/MySpaceForm";
import { ToastProvider } from "./components/common/ToastContext";
import { LoadingProvider } from "./components/common/LoadingContext";

const App = () => {
  return (
    <ToastProvider>
      <LoadingProvider>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <Routes>
            <Route element={<MainLayout />}>
              {/* <Route path="/" element={<Navigate to="/myspace" />} />
              <Route path="/myspace" element={<MySpace />} />
              <Route
                path="/myspace/history/:externalReferenceCode"
                element={<FileVersionHistory />}
              /> */}
              //////////////////////////////////////////////////////
              <Route path="/" element={<Navigate to="/myspace/form" />} />
              <Route path="/myspace/form" element={<MySpaceForm />} />
              <Route path="/myspace/form/:id" element={<MySpaceForm />} />
            </Route>
          </Routes>
        </Box>
      </LoadingProvider>
    </ToastProvider>
  );
};

export default App;
