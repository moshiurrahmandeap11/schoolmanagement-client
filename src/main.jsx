import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import AuthProvider from "./providers/AuthProvider/AuthProvider.jsx";
import { route } from "./routes/route/route.jsx";

createRoot(document.getElementById("root")).render(
      <AuthProvider>
          <RouterProvider router={route}></RouterProvider>
      </AuthProvider>
);
