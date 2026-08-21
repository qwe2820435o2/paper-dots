import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
        <Camera className="w-7 h-7 text-primary-foreground" />
      </div>
      <h1 className="text-6xl font-black text-foreground mb-3">{t("code")}</h1>
      <p className="text-xl font-semibold text-foreground mb-2">{t("heading")}</p>
      <p className="text-muted-foreground mb-8 max-w-sm">{t("body")}</p>
      <div className="flex gap-3">
        <Link href="/">
          <Button className="rounded-full px-6">{t("backHome")}</Button>
        </Link>
        <Link href="/create/dot">
          <Button variant="outline" className="rounded-full px-6">{t("startDecorating")}</Button>
        </Link>
      </div>
    </div>
  );
}
