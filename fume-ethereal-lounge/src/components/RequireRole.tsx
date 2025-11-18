import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

type RequireRoleProps = {
  roles: string[];
  children: ReactNode;
};

const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const location = useLocation();
  let user: any = null;
  try {
    const raw = localStorage.getItem("authUser");
    if (raw) user = JSON.parse(raw);
  } catch {
    user = null;
  }
  const role = user?.role;
  const allowed = role && roles.includes(role);
  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default RequireRole;


