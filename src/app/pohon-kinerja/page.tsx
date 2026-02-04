"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/src/lib/fetcher';
import './treeflex.css';
import PohonNode from '@/src/components/PohonNode';
import { PohonKinerja } from '@/src/app/pohon-kinerja/types';
import { getOpdTahun } from "@/src/components/lib/Cookie";
import { AlertNotification } from "@/src/components/global/Alert";


// Layout
import Sidebar from "@/src/components/global/sidebar/Sidebar"; 
import PageHeader from "@/src/components/global/header/Header"; 
import Breadcrumb from "@/src/components/global/breadcrumb/Breadcrumb";

// 🔥 TYPE SESUAI BACKEND
type TematikItem = {
  id: number;
  parentId: number | null;
  tema: string;
  jenisPohon: string;
  levelPohon: number;
  keterangan: string | null;
  indikator: any[];
};

const PohonKinerjaPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [listTematik, setListTematik] = useState<TematikItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [treeData, setTreeData] = useState<PohonKinerja | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Ambil tahun dari cookie
  useEffect(() => {
    const { tahun } = getOpdTahun();
    if (tahun?.value) setSelectedYear(Number(tahun.value));
  }, []);

  // 2. Sinkron URL
  useEffect(() => {
    const pohonIdParam = searchParams.get('pohon_id');
    if (pohonIdParam) setSelectedId(Number(pohonIdParam));
    else {
      setSelectedId(null);
      setTreeData(null);
    }
  }, [searchParams]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newId) params.set('pohon_id', newId);
    else params.delete('pohon_id');

    router.replace(`${pathname}?${params.toString()}`);
  };

  // 3. Fetch list tematik
  useEffect(() => {
    if (!selectedYear) return;

    const fetchTematikList = async () => {
      try {
        const res = await fetchApi({
          type: "withoutAuth",
          url: `/pohon-kinerja/tematik/${selectedYear}`,
          method: "GET"
        });

        if (res?.data?.success) {
          const listData = res.data.data.tematiks || [];
          setListTematik(listData);
        }
      } catch (err) {
        console.error("Gagal load list tematik", err);
        setError("Gagal memuat daftar pohon.");
      }
    };

    fetchTematikList();
  }, [selectedYear]);

  // 4. Fetch detail tree
  const fetchTreeDetail = useCallback(async () => {
    if (!selectedId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi({
        type: "withoutAuth",
        url: `/pohon-kinerja/${selectedId}`,
        method: "GET"
      });

      if (res?.data?.success) setTreeData(res.data.data);
      else setError(res?.data?.message || "Gagal memuat data");
    } catch {
      setError("Gagal memuat visualisasi pohon.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) fetchTreeDetail();
  }, [selectedId, fetchTreeDetail]);

  const handleDeleteNode = async (id: number) => {
  const confirmDelete = window.confirm("Yakin ingin menghapus data ini?");
  if (!confirmDelete) return;

  try {
    const res = await fetchApi({
      url: `/pohon-kinerja/${id}`,
      method: "DELETE",
      type: "auth",
    });

    if (res.status === 200 || res.data?.success) {
      AlertNotification("Berhasil", "Data berhasil dihapus", "success");

      // refresh tree setelah delete
      if (selectedId) {
        fetchTreeDetail();
      } else {
        setTreeData(null);
      }
    } else {
      throw new Error(res.data?.message || "Gagal menghapus data");
    }
  } catch (err: any) {
    console.error("DELETE ERROR:", err);
    AlertNotification("Gagal", err.message || "Terjadi kesalahan", "error");
  }
};

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans text-gray-800">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="p-4">
          <PageHeader />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Breadcrumb />

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex flex-col items-center justify-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">
                Visualisasi Pohon Kinerja Pemda {selectedYear && `Tahun ${selectedYear}`}
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                  Pilih Pohon Tematik:
                </label>

                <select
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white
                             focus:ring-2 focus:ring-blue-500 outline-none text-sm tematik-select"
                  onChange={handleSelectChange}
                  value={selectedId ?? ""}
                >
                  <option value="" disabled>-- Pilih Tematik --</option>

                  {listTematik.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.tema}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-0 min-h-[500px] relative">

  {/* SCROLL WRAPPER */}
  <div
    className="relative w-full h-[70vh] overflow-auto"
    style={{ scrollbarGutter: "stable both-edges" }}
  >

            {loading && (
              <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {error && <div className="text-center text-red-500">{error}</div>}

            {!loading && !error && !selectedId && (
              <div className="flex items-center justify-center h-64 text-blue-400 italic">
                Silakan pilih tematik di atas untuk melihat pohon kinerja.
              </div>
            )}

            {!error && treeData && (
              <div className="tf-tree tf-gap-lg flex justify-center items-start min-w-max mx-auto py-10 px-20">

                <ul>
                  <PohonNode node={treeData} isRoot onTreeRefresh={fetchTreeDetail} onDeleteAction={handleDeleteNode}/>
                </ul>
              </div>
            )}
           </div> {/* end scroll wrapper */}
</div>

        </main>
      </div>
    </div>
  );
};

export default PohonKinerjaPage;
