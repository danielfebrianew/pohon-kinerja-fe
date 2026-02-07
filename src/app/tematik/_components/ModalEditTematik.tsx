"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { fetchApi } from "@/src/lib/fetcher";

// ======================
// TYPES
// ======================
interface ModalEditTematikProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: any; 
  tahun: number | null;
}

interface IndikatorForm {
  nama: string;
  target: string;
  satuan: string;
}

// ======================
// COMPONENT
// ======================
const ModalEditTematik: React.FC<ModalEditTematikProps> = ({
  isOpen,
  onClose,
  onSuccess,
  data,
}) => {
  // ======================
  // STATE FORM (SAMA DGN ADD)
  // ======================
  const [namaTema, setNamaTema] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [tahun, setTahun] = useState<string>("");

  const [indikators, setIndikators] = useState<IndikatorForm[]>([]);
  const [showIndikator, setShowIndikator] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ======================
  // INIT DATA EDIT (🔥 FIX UTAMA)
  // ======================
// ======================
  // INIT DATA EDIT (🔥 FIXED)
  // ======================
  useEffect(() => {
    if (!isOpen || !data) return;

    setNamaTema(data.tema ?? "");
    setKeterangan(data.keterangan ?? "");

    // --- LOGIC DETEKSI TAHUN ---
    let detectedTahun = "";

    // 1. Coba ambil tahun dari indikator pertama (jika ada datanya)
    if (data.indikator && data.indikator.length > 0 && data.indikator[0].tahun) {
      detectedTahun = String(data.indikator[0].tahun);
    } 
    // 2. Jika indikator kosong, gunakan props tahun yang dikirim dari parent
    else if (tahun) {
      detectedTahun = String(tahun);
    }

    setTahun(detectedTahun);

    // --- MAPPING INDIKATOR ---
    if (data.indikator?.length > 0) {
      setShowIndikator(true);
      setIndikators(
        data.indikator.map((i: any) => ({
          nama: i.indikator ?? "",
          target: String(i.targets?.[0]?.nilai ?? ""),
          satuan: i.targets?.[0]?.satuan ?? "",
        }))
      );
    } else {
      setShowIndikator(false);
      setIndikators([]);
    }
  }, [isOpen, data, tahun]);



  // ======================
  // INDIKATOR HANDLER
  // ======================
  const handleAddIndikator = () => {
    if (!showIndikator) {
      setShowIndikator(true);
      setIndikators([{ nama: "", target: "", satuan: "" }]);
    } else {
      setIndikators([...indikators, { nama: "", target: "", satuan: "" }]);
    }
  };

  const handleRemoveIndikator = (index: number) => {
    const list = [...indikators];
    list.splice(index, 1);
    setIndikators(list);

    if (list.length === 0) {
      setShowIndikator(false);
    }
  };

  const handleChangeIndikator = (
    index: number,
    field: keyof IndikatorForm,
    value: string
  ) => {
    const list = [...indikators];
    list[index][field] = value;
    setIndikators(list);
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tahun) {
      alert("Tahun belum dipilih");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        parentId: data.parentId ?? null,
        tema: namaTema,
        keterangan,
        tahun: Number(tahun),
        jenisPohon: "TEMATIK",
        levelPohon: data.levelPohon ?? 0,
        indikator: indikators.map((i) => ({
          id: 0,
          indikator: i.nama,
          keterangan: "",
          tahun: Number(tahun),
          targets: [
            {
              id: 0,
              nilai: Number(i.target || 0),
              satuan: i.satuan,
              tahun: Number(tahun),
            },
          ],
        })),
      };

      const res = await fetchApi({
        type: "withoutAuth",
        url: `/pohon-kinerja/${data.id}`,
        method: "PUT",
        body: payload,
      });

      if (res?.data?.success || res?.status === 200) {
        alert("Data berhasil diperbarui!");
        onSuccess();
        onClose();
      } else {
        alert(res?.data?.message || "Gagal update data");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // ======================
  // RENDER (SAMA DGN ADD)
  // ======================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold uppercase">
            Form Edit Tematik Pemda
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={22} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* NAMA TEMA */}
          <div>
            <label className="block text-xs font-bold mb-2">NAMA TEMATIK :</label>
            <input
              required
              value={namaTema}
              onChange={(e) => setNamaTema(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-sm"
            />
            <p className="text-xs text-gray-300 mt-1">
              *Nama Tematik Harus Terisi
            </p>
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="block text-xs font-bold mb-2">KETERANGAN :</label>
            <textarea
              required
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-sm"
            />
            <p className="text-xs text-gray-300 mt-1">
              *Keterangan Harus Terisi
            </p>
          </div>

          {/* TAHUN */}
          <div>
            <label className="block text-xs font-bold mb-2">TAHUN :</label>
            <input
              disabled
              value={tahun}
              className="w-full border rounded-lg px-4 py-3 text-sm bg-gray-100"
            />
          </div>

          {/* INDIKATOR */}
          <div className="border-t pt-6">
            <p className="text-xs font-bold mb-4">INDIKATOR TEMATIK :</p>

            {showIndikator &&
              indikators.map((item, index) => (
                <div key={index} className="border rounded-xl p-4 mb-4 space-y-3">

                  <div>
                    <label className="text-xs font-bold">
                      NAMA INDIKATOR {index + 1} :
                    </label>
                    <input
                      value={item.nama}
                      onChange={(e) =>
                        handleChangeIndikator(index, "nama", e.target.value)
                      }
                      className="w-full border rounded-lg px-4 py-2 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold">TARGET :</label>
                    <input
                      value={item.target}
                      onChange={(e) =>
                        handleChangeIndikator(index, "target", e.target.value)
                      }
                      className="w-full border rounded-lg px-4 py-2 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold">SATUAN :</label>
                    <input
                      value={item.satuan}
                      onChange={(e) =>
                        handleChangeIndikator(index, "satuan", e.target.value)
                      }
                      className="w-full border rounded-lg px-4 py-2 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveIndikator(index)}
                    className="border border-red-500 text-red-500 px-4 py-1 rounded-md text-sm"
                  >
                    Hapus
                  </button>
                </div>
              ))}

            <button
              type="button"
              onClick={handleAddIndikator}
              className="w-full border border-blue-500 text-blue-600 py-2 rounded-lg"
            >
              Tambah Indikator
            </button>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
            >
              Kembali
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalEditTematik;
