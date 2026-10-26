import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  useEffect(() => {
    document.body.classList.add("sidebar-collapse");

    return () => {
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return <Outlet />;
};

export default MainLayout;
