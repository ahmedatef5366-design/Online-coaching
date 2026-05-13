import { createClient } from "@/lib/supabase/server";
import {
  listBodyMeasurements,
  listProgressPhotos,
  listWeightLogs,
  getProgressPhotoSignedUrls,
} from "@/lib/tracking/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { getT } from "@/lib/i18n/t";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightLogger } from "@/components/client/progress/weight-logger";
import { BodyMeasurementForm } from "@/components/client/progress/body-measurement-form";
import { ProgressPhotosGallery } from "@/components/client/progress/progress-photos-gallery";

export const dynamic = "force-dynamic";

export default async function ClientProgressPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: clientRow } = (await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle()) as { data: { id: string } | null };

  const locale = readLocaleFromCookie();
  const t = getT(locale);
  if (!clientRow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("client.progress.title")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const [weights, measurements, photos] = await Promise.all([
    listWeightLogs(clientRow.id),
    listBodyMeasurements(clientRow.id),
    listProgressPhotos(clientRow.id),
  ]);
  const signedUrls = await getProgressPhotoSignedUrls(
    photos.map((p) => p.storage_path),
  );
  const photosWithUrls = photos.map((p) => ({
    ...p,
    url: signedUrls.get(p.storage_path) ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("client.progress.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("client.progress.description")}
        </p>
      </div>

      <WeightLogger locale={locale} clientId={clientRow.id} weights={weights} />

      <BodyMeasurementForm
        locale={locale}
        latest={measurements[0] ?? null}
        history={measurements}
      />

      <ProgressPhotosGallery
        locale={locale}
        clientId={clientRow.id}
        photos={photosWithUrls}
      />
    </div>
  );
}
