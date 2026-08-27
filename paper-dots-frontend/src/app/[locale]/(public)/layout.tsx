import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/** Footer is a server component that calls `getTranslations()` without an explicit locale, so
 *  without this call next-intl falls back to reading the request headers and opts the whole
 *  subtree out of static rendering. */
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
