import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware replacements for `next/link` and the `next/navigation` hooks. Import `Link`
 *  from here everywhere instead of `next/link`: hrefs stay written as the locale-less path
 *  (`/faq`) and the prefix for the active locale is added at render time. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
