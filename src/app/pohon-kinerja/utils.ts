// app/pohon-kinerja/utils.ts

// ================================
// 1. STYLE POHON BERDASARKAN LEVEL
// ================================
export const getPohonStyle = (level: number) => {
  switch (level) {
    case 0: // TEMATIK
      return {
        card: "border-black shadow-slate-500",
        header: "border-black text-black bg-white",
        badge: "bg-gray-800 text-white"
      };

    case 1: // SUB_TEMATIK
      return {
        card: "border-gray-600 shadow-slate-500",
        header: "border-gray-600 text-black bg-gray-100",
        badge: "bg-gray-600 text-white"
      };

    case 2: // SUB_SUB_TEMATIK
      return {
        card: "border-gray-500 shadow-slate-500",
        header: "border-gray-500 text-black bg-gray-50",
        badge: "bg-gray-500 text-white"
      };

    case 3: // SUPER_SUB_TEMATIK
      return {
        card: "border-gray-500 shadow-slate-500",
        header: "border-gray-500 text-black bg-gray-50",
        badge: "bg-gray-500 text-white"
      };

    case 4: // STRATEGIC_PEMDA
      return {
        card: "border-red-500 bg-red-50 shadow-red-200",
        header: "border-red-500 text-white bg-gradient-to-r from-[#CA3636] to-[#BD04A1]",
        badge: "bg-red-600 text-white"
      };

    case 5: // TACTICAL_PEMDA
      return {
        card: "border-blue-500 bg-blue-50 shadow-blue-200",
        header: "border-blue-500 text-white bg-gradient-to-r from-[#3673CA] to-[#08D2FB]",
        badge: "bg-blue-600 text-white"
      };

    case 6: // OPERATIONAL_PEMDA
      return {
        card: "border-green-500 bg-green-50 shadow-green-200",
        header: "border-green-500 text-white bg-gradient-to-r from-[#007982] to-[#2DCB06]",
        badge: "bg-green-600 text-white"
      };

    default:
      return {
        card: "border-gray-300",
        header: "border-gray-300 bg-gray-100",
        badge: "bg-gray-400"
      };
  }
};

// ===================================
// 2. LOGIC ANAK POHON (NEXT LEVEL)
// ===================================
export const getChildInfo = (level: number) => {
  switch (level) {
    case 0: // TEMATIK -> SUB_TEMATIK
      return {
        nextLevel: 1,
        nextJenis: "SUB_TEMATIK",
        label: "Sub Tematik"
      };

    case 1: // SUB_TEMATIK -> SUB_SUB_TEMATIK
      return {
        nextLevel: 2,
        nextJenis: "SUB_SUB_TEMATIK",
        label: "Sub Sub Tematik"
      };

    case 2: // SUB_SUB_TEMATIK -> SUPER_SUB_TEMATIK
      return {
        nextLevel: 3,
        nextJenis: "SUPER_SUB_TEMATIK",
        label: "Super Sub Tematik"
      };

    case 3: // SUPER_SUB_TEMATIK -> STRATEGIC_PEMDA
      return {
        nextLevel: 4,
        nextJenis: "STRATEGIC_PEMDA",
        label: "Strategic Pemda"
      };

    case 4: // STRATEGIC_PEMDA -> TACTICAL_PEMDA
      return {
        nextLevel: 5,
        nextJenis: "TACTICAL_PEMDA",
        label: "Tactical Pemda"
      };

    case 5: // TACTICAL_PEMDA -> OPERATIONAL_PEMDA
      return {
        nextLevel: 6,
        nextJenis: "OPERATIONAL_PEMDA",
        label: "Operational Pemda"
      };

    default:
      return null; // OPERATIONAL_PEMDA (6) tidak punya anak
  }
};
