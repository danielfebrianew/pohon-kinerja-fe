"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/app/lib/axios';
import { PohonKinerja, Indikator } from "@/app/pohon-kinerja/types";

interface ModalEditNodeProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    node: PohonKinerja;
}

interface TargetState {
    id?: number;
    nilai: string | number;
    satuan: string;
}

interface IndikatorState {
    id?: number;
    indikator: string;
    keterangan: string;
    targets: TargetState[];
}

export const ModalEditNode: React.FC<ModalEditNodeProps> = ({ isOpen, onClose, onSuccess, node }) => {
    const [namaPohon, setNamaPohon] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [indikators, setIndikators] = useState<IndikatorState[]>([]);

    // --- EFFECT: ISI FORM SAAT MODAL DIBUKA ---
    useEffect(() => {
        if (isOpen && node) {
            // FIX 1: Gunakan || "" agar tidak pernah null
            setNamaPohon(node.namaPohon || "");
            setKeterangan(node.keterangan || "");

            if (node.indikator && node.indikator.length > 0) {
                const mappedIndikators = node.indikator.map((ind: Indikator) => ({
                    id: ind.id,
                    // FIX 2: Pastikan properti indikator tidak null
                    indikator: ind.indikator || "",
                    keterangan: ind.keterangan || "",
                    targets: ind.targets.map((t) => ({
                        id: t.id,
                        // FIX 3: Pastikan nilai & satuan tidak null
                        nilai: t.nilai !== null && t.nilai !== undefined ? t.nilai : "",
                        satuan: t.satuan || ""
                    }))
                }));
                setIndikators(mappedIndikators);
            } else {
                setIndikators([{ indikator: "", keterangan: "", targets: [{ nilai: "", satuan: "" }] }]);
            }
        }
    }, [isOpen, node]);

    if (!isOpen) return null;

    const addIndikator = () => {
        setIndikators([...indikators, { indikator: "", keterangan: "", targets: [{ nilai: "", satuan: "" }] }]);
    };

    const removeIndikator = (index: number) => {
        const newIndikators = [...indikators];
        newIndikators.splice(index, 1);
        setIndikators(newIndikators);
    };

    const handleIndikatorChange = (index: number, field: keyof IndikatorState, value: string) => {
        const newIndikators = [...indikators];
        // @ts-ignore
        newIndikators[index][field] = value;
        setIndikators(newIndikators);
    };

    const addTarget = (indikatorIndex: number) => {
        const newIndikators = [...indikators];
        newIndikators[indikatorIndex].targets.push({ nilai: "", satuan: "" });
        setIndikators(newIndikators);
    };

    const removeTarget = (indikatorIndex: number, targetIndex: number) => {
        const newIndikators = [...indikators];
        newIndikators[indikatorIndex].targets.splice(targetIndex, 1);
        setIndikators(newIndikators);
    };

    const handleTargetChange = (indikatorIndex: number, targetIndex: number, field: keyof TargetState, value: string | number) => {
        const newIndikators = [...indikators];
        // @ts-ignore
        newIndikators[indikatorIndex].targets[targetIndex][field] = value;
        setIndikators(newIndikators);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Format Indikator & Target sesuai Swagger
            const formattedIndikators = indikators.map(ind => ({
                id: ind.id || 0, // ID indikator (Wajib ada, 0 jika baru)
                indikator: ind.indikator,
                keterangan: ind.keterangan,
                tahun: Number(node.tahun),
                targets: ind.targets.map(tgt => ({
                    id: tgt.id || 0, // ID target (Wajib ada, 0 jika baru)
                    nilai: Number(tgt.nilai) || 0, // Pastikan jadi angka
                    satuan: tgt.satuan,
                    tahun: Number(node.tahun)
                }))
            }));

            // 2. Susun Payload (SESUAI SWAGGER)
            // HAPUS 'id' dari root object ini!
            const payload = {
                // id: node.id,  <-- INI PENYEBAB ERRORNYA, JANGAN DIKIRIM DI BODY
                parentId: Number(node.parentId) || 0,
                namaPohon: namaPohon,
                keterangan: keterangan,
                tahun: Number(node.tahun),
                jenisPohon: node.jenisPohon,
                levelPohon: Number(node.levelPohon),
                // Swagger minta string, jadi kirim string kosong "" lebih aman daripada null
                kodeOpd: (node as any).kodeOpd || "",
                kodePemda: (node as any).kodePemda || "",
                status: node.status || "DRAFT",
                indikators: formattedIndikators
            };

            console.log("Payload Final:", JSON.stringify(payload, null, 2)); // Cek console untuk debug

            // 3. Kirim Request (ID ada di URL)
            const response = await apiClient.put(`/pohon-kinerja/${node.id}`, payload);

            if (response.data.success || response.status === 200) {
                alert("Berhasil mengupdate data!");
                onSuccess();
                onClose();
            }

        } catch (error: any) {
            console.error("Gagal update pohon:", error);
            
            let pesanError = "Gagal menyimpan perubahan.";
            if (error.response?.data?.message) {
                pesanError = error.response.data.message;
            } else if (typeof error.response?.data === 'string') {
                pesanError = error.response.data;
            }
            
            alert("Error Server: " + pesanError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b bg-blue-50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-gray-800">Edit {node.jenisPohon?.replace(/_/g, " ")}</h3>
                    <p className="text-sm text-gray-500">Tahun: {node.tahun}</p>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="form-edit-pohon" onSubmit={handleSubmit} className="space-y-6">
                        {/* BAGIAN 1: INFO POHON */}
                        <div className="space-y-4 border-b pb-6">
                            <h4 className="font-semibold text-gray-700">A. Informasi Pohon Kinerja</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pohon / Kinerja</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    // FIX 4: Safety check di level JSX
                                    value={namaPohon ?? ""}
                                    onChange={(e) => setNamaPohon(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={2}
                                    // FIX 5: Safety check di level JSX
                                    value={keterangan ?? ""}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* BAGIAN 2: INDIKATOR */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-gray-700">B. Indikator & Target</h4>
                                <button
                                    type="button"
                                    onClick={addIndikator}
                                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 font-medium"
                                >
                                    + Tambah Indikator
                                </button>
                            </div>

                            {indikators.map((ind, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                                    {indikators.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeIndikator(idx)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                                        >
                                            &times;
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Indikator</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                // FIX 6: Safety check di level JSX
                                                value={ind.indikator ?? ""}
                                                onChange={(e) => handleIndikatorChange(idx, 'indikator', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Penjelasan</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                                // FIX 7: Safety check di level JSX
                                                value={ind.keterangan ?? ""}
                                                onChange={(e) => handleIndikatorChange(idx, 'keterangan', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* TARGETS */}
                                    <div className="bg-white p-3 rounded border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-500">Target</label>
                                            <button type="button" onClick={() => addTarget(idx)} className="text-[10px] text-blue-600 hover:underline">
                                                + Tambah Target
                                            </button>
                                        </div>
                                        {ind.targets.map((tgt, tIdx) => (
                                            <div key={tIdx} className="flex gap-2 items-center mb-2">
                                                <input
                                                    type="number"
                                                    required
                                                    placeholder="Nilai"
                                                    className="w-1/3 border border-gray-300 rounded p-1.5 text-sm"
                                                    // FIX 8: Safety check di level JSX
                                                    value={tgt.nilai ?? ""}
                                                    onChange={(e) => handleTargetChange(idx, tIdx, 'nilai', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Satuan"
                                                    className="w-1/2 border border-gray-300 rounded p-1.5 text-sm"
                                                    // FIX 9: Safety check di level JSX
                                                    value={tgt.satuan ?? ""}
                                                    onChange={(e) => handleTargetChange(idx, tIdx, 'satuan', e.target.value)}
                                                />
                                                {ind.targets.length > 1 && (
                                                    <button type="button" onClick={() => removeTarget(idx, tIdx)} className="text-red-500 font-bold px-2">
                                                        &times;
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Batal</button>
                    <button
                        type="submit"
                        form="form-edit-pohon"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
};