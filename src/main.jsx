import React from "react";
import { createRoot } from "react-dom/client";
import SanaraApp from "./SanaraApp.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SanaraApp />
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("sw.js", window.location.href)).catch(() => {});
  });
}
