"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { fetchApi } from "@/src/lib/fetcher";
import { getCookie } from "@/src/components/lib/Cookie";

// JSON lokal (SAMA DENGAN HEADER)
import tahunData from "@/src/data/tahun.json";

interface ModalAddTematikProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface IndikatorForm {
  nama: string;
  target: string;
  satuan: string;
}

interface TahunOption {
  value: string;
  label: string;
}

// helper aman parse cookie
const safeParse = (v: string | null | undefined) => {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const ModalAddTematik: React.FC<ModalAddTematikProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // ======================
  // STATE FORM
  // ======================
  const [namaTema, setNamaTema] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [tahun, setTahun] = useState<string>("");
  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);

  const [indikators, setIndikators] = useState<IndikatorForm[]>([]);
  const [showIndikator, setShowIndikator] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ======================
  // INIT SAAT MODAL DIBUKA
  // ======================
useEffect(() => {
  if (!isOpen) return;

  const options = tahunData.map((it: any) => ({
    value: String(it.id),
    label: it.label,
  }));
  setTahunOptions(options);

  const cookieTahun = safeParse(getCookie("tahun"));
  if (cookieTahun?.value) {
    setTahun(String(cookieTahun.value));
  } else {
    setTahun("");
  }
}, []); // ⬅️ dependency STABIL


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
      const formattedIndikators = indikators
        .filter((i) => i.nama.trim() !== "")
        .map((i) => ({
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
        }));

      const payload = {
        namaPohon: namaTema,
        keterangan,
        tahun: Number(tahun),
        jenisPohon: "TEMATIK",
        levelPohon: 0,
        kodeOpd: "",
        kodePemda: "",
        status: "DRAFT",
        indikators: formattedIndikators,
      };

      const res = await fetchApi({
        type: "withoutAuth",
        url: "/pohon-kinerja",
        method: "POST",
        body: payload,
      });

      if (res?.data?.success) {
        alert("Data berhasil disimpan!");
        setNamaTema("");
        setKeterangan("");
        setIndikators([]);
        setShowIndikator(false);
        onSuccess();
        onClose();
      } else {
        alert(res?.data?.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold uppercase">
            Form Tambah Tematik Pemda
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={22} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* NAMA TEMA */}
          <div>
            <label className="block text-xs font-bold mb-2">NAMA TEMA :</label>
            <input
              required
              value={namaTema}
              onChange={(e) => setNamaTema(e.target.value)}
              placeholder="masukkan Nama Tema"
              className="w-full border rounded-lg px-4 py-3 text-sm"
            />
            <p className="text-xs text-gray-300 mt-1">
              *Nama Tema Harus Terisi
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
              placeholder="masukkan Keterangan"
              className="w-full border rounded-lg px-4 py-3 text-sm"
            />
            <p className="text-xs text-gray-300 mt-1">
              *Keterangan Harus Terisi
            </p>
          </div>

          {/* TAHUN */}
          <div>
            <label className="block text-xs font-bold mb-2">TAHUN :</label>
            <select
              required
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-sm"
            >
              <option value="">Masukkan tahun</option>
              {[2030, 2029, 2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="text-xs text-gray-300 mt-1">
              *Tahun Harus Terisi
            </p>
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
                    <p className="text-xs text-gray-300 mt-1">
                      *Nama Indikator Harus Terisi
                    </p>
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
                    <p className="text-xs text-gray-300 mt-1">
                      *Target Harus Terisi
                    </p>
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
                    <p className="text-xs text-gray-300 mt-1">
                      *Satuan Harus Terisi
                    </p>
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

export default ModalAddTematik;
