"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from "@/components/layout/Sidebar";
import PageHeader from "@/components/layout/PageHeader";
// import apiClient from '@/lib/axios'; 
import { TematikData } from './types';
import { Plus, Pencil, Trash2, Home } from 'lucide-react';
import ModalAddTematik from './modals/ModalAddTematik'; // Import Modal

const TematikPage = () => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dataTematik, setDataTematik] = useState<TematikData[]>([]);
    const [loading, setLoading] = useState(true);
    const [tahun, setTahun] = useState(2025); 

    // State untuk Modal Tambah
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // --- MOCK DATA ---
            const mockData: TematikData[] = [
                {
                    id: 1,
                    tema: "Terwujudnya Sragen yang Maju dan Berdaya Saing - 198",
                    keterangan: "Menjadikan Sragen Maju dan Berdaya Saing",
                    indikator: "Laju Pertumbuhan Ekonomi",
                    target: "5,60-5,86",
                    satuan: "%",
                    tahun: 2025
                },
                {
                    id: 2,
                    tema: "Terwujudnya Sragen Sejahtera dan Merata - 1527",
                    keterangan: "Terwujudnya Sragen Sejahtera dan Merata",
                    indikator: "Tingkat Kemiskinan",
                    target: "12,07-11,65",
                    satuan: "Persen",
                    tahun: 2025
                },
            ];
            // Simulasi delay refresh
            setTimeout(() => setDataTematik(mockData), 500); 
        } catch (error) {
            console.error("Gagal ambil data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tahun]);

    // --- DELETE HANDLER ---
    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            try {
                alert("Berhasil menghapus data (Simulasi)");
                setDataTematik(prev => prev.filter(item => item.id !== id));
            } catch (error) {
                alert("Gagal menghapus data");
            }
        }
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-800">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="p-4 bg-white shadow-sm z-10">
                    <PageHeader />
                </header>

                <main className="flex-1 overflow-y-auto p-6 relative">
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                        <Link href="/" className="hover:text-blue-500 transition-colors">
                            <Home size={16} />
                        </Link>
                        <span>/</span>
                        <span>Perencanaan Pemda</span>
                        <span>/</span>
                        <span className="font-semibold text-gray-700">Tematik Pemda</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[80vh]">
                        {/* Header Content */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h1 className="text-xl font-bold uppercase tracking-wide text-gray-800">
                                TEMATIK PEMDA TAHUN {tahun}
                            </h1>
                            
                            {/* TOMBOL TAMBAH (UPDATE) */}
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Plus size={16} />
                                Tambah Tematik
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-t-lg border border-gray-200">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-white uppercase bg-[#93C5FD]"> 
                                    <tr>
                                        <th className="px-4 py-3 text-center w-12">No</th>
                                        <th className="px-4 py-3 w-1/4">Tema</th>
                                        <th className="px-4 py-3 w-1/4">Keterangan</th>
                                        <th className="px-4 py-3">Indikator</th>
                                        <th className="px-4 py-3">Target/Satuan</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-400">Memuat data...</td>
                                        </tr>
                                    ) : dataTematik.length > 0 ? (
                                        dataTematik.map((item, index) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 text-center">{index + 1}</td>
                                                <td className="px-4 py-4 font-medium text-gray-800">{item.tema}</td>
                                                <td className="px-4 py-4">{item.keterangan}</td>
                                                <td className="px-4 py-4">{item.indikator}</td>
                                                <td className="px-4 py-4">
                                                    {item.target && item.target !== '-' ? `${item.target} / ${item.satuan}` : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex flex-col gap-2 items-center justify-center">
                                                        <button 
                                                            onClick={() => router.push(`/tematik/edit/${item.id}`)}
                                                            className="bg-[#22C55E] hover:bg-green-600 text-white px-3 py-1 rounded text-xs w-20 flex items-center justify-center gap-1 transition-colors"
                                                        >
                                                            <Pencil size={12} /> Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item.id)}
                                                            className="bg-[#EF4444] hover:bg-red-600 text-white px-3 py-1 rounded text-xs w-20 flex items-center justify-center gap-1 transition-colors"
                                                        >
                                                            <Trash2 size={12} /> Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-400 italic">
                                                Belum ada data tematik tahun {tahun}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* --- RENDER MODAL --- */}
                <ModalAddTematik 
                    isOpen={isAddModalOpen} 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSuccess={() => {
                        fetchData(); // Refresh tabel setelah simpan berhasil
                    }}
                />

            </div>
        </div>
    );
};

export default TematikPage;