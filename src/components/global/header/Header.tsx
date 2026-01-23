"use client";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Cookies from "js-cookie";
import { setCookie, getCookie } from "@/src/components/lib/Cookie";
import { AlertNotification } from "../Alert";
import { usePathname } from "next/navigation";

interface OptionTypeString {
  value: string;
  label: string;
}

const API_PERIODE =
  process.env.NEXT_PUBLIC_PERIODE_API ??
  "https://periode-service-test.zeabur.app/periode";

const API_OPD =
  process.env.NEXT_PUBLIC_OPD_API ??
  "https://periode-service-test.zeabur.app/list_opd";

const safeParseOption = (v: string | null | undefined) => {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const Header = () => {
  const pathname = usePathname();
  const HIDE_ON = ["/login", "/register"];
  if (HIDE_ON.includes(pathname)) return null;

  const [isClient, setIsClient] = useState(false);

  // OPD
  const [dinasOptions, setDinasOptions] = useState<OptionTypeString[]>([]);
  const [loadingDinas, setLoadingDinas] = useState(false);
  const [selectedDinas, setSelectedDinas] =
    useState<OptionTypeString | null>(null);

  // PERIODE
  const [periodeOptions, setPeriodeOptions] = useState<OptionTypeString[]>([]);
  const [loadingPeriode, setLoadingPeriode] = useState(false);
  const [selectedPeriode, setSelectedPeriode] =
    useState<OptionTypeString | null>(null);

  // INIT COOKIE
  useEffect(() => {
    setIsClient(true);
    const d = safeParseOption(getCookie("selectedDinas"));
    const p = safeParseOption(getCookie("selectedPeriode"));
    if (d) setSelectedDinas(d);
    if (p) setSelectedPeriode(p);
  }, []);

  // FETCH OPD
  useEffect(() => {
    if (!isClient) return;

    const fetchDinas = async () => {
      setLoadingDinas(true);
      try {
        const res = await fetch(API_OPD, { cache: "no-store" });
        const json = await res.json();
        const options = (json?.data ?? []).map((it: any) => ({
          value: String(it.kode_opd),
          label: String(it.nama_opd),
        }));
        setDinasOptions(options);
      } finally {
        setLoadingDinas(false);
      }
    };

    fetchDinas();
  }, [isClient]);

  // FETCH PERIODE
  useEffect(() => {
    if (!isClient) return;

    const fetchPeriode = async () => {
      setLoadingPeriode(true);
      try {
        const res = await fetch(API_PERIODE, { cache: "no-store" });
        const json = await res.json();
        const options = (json?.data ?? []).map((it: any) => ({
          value: String(it.id),
          label: `${it.tahun_awal}-${it.tahun_akhir}`,
        }));
        setPeriodeOptions(options);
      } finally {
        setLoadingPeriode(false);
      }
    };

    fetchPeriode();
  }, [isClient]);

  // SYNC COOKIE
  useEffect(() => {
    if (!isClient) return;
    if (selectedDinas)
      setCookie("selectedDinas", JSON.stringify(selectedDinas));
    else Cookies.remove("selectedDinas");
  }, [isClient, selectedDinas]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedPeriode)
      setCookie("selectedPeriode", JSON.stringify(selectedPeriode));
    else Cookies.remove("selectedPeriode");
  }, [isClient, selectedPeriode]);

  const handleActivate = () => {
    if (!selectedDinas) {
      AlertNotification("Gagal", "Pilih OPD dulu", "error", 2000, true);
      return;
    }
    if (!selectedPeriode) {
      AlertNotification("Gagal", "Pilih Periode dulu", "error", 2000, true);
      return;
    }

    AlertNotification(
      "Berhasil",
      "Filter OPD & Periode diaktifkan",
      "success",
      1200,
      false
    );
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="bg-[#0f172a] text-white p-3 rounded-lg flex flex-col md:flex-row items-center justify-end gap-3 shadow-md border border-white/5">

      {isClient && (
        <>
          {/* OPD */}
          <div className="w-full sm:w-64 text-sm text-gray-800">
            <Select
              instanceId="select-dinas"
              value={selectedDinas}
              options={dinasOptions}
              onChange={(opt) => setSelectedDinas(opt)}
              isLoading={loadingDinas}
              placeholder="Pilih OPD"
              isSearchable
              isClearable
            />
          </div>

          {/* PERIODE */}
          <div className="w-full sm:w-48 text-sm text-gray-800">
            <Select
              instanceId="select-periode"
              value={selectedPeriode}
              options={periodeOptions}
              onChange={(opt) => setSelectedPeriode(opt)}
              isLoading={loadingPeriode}
              placeholder="Pilih Periode"
              isSearchable
              isClearable
            />
          </div>
        </>
      )}

      <button
        className="bg-gray-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
        onClick={handleActivate}
      >
        Aktifkan
      </button>
    </div>
  );
};

export default Header;
