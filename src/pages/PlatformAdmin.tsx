
import React from "react";
import { useNavigate } from "react-router-dom";
import SecureAuthGuard from "@/components/SecureAuthGuard";
import PlatformAdminLogin from "@/pages/PlatformAdminLogin";
import PlatformAdminDashboard from "@/pages/PlatformAdminDashboard";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";

const PlatformAdmin: React.FC = () => {
  const { admin } = usePlatformAdmin();
  const navigate = useNavigate();

  if (admin) {
    return (
      <SecureAuthGuard>
        <PlatformAdminDashboard />
      </SecureAuthGuard>
    );
  }

  return <PlatformAdminLogin />;
};

export default PlatformAdmin;
