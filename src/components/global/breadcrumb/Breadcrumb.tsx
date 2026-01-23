"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  "perencanaan-pemda": "Perencanaan Pemda",
  tematik: "Tematik Pemda",
  "pohon-kinerja": "Pohon Kinerja Pemda",
  opd: "Perencanaan OPD",
};

function toLabel(segment: string) {
  if (LABEL_MAP[segment]) return LABEL_MAP[segment];

  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumb() {
  const pathname = usePathname();

  const items = useMemo(() => {
    if (!pathname) return [];

    const segments = pathname
      .split("/")
      .filter(Boolean)
      .filter((seg) => isNaN(Number(seg))); // skip id

    let hrefAcc = "";

    return segments.map((seg, idx) => {
      hrefAcc += `/${seg}`;
      return {
        label: toLabel(seg),
        href: hrefAcc,
        isLast: idx === segments.length - 1,
      };
    });
  }, [pathname]);

  if (items.length === 0) return null;

  return (
    <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
      {/* Home */}
      <Link href="/dashboard" className="hover:text-blue-500 transition-colors">
        <Home size={16} />
      </Link>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span>/</span>
          {item.isLast ? (
            <span className="font-semibold text-gray-700">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-blue-500 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
