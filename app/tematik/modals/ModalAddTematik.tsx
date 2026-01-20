// app/tematik/components/ModalAddTematik.tsx
"use client";

import { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
// import apiClient from "@/lib/axios"; // Uncomment jika sudah ada axios

interface ModalAddTematikProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalAddTematik: React.FC<ModalAddTematikProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // State Form
  const [namaTema, setNamaTema] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [tahun, setTahun] = useState("2025");
  
  // State Dinamis untuk Indikator
  const [indikators, setIndikators] = useState<string[]>([""]); 

  const [isLoading, setIsLoading] = useState(false);

  // --- Logic Indikator ---
  const handleAddIndikator = () => {
    setIndikators([...indikators, ""]);
  };

  const handleRemoveIndikator = (index: number) => {
    const list = [...indikators];
    list.splice(index, 1);
    setIndikators(list);
  };

  const handleChangeIndikator = (value: string, index: number) => {
    const list = [...indikators];
    list[index] = value;
    setIndikators(list);
  };

  // --- Logic Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        tema: namaTema,
        keterangan: keterangan,
        tahun: tahun,
        indikator: indikators.filter(i => i.trim() !== ""), // Hapus indikator kosong
      };

      console.log("Payload to Send:", payload);

      // --- SIMULASI API CALL ---
      // await apiClient.post("/tematik", payload);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay simulasi

      alert("Data berhasil disimpan!");
      setNamaTema("");
      setKeterangan("");
      setIndikators([""]);
      onSuccess(); // Refresh data di parent
      onClose();   // Tutup modal
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 uppercase">
            Form Tambah Tematik Pemda
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Nama Tema */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Nama Tema : <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaTema}
              onChange={(e) => setNamaTema(e.target.value)}
              placeholder="Masukkan Nama Tema"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">*Nama Tema Harus Terisi</p>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Keterangan : <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Masukkan Keterangan"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">*Keterangan Harus Terisi</p>
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Tahun : <span className="text-red-500">*</span>
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
            </select>
          </div>

          {/* Indikator Tematik (Dinamis) */}
          <div className="border-t pt-4">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-4">
              Indikator Tematik :
            </label>
            
            <div className="space-y-3">
              {indikators.map((indikator, index) => (
                <div key={index} className="flex gap-2 items-center">
                   <div className="flex-1">
                      <input
                        type="text"
                        value={indikator}
                        onChange={(e) => handleChangeIndikator(e.target.value, index)}
                        placeholder={`Indikator ${index + 1}`}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                   </div>
                   {indikators.length > 1 && (
                     <button
                       type="button"
                       onClick={() => handleRemoveIndikator(index)}
                       className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                       title="Hapus Indikator"
                     >
                       <Trash2 size={18} />
                     </button>
                   )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddIndikator}
              className="mt-4 w-full border-2 border-dashed border-blue-300 text-blue-500 font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors flex justify-center items-center gap-2 text-sm"
            >
              <Plus size={16} /> Tambah Indikator
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? "Menyimpan..." : (
                  <>
                     <Save size={18} /> Simpan
                  </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow transition-colors"
            >
              Kembali
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalAddTematik;