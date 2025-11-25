import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { WebsiteStatusProvider } from "./pages/Home/Students/ClassRoomsClient/WebsiteStatusContext/WebsiteStatusContext.jsx";
import ShutdownGuard from "./pages/Home/Students/MoshiurLogin/ShutdownGuard/ShutdownGuard.jsx";
import AuthProvider from "./providers/AuthProvider/AuthProvider.jsx";
import { route } from "./routes/route/route.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WebsiteStatusProvider>
      <AuthProvider>
        <ShutdownGuard>
          <RouterProvider router={route}></RouterProvider>
        </ShutdownGuard>
      </AuthProvider>
    </WebsiteStatusProvider>
  </StrictMode>
);
