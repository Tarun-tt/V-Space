import { Route, Routes, Navigate } from "react-router-dom";
import MySpace from "./component/VDMS/MySpace";
import MySpaceForm from "./component/VDMS/MySpaceForm";
import FbdTable from "./component/VDMS/FbdTable";
import FbdDetail from "./component/VDMS/FbdDetail";
import MainLayout from "./MainLayout";
import FileVersionHistory from "./component/VDMS/FileVersionHistory";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/myspace" />} />
        <Route path="/myspace" element={<MySpace />} />
        <Route
          path="/myspace/history/:externalReferenceCode"
          element={<FileVersionHistory />}
        />
        //////////////////////////////////////////////////////
        {/* <Route path="/" element={<Navigate to="/myspace/form" />} />
        <Route path="/myspace/form" element={<MySpaceForm />} />
        <Route path="/myspace/form/:id" element={<MySpaceForm />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
