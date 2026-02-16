import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // PWA dosyaları ve public API - auth atla
    const path = request.nextUrl.pathname;
    if (
      path === "/manifest.json" ||
      path === "/sw.js" ||
      path.startsWith("/icons/") ||
      path.startsWith("/api/puan-durumu")
    ) {
      return NextResponse.next();
    }

    // Env değişkenleri yoksa middleware'i atla
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error("Supabase env variables are missing!");
      return NextResponse.next();
    }

    return await updateSession(request);
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|js)$).*)",
  ],
};
