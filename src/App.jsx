// // ABBFFData.js
// import { Routes, Route, Navigate } from "react-router-dom";
// import { ToastProvider } from "./components/common/ToastContext";
// import ABBFFPage from "./pages/ABBFF/ABBFFPage";
// import Layout from "./components/layout/Layout";

// function App({ route = "/" }) {
//   return (
//     <ToastProvider>
//       <Layout>
//         <Routes>
//           <Route
//             path="/"
//             element={<Navigate to="/abbff/complaint-details" replace />}
//           />
//           <Route
//             path="/abbff"
//             element={<Navigate to="/abbff/complaint-details" replace />}
//           />
//           <Route path="/abbff/:tab" element={<ABBFFPage />} />
//           <Route
//             path="*"
//             element={<Navigate to="/abbff/complaint-details" replace />}
//           />
//         </Routes>
//       </Layout>
//     </ToastProvider>
//   );
// }

// export default App;

import { Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";
import MySpace from "./pages/VDMS/MySpace";
import FileVersionHistory from "./pages/VDMS/FileVersionHistory";

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
