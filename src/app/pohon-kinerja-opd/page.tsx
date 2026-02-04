"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/src/lib/fetcher';
import './treeflex.css';
import PohonNodeOpd from '@/src/components/PohonNodeOpd';
import { PohonKinerja } from '@/src/app/pohon-kinerja/types';

import Sidebar from "@/src/components/global/sidebar/Sidebar"; 
import PageHeader from "@/src/components/global/header/Header"; 
import Breadcrumb from '@/src/components/global/breadcrumb/Breadcrumb';
import { getOpdTahun } from "@/src/components/lib/Cookie";
import { AlertNotification } from "@/src/components/global/Alert";
const PohonKinerjaOpdPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [treeData, setTreeData] = useState<PohonKinerja | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 ambil context
  const { opd, tahun } = getOpdTahun();
  useEffect(() => {
  if (opd) {
    // fleksibel: support beberapa bentuk cookie
    setOpdName(
      opd.label || 
      opd.value || 
      ""
    );
  }
}, [opd]);

  // 🔥 fetch bisa dipanggil ulang
  const [opdName, setOpdName] = useState<string>("");

  const fetchTree = async () => {
    if (!opd || !tahun) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi({
        type: "withoutAuth",
        url: `/pohon-kinerja/opd/${opd.value}/${tahun.value}`,
        method: "GET"
      });

      if (res?.data?.success && res.data.data) {
        const responseData = res.data.data;

        if (responseData.roots && responseData.roots.length > 0) {
          setTreeData(responseData.roots[0]); // 🔥 trigger rerender
        } else {
          setTreeData(null);
          setError("Data pohon tidak ditemukan.");
        }
      } else {
        setTreeData(null);
        setError(res?.data?.message || "Belum ada pohon kinerja.");
      }
    } catch {
      setError("Gagal memuat pohon kinerja OPD.");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 load pertama
  useEffect(() => {
  if (!opd || !tahun) {
    setError("Silakan pilih OPD dan Tahun di header terlebih dahulu.");
    return;
  }
  fetchTree();
}, []);


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
if (opd && tahun) {
  fetchTree();        // 🔥 reload pohon
} else {
  setTreeData(null); // fallback
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
            <h1 className="text-xl font-bold text-gray-800 text-center">
              Visualisasi Pohon Kinerja
              {opdName && (
                <span className="block text-sm font-bold text-gray-800 mt-1">
                  {opdName}
                </span>
              )}
            </h1>

          </div>

          <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-0 min-h-[500px] relative">

  {/* SCROLL WRAPPER */}
  <div
    className="relative w-full h-[70vh] overflow-auto"
    style={{ scrollbarGutter: "stable both-edges" }}
  >


            {loading && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Memuat pohon kinerja...
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-64 text-red-500 font-medium text-center">
                {error}
              </div>
            )}

            {!loading && !error && treeData && (
              <div className="tf-tree tf-gap-lg flex justify-center items-start min-w-max mx-auto py-10 px-20">
                <ul>
                  <PohonNodeOpd
                    node={treeData}
                    isRoot
                    onTreeRefresh={fetchTree} 
                    onDeleteAction={handleDeleteNode}
                  />
                </ul>
              </div>
            )}

            {!loading && !error && !treeData && (
              <div className="flex items-center justify-center h-64 text-gray-500 italic">
                Data tidak tersedia.
              </div>
            )}
           </div> {/* end scroll wrapper */}
</div>
        </main>
      </div>
    </div>
  );
};

export default PohonKinerjaOpdPage;
