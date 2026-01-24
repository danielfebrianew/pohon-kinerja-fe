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

const PohonKinerjaOpdPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [treeData, setTreeData] = useState<PohonKinerja | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === AMBIL DARI COOKIE ===
  useEffect(() => {
    const { opd, tahun } = getOpdTahun();

    if (!opd || !tahun) {
      setError("Silakan pilih OPD dan Tahun di header terlebih dahulu.");
      return;
    }

    const fetchTree = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchApi({
          type: "withoutAuth",
          url: `/pohon-kinerja/opd?kodeOpd=${opd.value}&tahun=${tahun.value}`,
          method: "GET"
        });

        if (res?.data?.success && res.data.data) {
          setTreeData(res.data.data);
        } else {
          setTreeData(null);
          setError("Belum ada pohon kinerja untuk OPD & tahun ini.");
        }

      } catch (err) {
        console.error(err);
        setError("Gagal memuat pohon kinerja OPD.");
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

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
              Visualisasi Pohon Kinerja OPD
            </h1>
          </div>

          <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-4 min-h-[500px] overflow-x-auto">

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
              <div className="tf-tree tf-gap-lg flex justify-center items-start min-w-max mx-auto py-10">
                <ul>
                  <PohonNodeOpd node={treeData} />
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PohonKinerjaOpdPage;
