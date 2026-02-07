"use client";

import React, { useState } from "react";
import { PohonKinerja } from "@/src/app/pohon-kinerja-opd/types";
import { fetchApi } from "@/src/lib/fetcher";
import { AlertNotification } from "@/src/components/global/Alert";
import { Save, CircleX } from "lucide-react"; 

interface FormEditNodeProps {
  node: PohonKinerja;
  onCancel: () => void;
  onSuccess: () => void;
  kodeOpd: string;
  tahun: number;
}

export const FormEditNode: React.FC<FormEditNodeProps> = ({
  node,
  onCancel,
  onSuccess,
  kodeOpd,
  tahun,
}) => {
  const [loading, setLoading] = useState(false);

  // State Form Utama
  const [formData, setFormData] = useState({
    namaPohon: node.namaPohon,
    keterangan: node.keterangan || "",
  });

  const [indikators, setIndikators] = useState<any[]>(
    node.indikator?.map((ind) => ({
      id: ind.id,
      indikator: ind.indikator,
      nilai: ind.targets?.[0]?.nilai || 0,
      satuan: ind.targets?.[0]?.satuan || "",
      targetId: ind.targets?.[0]?.id || null,
    })) || []
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIndikatorChange = (index: number, field: string, value: any) => {
    const newIndikators = [...indikators];
    newIndikators[index] = { ...newIndikators[index], [field]: value };
    setIndikators(newIndikators);
  };

  const addIndikator = () => {
    setIndikators([
      ...indikators,
      { id: null, indikator: "", nilai: 0, satuan: "", targetId: null },
    ]);
  };

  const removeIndikator = (index: number) => {
    const newIndikators = indikators.filter((_, i) => i !== index);
    setIndikators(newIndikators);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const activeTahun = tahun ? Number(tahun) : Number(node.tahun);

    try {
      const indikatorsPayload = indikators.map((ind) => {
        return {
          id: ind.id || 0,
          indikator: ind.indikator,
          keterangan: node.keterangan || "-",
          tahun: activeTahun,
          targets: [
            {
              id: ind.targetId || 0,
              nilai: Number(ind.nilai),
              satuan: ind.satuan,
              tahun: activeTahun,
            },
          ],
        };
      });

      const payload = {
        parentId: node.parentId ?? 0,
        namaPohon: formData.namaPohon,
        keterangan: formData.keterangan || "-",
        tahun: activeTahun,
        jenisPohon: node.jenisPohon,
        levelPohon: Number(node.levelPohon),
        kodeOpd: kodeOpd || node.kodeOpd || "",
        kodePemda: node.kodePemda || "",
        status: "UPDATE",
        indikators: indikatorsPayload,
      };

      const response = await fetchApi({
        url: `/pohon-kinerja/${node.id}`,
        method: "PUT",
        body: payload,
        type: "auth",
      });

      if (response.status === 200 || response.data?.success) {
        AlertNotification("Berhasil", "Data berhasil diperbarui", "success");
        onSuccess();
      } else {
        throw new Error(response.data?.message || "Gagal memperbarui data");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      AlertNotification("Gagal", error.message || "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // REVISI 1: Width diperbesar (max-w-6xl), Padding diperkecil (p-5)
    <div className="w-full max-w-6xl mx-auto bg-white border border-gray-300 rounded-2xl p-5 shadow-lg relative">
      
      {/* HEADER JUDUL (Margin bottom dikurangi jadi mb-4) */}
      <div className="border-2 border-gray-800 rounded-lg py-2 px-4 mb-4 text-center">
        <h3 className="font-bold text-lg uppercase tracking-wider">
          EDIT {node.jenisPohon?.replace(/_/g, " ")}
        </h3>
      </div>

      {/* REVISI 2: Gap antar elemen dirapetin (gap-4) */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* FIELD NAMA POHON */}
        <div className="text-center">
          <label className="block text-sm font-bold text-gray-600 uppercase mb-2">
            {node.jenisPohon?.replace(/_/g, " ")}
          </label>
          <input
            type="text"
            name="namaPohon"
            value={formData.namaPohon}
            onChange={handleChange}
            // Height input dirapetin (py-2)
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Masukkan Nama..."
            required
          />
           <p className="text-xs text-gray-400 mt-1 font-light">*nama pohon wajib terisi</p>
        </div>

        {/* SECTION INDIKATOR */}
        <div>
          <h4 className="text-center text-blue-700 font-bold text-base uppercase mb-4">
            INDIKATOR {node.jenisPohon?.replace(/_/g, " ")} :
          </h4>

          <div className="space-y-4">
            {indikators.map((ind, idx) => (
              <div
                key={idx}
                // Padding dalam indikator dirapetin (p-4)
                className="border-2 border-blue-400 rounded-xl p-4 shadow-sm bg-white relative"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1 text-center">
                      NAMA INDIKATOR {idx + 1}:
                    </label>
                    <input
                      type="text"
                      value={ind.indikator}
                      onChange={(e) =>
                        handleIndikatorChange(idx, "indikator", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1 text-center">
                      TARGET :
                    </label>
                    <input
                      type="number"
                      value={ind.nilai}
                      onChange={(e) =>
                        handleIndikatorChange(idx, "nilai", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1 text-center">
                      SATUAN :
                    </label>
                    <input
                      type="text"
                      value={ind.satuan}
                      onChange={(e) =>
                        handleIndikatorChange(idx, "satuan", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:border-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIndikator(idx)}
                    className="w-fit px-6 border-2 border-red-500 text-red-600 rounded-lg py-1.5 mt-1 text-sm font-bold hover:bg-red-50 transition-colors uppercase"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIndikator}
            className="w-full border-2 border-blue-500 text-blue-600 rounded-lg py-2 mt-4 flex items-center justify-center gap-2 font-bold hover:bg-blue-50 transition-colors uppercase"
          >
            <span className="text-lg">⊕</span> Tambah Indikator
          </button>
        </div>
        
        {/* KETERANGAN */}
        <div className="text-center">
             <label className="block text-sm font-bold text-gray-600 uppercase mb-2">KETERANGAN</label>
             <textarea 
                name="keterangan" 
                value={formData.keterangan} 
                onChange={handleChange} 
                rows={2} // Rows dikurangi jadi 2
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none"
             />
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex flex-col gap-2 mt-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0095F6] hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full bg-[#D32F2F] hover:bg-red-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <CircleX size={18} />
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};