import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { NewClientForm } from "@/components/admin/clients/new-client-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewClientPage() {
  const locale = readLocaleFromCookie();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {locale === "ar" ? "كل العملاء" : "All clients"}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {locale === "ar" ? "عميل جديد" : "New client"}
          </CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "هنعمل حساب جديد ونبعت بيانات الدخول للعميل."
              : "Provisions a Supabase auth user with role=client and stores their personal info."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewClientForm locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
