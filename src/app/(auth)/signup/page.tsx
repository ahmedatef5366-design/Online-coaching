import { redirect } from "next/navigation";

/**
 * Public self-signup is disabled — coaches provision client accounts from
 * `/admin/clients/new`. Anyone landing on `/signup` (e.g. from a stale
 * link) is redirected to `/login` so they can use credentials issued by
 * their coach.
 */
export default function SignupPage() {
  redirect("/login");
}
