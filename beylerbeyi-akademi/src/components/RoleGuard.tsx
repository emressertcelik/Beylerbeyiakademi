"use client";

import { useAuth } from "@/hooks/useAuth";
import { hasMinimumRole, ROLE_LABELS, type UserRole } from "@/types/roles";

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({
  requiredRole,
  children,
  fallback,
}: RoleGuardProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-[#57606a]">
          <svg className="animate-spin h-4 w-4 text-[#1b6e2a]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  if (!role || !hasMinimumRole(role, requiredRole)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex items-center justify-center p-10">
        <div className="text-center max-w-xs bg-white border border-[#e5e7eb] rounded-xl p-7 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#c4111d] rounded-t-xl" />
          <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-[#c4111d]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#c4111d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 className="text-[#1a1a1a] font-bold text-[15px] mb-1.5">
            Erişim Reddedildi
          </h3>
          <p className="text-[#57606a] text-sm leading-relaxed">
            Bu alan için{" "}
            <span className="text-[#1b6e2a] font-bold">
              {ROLE_LABELS[requiredRole]}
            </span>{" "}
            yetkisi gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
