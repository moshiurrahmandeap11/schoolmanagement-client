import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { setFavicon } from "./components/setFavicon.js";
import axiosInstance, { baseImageURL } from "./hooks/axiosInstance/axiosInstance.jsx";
import "./index.css";
import AuthProvider from "./providers/AuthProvider/AuthProvider.jsx";
import { route } from "./routes/route/route.jsx";

// 🔥 dynamic favicon load (app bootstrap)
axiosInstance
  .get("/institute-info")
  .then((res) => {
    const faviconPath = res?.data?.data?.favicon;

    if (faviconPath) {
      const faviconUrl = `${baseImageURL.replace(/\/$/, "")}/${faviconPath.replace(/^\//, "")}`;
      setFavicon(faviconUrl);
    }
  })
  .catch((err) => {
    console.log("Favicon load failed, using default", err);
  });

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={route} />
  </AuthProvider>
);
