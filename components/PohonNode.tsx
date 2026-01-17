// components/PohonNode.tsx
import React, { useState, useEffect } from "react";
import { PohonKinerja, Indikator } from "@/app/pohon-kinerja/types";
import { getChildInfo, getPohonStyle } from "@/app/pohon-kinerja/utils";
import { ModalAddChild } from "@/app/pohon-kinerja/modals/ModalAddChild";
import { ModalEditNode } from "@/app/pohon-kinerja/modals/ModalEditNode";
import apiClient from "@/app/lib/axios";
import { TbEye, TbEyeOff } from "react-icons/tb";

interface PohonNodeProps {
  node: PohonKinerja;
  onTreeRefresh?: () => void;
  // Prop untuk meneruskan sinyal "Buka Semua" dari parent
  forceExpand?: boolean; 
}

const getHeaderStyle = (jenisPohon: string) => {
  switch (jenisPohon) {
    case "STRATEGIC_PEMDA":
      return "border-red-700 text-white bg-gradient-to-r from-[#CA3636] from-40% to-[#BD04A1]";
    case "TACTICAL_PEMDA":
      return "border-blue-500 text-white bg-gradient-to-r from-[#3673CA] from-40% to-[#08D2FB]";
    case "OPERATIONAL_PEMDA":
      return "border-green-500 text-white bg-gradient-to-r from-[#139052] from-40% to-[#2DCB06]";
    case "TEMATIK":
    case "SUB_TEMATIK":
    case "SUB_SUB_TEMATIK":
    case "SUPER_SUB_TEMATIK":
      return "border-black bg-white text-black";
    default:
      return "border-gray-300 bg-white text-gray-800";
  }
};

const getButtonColor = (jenisPohon: string) => {
  if (jenisPohon === 'STRATEGIC_PEMDA') return 'border-[#3072D6] text-[#3072D6] hover:bg-[#3072D6]';
  if (jenisPohon === 'SUPER_SUB_TEMATIK') return 'border-[#D20606] text-[#D20606] hover:bg-[#D20606]';
  return 'border-[#00A607] text-[#00A607] hover:bg-[#00A607]'; // Default Hijau
};

const PohonNode: React.FC<PohonNodeProps> = ({ node, onTreeRefresh, forceExpand }) => {
  const styles = getPohonStyle(node.levelPohon);
  const childInfo = getChildInfo(node.levelPohon);
  const hasChildren = node.children && node.children.length > 0;
  
  // Deteksi apakah ini Root (Pohon Paling Atas)
  const isRoot = node.levelPohon === 0;

  // --- STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // 1. DEFAULT STATE: FALSE (TERTUTUP)
  // Ini memastikan saat pertama load, anak-anak tidak muncul.
  const [isExpanded, setIsExpanded] = useState(false);

  // State khusus Root untuk menyimpan status "Tampilkan Semua"
  const [rootRecursiveState, setRootRecursiveState] = useState(false);

  // 2. EFFECT: MENERIMA SINYAL DARI PARENT (RECURSIVE)
  // Jika tombol "Tampilkan Semua" di Root ditekan, sinyal ini akan merambat ke bawah.
  useEffect(() => {
    if (forceExpand !== undefined) {
        setIsExpanded(forceExpand);
    }
  }, [forceExpand]);

  // --- HANDLER TOMBOL ---
  const handleToggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);

    // Jika Root diklik, ubah 'rootRecursiveState' agar dikirim ke semua anak
    if (isRoot) {
        setRootRecursiveState(newState);
    }
    // Jika Anak diklik, kita HANYA ubah 'isExpanded' diri sendiri (Single Level),
    // tidak mengubah 'rootRecursiveState' atau mengirim sinyal ke bawah.
  };

  const getLabelTampilkan = () => {
    if (isExpanded) {
        return isRoot ? "Sembunyikan Semua" : "Sembunyikan";
    } else {
        return isRoot ? "Tampilkan Semua" : "Tampilkan";
    }
  };

  const handleDelete = async () => {
    const confirmMsg = `Apakah Anda yakin ingin menghapus "${node.namaPohon}"? \n\nData yang dihapus tidak dapat dikembalikan.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await apiClient.delete(`/pohon-kinerja/${node.id}`);
      alert("Berhasil menghapus data.");
      if (onTreeRefresh) onTreeRefresh();
      else window.location.reload();
    } catch (error: any) {
      console.error("Gagal menghapus:", error);
      const msg = error?.response?.data?.message || "Gagal menghapus data.";
      alert(msg);
    }
  };

  // --- ICON COMPONENTS ---
  const IconAdd = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M9 12h6"></path><path d="M12 9v6"></path></svg>
  );
  const IconEdit = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path><path d="M13.5 6.5l4 4"></path></svg>
  );
  const IconDelete = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
  );
  const IconCetak = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 w-3.5 h-3.5"><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2"></path><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4"></path><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z"></path></svg>
  );

  return (
    <li>
      <div className={`tf-nc tf flex flex-col rounded-lg shadow-lg ${styles.card} max-w-sm relative`}>
        <div className={`flex flex-col rounded-lg shadow-sm mb-2 border p-3 ${styles.header} ${getHeaderStyle(node.jenisPohon)}`}>
          <span className="text-xs text-center font-bold uppercase opacity-80">
            {node.jenisPohon?.replace(/_/g, " ")} - {node.id}
          </span>
        </div>

        <div className="bg-white p-2 rounded-b-lg">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="border p-2 font-semibold text-gray-600 w-24">Tema </td>
                <td className="border p-2">{node.namaPohon}</td>
              </tr>
              {node.indikator.length > 0 ? (
                node.indikator.map((ind: Indikator, idx: number) => (
                  <React.Fragment key={ind.id}>
                    <tr>
                      <td className="border p-2 font-semibold text-gray-600 w-24">Indikator {node.indikator.length > 1 ? idx + 1 : ''}</td>
                      <td className="border p-2"><div className={`${styles.badge} inline-block px-2 py-1 rounded text-[10px]`}>{ind.indikator}</div></td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold text-gray-600">Target/Satuan</td>
                      <td className="border p-2">{ind.targets.map((t) => (<div key={t.id}>{t.nilai}/{t.satuan}</div>))}</td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <>
                  <tr><td className="border p-2 font-semibold text-gray-600">Indikator</td><td className="border p-2 text-gray-400 italic">-</td></tr>
                  <tr><td className="border p-2 font-semibold text-gray-600">Target/Satuan</td><td className="border p-2 text-gray-400 italic">-</td></tr>
                </>
              )}
              <tr>
                <td className="border p-2 font-semibold text-gray-600">Keterangan</td>
                <td className="border p-2 text-gray-700 bg-gray-50">{node.keterangan || "-"}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex-wrap">
            {/* GROUP 1: TOMBOL AKSI ATAS */}
            <div className="flex gap-3 justify-center my-4 hide-on-capture text-xs">
              <button onClick={() => setIsEditModalOpen(true)} className="px-2 py-1 whitespace-nowrap flex justify-center rounded-md items-center bg-white border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors">
                <IconEdit /> Edit
              </button>
              <button onClick={() => { /* cetak */ }} className="px-2 py-1 text-xs whitespace-nowrap flex justify-center items-center bg-gradient-to-r from-[#08C2FF] to-[#006BFF] hover:from-[#0584AD] hover:to-[#014CB2] text-white rounded-md transition-all shadow-sm">
                <IconCetak /> <span className="font-semibold">Cetak</span>
              </button>
              <button onClick={handleDelete} className="px-2 py-1 whitespace-nowrap flex justify-center items-center bg-gradient-to-r border-2 border-[#D63030] hover:bg-[#D63030] text-[#D63030] hover:text-white rounded-md transition-colors">
                <IconDelete /> Hapus
              </button>
            </div>

            {/* GROUP 2: TOMBOL BAWAH (SEJAJAR) */}
            <div className="flex gap-2 justify-center flex-wrap my-4 hide-on-capture text-xs">
              
              {/* TOMBOL TAMPILKAN */}
              {hasChildren && (
                 <button
                   onClick={handleToggleExpand}
                   className={`px-2 py-1 whitespace-nowrap flex justify-center rounded-md items-center bg-white border-2 transition-colors ${
                       isRoot 
                       ? "border-black text-black hover:bg-black hover:text-white"  
                       : "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
                   }`}
                 >
                   {isExpanded ? <TbEyeOff className="mr-1"/> : <TbEye className="mr-1"/>}
                   <span className="font-semibold">{getLabelTampilkan()}</span>
                 </button>
              )}

              {/* TOMBOL TAMBAH CHILD */}
              {childInfo && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className={`px-2 py-1 whitespace-nowrap flex justify-center rounded-md items-center bg-white border-2 transition-colors hover:text-white ${getButtonColor(node.jenisPohon)}`}
                >
                  <IconAdd /> {childInfo.label}
                </button>
              )}

              {/* TOMBOL STRATEGIC PEMDA */}
              {node.levelPohon < 3 && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-2 py-1 whitespace-nowrap flex justify-center rounded-md items-center bg-white border-2 border-[#D20606] text-[#D20606] hover:bg-[#D20606] hover:text-white transition-colors"
                >
                  <IconAdd /> Strategic Pemda
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {childInfo && <ModalAddChild isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { if (onTreeRefresh) onTreeRefresh(); else window.location.reload(); }} parentId={node.id} childInfo={childInfo} tahun={node.tahun} />}
      <ModalEditNode isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={() => { if (onTreeRefresh) onTreeRefresh(); else window.location.reload(); }} node={node} />

      {/* RECURSIVE CHILDREN: Render jika hasChildren & isExpanded TRUE */}
      {/* UPDATE: 'flex justify-center' agar pohon rata tengah */}
      {hasChildren && isExpanded && (
        <ul className="flex justify-center relative">
          {node.children.map((child) => (
            <PohonNode
              key={child.id}
              node={child}
              onTreeRefresh={onTreeRefresh}
              // Jika Root: Teruskan 'rootRecursiveState' agar semua anak ikut terbuka
              // Jika Child: Teruskan 'forceExpand' yang diterima (agar rantai recursive tidak putus saat "Tampilkan Semua")
              forceExpand={isRoot ? rootRecursiveState : forceExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default PohonNode;