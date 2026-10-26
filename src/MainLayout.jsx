import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

const MainLayout = () => {
  useEffect(() => {
    document.body.classList.add("sidebar-collapse");

    return () => {
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <Outlet />
    </Box>
  );
};

export default MainLayout;
