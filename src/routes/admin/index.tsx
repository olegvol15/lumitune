import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuthStore } from "../../store/adminAuthStore";

export const Route = createFileRoute("/admin/")({ component: AdminIndex });

function AdminIndex() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/admin/login" });
    } else {
      navigate({ to: "/admin/tracks" });
    }
  }, [isAuthenticated, navigate]);

  return null;
}
