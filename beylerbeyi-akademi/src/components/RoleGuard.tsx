"use client";

import { useAuth } from "@/hooks/useAuth";
import { hasMinimumRole, ROLE_LABELS, type UserRole } from "@/types/roles";

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client tarafında rol bazlı erişim kontrolü bileşeni.
 * Kullanıcının rolü yeterli değilse içeriği göstermez.
 *
 * Kullanım:
 * <RoleGuard requiredRole="admin">
 *   <AdminPanel />
 * </RoleGuard>
 */
export default function RoleGuard({
  requiredRole,
  children,
  fallback,
}: RoleGuardProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Yetki kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  if (!role || !hasMinimumRole(role, requiredRole)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-slate-400 text-sm">
            Bu içeriği görüntülemek için en az{" "}
            <span className="text-amber-400 font-medium">
              {ROLE_LABELS[requiredRole]}
            </span>{" "}
            rolüne sahip olmanız gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
