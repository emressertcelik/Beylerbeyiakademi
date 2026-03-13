import { redirect } from "next/navigation";

// /dashboard/antrenor → /dashboard/antrenor/antrenman-programi
export default function AntrenorPage() {
  redirect("/dashboard/antrenor/antrenman-programi");
}
