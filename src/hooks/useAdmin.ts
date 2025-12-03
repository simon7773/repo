import { useState, useEffect } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === "ADMIN");
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();

    window.addEventListener("auth-change", checkAdminStatus);
    window.addEventListener("storage", checkAdminStatus);

    return () => {
      window.removeEventListener("auth-change", checkAdminStatus);
      window.removeEventListener("storage", checkAdminStatus);
    };
  }, []);

  return isAdmin;
}
