import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

try {
  const redirect = sessionStorage.getItem("redirect");
  if (redirect) {
    sessionStorage.removeItem("redirect");
    window.history.replaceState(
      null,
      null,
      redirect.replace(window.location.origin, "")
    );
  }
} catch (error) {
  console.warn("Redirect handling skipped:", error);
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
