import { Route, Routes, Navigate } from "react-router-dom";
import MySpace from "./component/VDMS/MySpace";
import MySpaceForm from "./component/VDMS/MySpaceForm";
import FbdTable from "./component/VDMS/FbdTable";
import FbdDetail from "./component/VDMS/FbdDetail";
import MainLayout from "./MainLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* FBD Module Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/myspace" />} />

        {/* MySpace Module Routes */}
        <Route path="/myspace" element={<MySpace />} />
        <Route path="/myspace/form" element={<MySpaceForm />} />
        <Route path="/myspace/form/:id" element={<MySpaceForm />} />

        {/* Commented out old routes
        <Route path="/myspaceForm" element={<MySpaceForm />} />
        <Route path="/myspaceForm/:id" element={<MySpaceForm />} />
        <Route path="/fbd-table" element={<FbdTable />} />
        <Route path="/fbd-details" element={<FbdDetail />} />
        <Route path="/fbd-details/:id" element={<FbdDetail />} /> 
        */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
