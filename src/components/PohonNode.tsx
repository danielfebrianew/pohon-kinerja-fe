"use client";

import React, { useState } from "react";
import { PohonKinerja, Indikator } from "@/src/app/pohon-kinerja/types";
import { getChildInfo, getPohonStyle } from "@/src/app/pohon-kinerja/utils";
import { fetchApi } from "@/src/lib/fetcher";
import { getOpdTahun } from "@/src/components/lib/Cookie";

interface PohonNodeProps {
  node: PohonKinerja;
  onTreeRefresh?: () => void;
  onDeleteAction?: (nodeId: number) => void;
  isRoot?: boolean;
}

// --- INTERNAL COMPONENT: Form Edit (PEMDA) ---
const FormEditNode = ({ node, onCancel, onSuccess }: any) => {
  const [namaPohon, setNamaPohon] = useState(node.namaPohon || "");
  const [keterangan, setKeterangan] = useState(node.keterangan || "");
  
  const existingIndikatorList = Array.isArray(node.indikator) ? node.indikator : [];
  const firstInd = existingIndikatorList.length > 0 ? existingIndikatorList[0] : {};
  const firstTarget = (firstInd.targets && firstInd.targets.length > 0) ? firstInd.targets[0] : {};

  const [indikatorNama, setIndikatorNama] = useState(firstInd.indikator || "");
  const [targetNilai, setTargetNilai] = useState(firstTarget.nilai || 0); 
  const [satuan, setSatuan] = useState(firstTarget.satuan || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { opd, tahun } = getOpdTahun();
      const activeOpd = opd?.value || node.kodeOpd || ""; 
      const activeTahun = tahun?.value ? Number(tahun.value) : Number(node.tahun);

      const payload = {
        id: Number(node.id),
        parentId: Number(node.parentId) || 0,
        namaPohon: String(namaPohon),
        keterangan: String(keterangan),
        tahun: activeTahun,
        jenisPohon: String(node.jenisPohon),
        levelPohon: Number(node.levelPohon),
        kodeOpd: String(activeOpd),
        kodePemda: String(node.kodePemda || ""),
        status: String(node.status || "DRAFT"),
        indikators: [{
            id: Number(firstInd.id) || 0,
            indikator: String(indikatorNama),
            keterangan: "-",
            tahun: activeTahun,
            targets: [{ id: Number(firstTarget.id) || 0, nilai: Number(targetNilai), satuan: String(satuan), tahun: activeTahun }]
        }]
      };

      const res = await fetchApi({ url: `/pohon-kinerja/${node.id}`, method: 'PUT', body: payload, type: 'auth' });
      if (res.status === 200 || res.status === 201 || res.data?.success) {
        alert("Berhasil update data!");
        onSuccess();
      } else {
        alert(res.data?.message || "Gagal update");
      }
    } catch (error) { console.error(error); alert("Error sistem"); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col rounded-lg shadow-xl border-2 border-yellow-500 bg-white w-72 text-left">
       <div className="p-2 border-b bg-yellow-100 font-bold text-xs uppercase text-yellow-800">EDIT DATA</div>
       <form onSubmit={handleSubmit} className="p-3 flex flex-col gap-2">
          <input required placeholder="Nama Pohon" value={namaPohon} onChange={e => setNamaPohon(e.target.value)} className="w-full border rounded p-1 text-xs" />
          <div className="p-2 border rounded bg-yellow-50/50">
            <input required placeholder="Indikator" value={indikatorNama} onChange={e => setIndikatorNama(e.target.value)} className="w-full border rounded p-1 text-xs mb-1" />
            <div className="flex gap-1">
                <input required type="number" placeholder="Target" value={targetNilai} onChange={e => setTargetNilai(e.target.value)} className="w-1/2 border rounded p-1 text-xs" />
                <input required placeholder="Satuan" value={satuan} onChange={e => setSatuan(e.target.value)} className="w-1/2 border rounded p-1 text-xs" />
            </div>
          </div>
          <textarea placeholder="Keterangan" value={keterangan} onChange={e => setKeterangan(e.target.value)} className="w-full border rounded p-1 text-xs" rows={2} />
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 py-1 rounded text-xs">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-yellow-500 text-white py-1 rounded text-xs font-bold">{loading ? "..." : "Simpan"}</button>
          </div>
       </form>
    </div>
  );
};

// --- INTERNAL COMPONENT: Form Add (PEMDA) ---
const FormAddChildModal = ({ parentId, childInfo, onCancel, onSuccess }: any) => {
    const [namaPohon, setNamaPohon] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [indikator, setIndikator] = useState("");
    const [target, setTarget] = useState("");
    const [satuan, setSatuan] = useState("");
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const { opd, tahun } = getOpdTahun();
        if (!tahun?.value) return alert("Tahun tidak ditemukan di header");
        
        const activeTahun = Number(tahun.value);
        const activeOpd = opd?.value || "";

        const payload = {
          parentId: Number(parentId),
          namaPohon: String(namaPohon),
          keterangan: String(keterangan),
          tahun: activeTahun,
          jenisPohon: String(childInfo.jenis),
          levelPohon: Number(childInfo.level),
          kodeOpd: String(activeOpd),
          kodePemda: "",
          status: "DRAFT",
          indikators: [{ id: 0, indikator: String(indikator), keterangan: "-", tahun: activeTahun, targets: [{ id: 0, nilai: Number(target), satuan: String(satuan), tahun: activeTahun }] }]
        };
        const res = await fetchApi({ url: '/pohon-kinerja', method: 'POST', body: payload, type: 'auth' });
        if (res.status === 200 || res.data?.success) { alert("Berhasil tambah data!"); onSuccess(); } 
        else { alert(res.data?.message || "Gagal simpan"); }
      } catch (error) { alert("Error sistem"); } finally { setLoading(false); }
    };
  
    return (
      <div className="flex flex-col rounded-lg shadow-xl border-2 border-blue-500 bg-white w-72 text-left">
        <div className="p-2 border-b bg-blue-100 font-bold text-xs uppercase text-blue-800">TAMBAH {childInfo.label}</div>
        <form onSubmit={handleSubmit} className="p-3 flex flex-col gap-2">
            <input required placeholder="Nama Pohon" value={namaPohon} onChange={e => setNamaPohon(e.target.value)} className="w-full border rounded p-1 text-xs" />
            <div className="p-2 border rounded bg-blue-50/50">
                <input required placeholder="Indikator" value={indikator} onChange={e => setIndikator(e.target.value)} className="w-full border rounded p-1 text-xs mb-1" />
                <div className="flex gap-1">
                    <input required type="number" placeholder="Target" value={target} onChange={e => setTarget(e.target.value)} className="w-1/2 border rounded p-1 text-xs" />
                    <input required placeholder="Satuan" value={satuan} onChange={e => setSatuan(e.target.value)} className="w-1/2 border rounded p-1 text-xs" />
                </div>
            </div>
            <textarea placeholder="Keterangan" value={keterangan} onChange={e => setKeterangan(e.target.value)} className="w-full border rounded p-1 text-xs" rows={2} />
            <div className="flex gap-2 mt-1">
                <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 py-1 rounded text-xs">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-1 rounded text-xs font-bold">{loading ? "..." : "Simpan"}</button>
            </div>
        </form>
      </div>
    );
};

// --- UTAMA ---
const getHeaderStyle = (jenisPohon: string) => {
  switch (jenisPohon) {
    case "STRATEGIC_PEMDA": return "border-red-700 text-white bg-gradient-to-r from-[#CA3636] from-40% to-[#BD04A1]";
    case "TACTICAL_PEMDA": return "border-blue-500 text-white bg-gradient-to-r from-[#3673CA] from-40% to-[#08D2FB]";
    case "OPERATIONAL_PEMDA": return "border-green-500 text-white bg-gradient-to-r from-[#139052] from-40% to-[#2DCB06]";
    case "TEMATIK": case "SUB_TEMATIK": case "SUB_SUB_TEMATIK": case "SUPER_SUB_TEMATIK": return "border-black bg-white text-black";
    default: return "border-gray-300 bg-white text-gray-800";
  }
};

const getButtonColor = (jenisPohon: string) => {
  if (jenisPohon === 'STRATEGIC_PEMDA') return 'border-[#3072D6] text-[#3072D6] hover:bg-[#3072D6]';
  if (jenisPohon === 'SUPER_SUB_TEMATIK') return 'border-[#D20606] text-[#D20606] hover:bg-[#D20606]';
  return 'border-[#00A607] text-[#00A607] hover:bg-[#00A607]';
};

const PohonNode: React.FC<PohonNodeProps> = ({ node, onTreeRefresh, onDeleteAction, isRoot = false }) => {
  const styles = getPohonStyle(node.levelPohon);
  const childInfo = getChildInfo(node.levelPohon);
  const hasChildren = node.children && node.children.length > 0;

  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleExpand = () => setIsExpanded(!isExpanded);
  const getLabelTampilkan = () => isExpanded ? (isRoot ? "Sembunyikan Anak" : "Sembunyikan") : (isRoot ? "Tampilkan Anak" : "Tampilkan");

  // Icons (Same as OPD)
  const IconAdd = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M9 12h6"></path><path d="M12 9v6"></path></svg>);
  const IconEdit = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path><path d="M13.5 6.5l4 4"></path></svg>);
  const IconDelete = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
  const IconCetak = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 w-3.5 h-3.5"><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2"></path><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4"></path><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z"></path></svg>);
  const IconEye = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path></svg>);
  const IconEyeOff = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"></path><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"></path><path d="M3 3l18 18"></path></svg>);

  const deleteNode = async (id: number) => {
      if(!confirm("Hapus data ini?")) return;
      try {
          const res = await fetchApi({ url: `/pohon-kinerja/${id}`, method: "DELETE", type: "auth" });
          if(res.status === 200 || res.data?.success) { alert("Terhapus"); if(onTreeRefresh) onTreeRefresh(); else window.location.reload(); }
          else alert("Gagal hapus");
      } catch(e) { alert("Error sistem"); }
  };

  return (
    <li>
      {isEditing ? (
        <div className="tf-nc" style={{ padding: 0, border: 'none', background: 'transparent' }}>
          <FormEditNode node={node} onCancel={() => setIsEditing(false)} onSuccess={() => { setIsEditing(false); if (onTreeRefresh) onTreeRefresh(); else window.location.reload(); }} />
        </div>
      ) : (
        <div className={`tf-nc tf flex flex-col rounded-lg shadow-lg ${styles.card} max-w-sm relative ${isRoot ? 'before:hidden' : ''}`}>
          <div className={`flex flex-col rounded-lg shadow-sm mb-2 border p-3 ${styles.header} ${getHeaderStyle(node.jenisPohon)}`}>
            <span className="text-xs text-center font-bold uppercase opacity-80">{node.jenisPohon?.replace(/_/g, " ")} - {node.id}</span>
          </div>
          <div className="bg-white p-2 rounded-b-lg">
            <table className="w-full border-collapse text-xs">
              <tbody>
                <tr><td className="border p-2 font-semibold text-gray-600 w-24">Tema </td><td className="border p-2">{node.namaPohon}</td></tr>
                {node.indikator && node.indikator.length > 0 ? (
                  node.indikator.map((ind: Indikator, idx: number) => (
                    <React.Fragment key={ind.id || idx}>
                      <tr><td className="border p-2 font-semibold text-gray-600 w-24">Indikator {idx + 1}</td><td className="border p-2"><div className={`${styles.badge} inline-block px-2 py-1 rounded text-[10px]`}>{ind.indikator}</div></td></tr>
                      <tr><td className="border p-2 font-semibold text-gray-600">Target/Satuan</td><td className="border p-2">{ind.targets?.map((t) => (<div key={t.id}>{t.nilai}/{t.satuan}</div>))}</td></tr>
                    </React.Fragment>
                  ))
                ) : (
                  <><tr><td className="border p-2 font-semibold text-gray-600">Indikator</td><td className="border p-2 text-gray-400 italic">-</td></tr><tr><td className="border p-2 font-semibold text-gray-600">Target/Satuan</td><td className="border p-2 text-gray-400 italic">-</td></tr></>
                )}
                <tr><td className="border p-2 font-semibold text-gray-600">Keterangan</td><td className="border p-2 text-gray-700 bg-gray-50">{node.keterangan || "-"}</td></tr>
              </tbody>
            </table>
            <div className="flex-wrap">
              <div className="flex gap-3 justify-evenly my-4 hide-on-capture text-xs">
                <button onClick={() => setIsEditing(true)} className="px-2 py-1 flex justify-center rounded-md items-center bg-white border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors"><IconEdit /> Edit</button>
                <button className="px-2 py-1 text-xs flex justify-center items-center bg-linear-to-r from-[#08C2FF] to-[#006BFF] hover:from-[#0584AD] hover:to-[#014CB2] text-white rounded-md transition-all shadow-sm"><IconCetak /> <span className="font-semibold">Cetak</span></button>
                <button onClick={() => deleteNode(node.id)} className="px-2 py-1 flex justify-center items-center bg-linear-to-r border-2 border-[#D63030] hover:bg-[#D63030] text-[#D63030] hover:text-white rounded-md transition-colors"><IconDelete /> Hapus</button>
              </div>
              <div className="flex gap-3 justify-evenly my-4 hide-on-capture text-xs">
                {childInfo && <button onClick={() => setIsAddModalOpen(true)} className={`px-2 py-1 flex justify-center rounded-md items-center bg-white border-2 transition-colors hover:text-white ${getButtonColor(node.jenisPohon)}`}><IconAdd /> {childInfo.label}</button>}
                {node.levelPohon < 3 && <button onClick={() => setIsAddModalOpen(true)} className="px-2 py-1 flex justify-center rounded-md items-center bg-white border-2 border-[#D20606] text-[#D20606] hover:bg-[#D20606] hover:text-white transition-colors"><IconAdd /> Strategic Pemda</button>}
              </div>
              <div className="flex gap-3 justify-evenly my-4 hide-on-capture text-xs">  
                {(hasChildren || isAddModalOpen) && <button onClick={handleToggleExpand} className="px-2 py-1 flex justify-center rounded-md items-center bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors">{isExpanded ? <IconEyeOff /> : <IconEye />} <span className="font-semibold">{getLabelTampilkan()}</span></button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {(isExpanded || isAddModalOpen) && ((hasChildren) || isAddModalOpen) && (
        <ul className="flex justify-center relative">
          {isExpanded && hasChildren && node.children?.map((child) => (
            <PohonNode key={child.id} node={child} onTreeRefresh={onTreeRefresh} onDeleteAction={onDeleteAction} isRoot={false} />
          ))}
          {isAddModalOpen && childInfo && (
            <li>
              <div className="tf-nc" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <FormAddChildModal parentId={node.id} childInfo={childInfo} onCancel={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); if (onTreeRefresh) onTreeRefresh(); else window.location.reload(); }} />
              </div>
            </li>
          )}
        </ul>
      )}
    </li>
  );
};

export default PohonNode;