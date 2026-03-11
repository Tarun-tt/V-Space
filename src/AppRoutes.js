import { Route, Routes, Navigate } from "react-router-dom";
import FBDOpenning from "./component/FBD/FBDOpenning";
import FbdTable from "./component/FBD/FbdTable";
import FbdDetail from "./component/FBD/FbdDetail";
import MainLayout from "./MainLayout";
const AppRoutes = () => {
  return (
    <Routes>
      {/* FBD Module Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/vspace" />} />
        <Route path="vspace" element={<FBDOpenning />} />
        <Route path="/vspace/:id" element={<FBDOpenning />} />

        {/* <Route path="/" element={<Navigate to="/fbd-table" />} />
        <Route path="/fbd-table" element={<FbdTable />} />
        <Route path="/fbd-details" element={<FbdDetail />} />
        <Route path="/fbd-details/:id" element={<FbdDetail />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
