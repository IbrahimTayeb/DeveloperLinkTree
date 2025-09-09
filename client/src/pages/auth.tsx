import { useEffect } from "react";
import { useLocation } from "wouter";
import { getStoredAuth } from "@/lib/auth";

export default function Auth() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = getStoredAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return null;
}
