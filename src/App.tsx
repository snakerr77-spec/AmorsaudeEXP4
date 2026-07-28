import { useEffect, useState } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { clearSession, getCurrentUser, getStoredUser, saveUser } from "./lib/api";
import { HomePage } from "./pages/HomePage";
import { MedicalRecordPage } from "./pages/MedicalRecordPage";
import type { LagUser } from "./types";

function normalizedPath() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path.toLowerCase();
}

export default function App() {
  const [user, setUser] = useState<LagUser | null>(() => getStoredUser());
  const [checking, setChecking] = useState(true);
  const path = normalizedPath();

  useEffect(() => {
    if (path === "/") {
      window.location.replace("/pages/login");
      return;
    }

    const token = localStorage.getItem("amor_token");
    if (!token) {
      clearSession();
      window.location.replace(`/pages/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        saveUser(currentUser);
        setUser(currentUser);
        setChecking(false);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        window.location.replace(`/pages/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      });

    return () => {
      active = false;
    };
  }, [path]);

  if (checking || !user) return <LoadingScreen />;

  if (path === "/pages/home") return <HomePage user={user} />;
  if (path === "/modules/prontuario-medico/prontuario-medico") return <MedicalRecordPage user={user} />;

  window.location.replace("/pages/home");
  return <LoadingScreen label="Redirecionando" />;
}
