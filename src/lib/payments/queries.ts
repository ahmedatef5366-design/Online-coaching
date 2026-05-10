import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Payment, PaymentStatus } from "@/types/database";

export interface PaymentListRow extends Payment {
  client_name: string | null;
  client_email: string | null;
  application_name: string | null;
  application_email: string | null;
  package_name_en: string | null;
  package_name_ar: string | null;
}

interface ClientProfileLookup {
  profile: { full_name: string | null; email: string } | null;
}

/**
 * Payments list with denormalised client/application/package names so the
 * UI doesn't need to stitch tables together.
 *
 * Supabase's nested-select via FK joins works here but produces noisy
 * types; we intentionally keep the queries flat and hydrate in JS.
 */
export async function listPayments(
  filters: { status?: PaymentStatus | "all"; clientId?: string } = {},
): Promise<PaymentListRow[]> {
  const supabase = createClient();
  let query = supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId);
  }

  const { data, error } = (await query) as {
    data: Payment[] | null;
    error: { message: string } | null;
  };
  if (error) {
    console.error("listPayments failed", error);
    return [];
  }
  return hydratePayments(data ?? []);
}

export async function getPayment(id: string): Promise<PaymentListRow | null> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as { data: Payment | null };
  if (!data) return null;
  const [hydrated] = await hydratePayments([data]);
  return hydrated ?? null;
}

export interface PaymentStats {
  pending: number;
  confirmedThisMonth: number;
  revenueThisMonth: number;
  revenueLifetime: number;
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const supabase = createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [{ data: pendingRows }, { data: confirmedRows }] = (await Promise.all([
    supabase.from("payments").select("id").eq("status", "pending"),
    supabase
      .from("payments")
      .select("amount, created_at")
      .eq("status", "confirmed"),
  ])) as [
    { data: { id: string }[] | null },
    { data: { amount: number; created_at: string }[] | null },
  ];

  let revenueThisMonth = 0;
  let confirmedThisMonth = 0;
  let revenueLifetime = 0;
  (confirmedRows ?? []).forEach((row) => {
    revenueLifetime += Number(row.amount) || 0;
    if (row.created_at.slice(0, 10) >= monthStart) {
      revenueThisMonth += Number(row.amount) || 0;
      confirmedThisMonth += 1;
    }
  });

  return {
    pending: (pendingRows ?? []).length,
    confirmedThisMonth,
    revenueThisMonth,
    revenueLifetime,
  };
}

// ---------------------------------------------------------------------------
// internals
// ---------------------------------------------------------------------------

async function hydratePayments(rows: Payment[]): Promise<PaymentListRow[]> {
  if (rows.length === 0) return [];
  const supabase = createClient();
  const clientIds = unique(rows.map((r) => r.client_id).filter(isString));
  const applicationIds = unique(
    rows.map((r) => r.application_id).filter(isString),
  );
  const packageIds = unique(rows.map((r) => r.package_id).filter(isString));

  const [clientsResult, applicationsResult, packagesResult] = await Promise.all(
    [
      clientIds.length
        ? supabase
            .from("clients")
            .select("id, user_id")
            .in("id", clientIds)
        : Promise.resolve({ data: [] as { id: string; user_id: string }[] }),
      applicationIds.length
        ? supabase
            .from("coaching_applications")
            .select("id, full_name, email")
            .in("id", applicationIds)
        : Promise.resolve({
            data: [] as { id: string; full_name: string; email: string }[],
          }),
      packageIds.length
        ? supabase
            .from("packages")
            .select("id, name_en, name_ar")
            .in("id", packageIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              name_en: string;
              name_ar: string;
            }[],
          }),
    ],
  );

  const clientRows = (clientsResult.data ?? []) as {
    id: string;
    user_id: string;
  }[];
  const userIds = unique(clientRows.map((c) => c.user_id));
  const { data: profiles } = userIds.length
    ? ((await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)) as {
        data: { id: string; full_name: string | null; email: string }[] | null;
      })
    : { data: [] };

  const profileById = new Map<
    string,
    { full_name: string | null; email: string }
  >();
  (profiles ?? []).forEach((p) =>
    profileById.set(p.id, { full_name: p.full_name, email: p.email }),
  );

  const clientById = new Map<string, ClientProfileLookup>();
  clientRows.forEach((c) =>
    clientById.set(c.id, {
      profile: profileById.get(c.user_id) ?? null,
    }),
  );

  const applicationById = new Map<
    string,
    { id: string; full_name: string; email: string }
  >();
  ((applicationsResult.data ?? []) as {
    id: string;
    full_name: string;
    email: string;
  }[]).forEach((a) => applicationById.set(a.id, a));

  const packageById = new Map<
    string,
    { id: string; name_en: string; name_ar: string }
  >();
  ((packagesResult.data ?? []) as {
    id: string;
    name_en: string;
    name_ar: string;
  }[]).forEach((p) => packageById.set(p.id, p));

  return rows.map((row) => {
    const c = row.client_id ? clientById.get(row.client_id) : null;
    const a = row.application_id
      ? applicationById.get(row.application_id)
      : null;
    const pkg = row.package_id ? packageById.get(row.package_id) : null;
    return {
      ...row,
      client_name: c?.profile?.full_name ?? null,
      client_email: c?.profile?.email ?? null,
      application_name: a?.full_name ?? null,
      application_email: a?.email ?? null,
      package_name_en: pkg?.name_en ?? null,
      package_name_ar: pkg?.name_ar ?? null,
    };
  });
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function unique<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}
