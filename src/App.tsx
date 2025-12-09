import React, { useState, useRef, useEffect } from "react";
import { mockSaveApi } from "./api";

type SaveStatus = "idle" | "saving" | "success" | "error";

function App() {
  // --- STATE MANAGEMENT ---

  // 1. serverData: Data yang "yakin" sudah aman di server (Point of Truth)
  const [serverData, setServerData] = useState("Tulis artikelmu di sini...");

  // 2. uiData: Apa yang dilihat user sekarang (Bisa jadi belum disimpan)
  const [uiData, setUiData] = useState(serverData);

  // 3. Status indikator
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- REFS (Untuk Logic Race Condition) ---

  // useRef untuk menyimpan timer Debounce (biar bisa dibatalkan)
  const debounceTimer = useRef<number | null>(null);

  // useRef untuk mencatat ID request terakhir (mencegah data lama menimpa data baru)
  const lastRequestId = useRef<number>(0);

  // --- LOGIC UTAMA ---

  // 1. Sinkronisasi awal
  useEffect(() => {
    setUiData(serverData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUiData(e.target.value);
    // Saat ngetik, status kembali ke 'idle' (belum disave)
    if (status !== 'saving') setStatus('idle');
  };

  const handleSave = () => {
    // A. OPTIMISTIC UI:
    // Anggap saja "Saving" ini proses instan di mata user
    setStatus("saving");
    setErrorMessage(null);

    // B. RACE CONDITION 1: DEBOUNCING
    // "Kalau tombol dipencet 5x, cuma yang terakhir yang dihitung"

    // Kalau ada timer sebelumnya yang belum jalan, batalkan!
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Buat ID unik berdasarkan waktu sekarang
    const currentRequestId = Date.now();
    lastRequestId.current = currentRequestId;

    // Mulai timer baru (tunggu 1 detik baru kirim ke API)
    debounceTimer.current = setTimeout(async () => {
      try {
        console.log(`[LOGIC] Mengirim Request ID: ${currentRequestId}`);

        // C. PANGGIL API (Delay 3 detik terjadi di sini)
        await mockSaveApi(uiData);

        // D. RACE CONDITION 2: VERIFIKASI REQUEST
        // Cek: Apakah request ini masih request yang paling baru?
        // Kalau user sudah klik save lagi saat ini loading, ID-nya pasti beda.
        if (lastRequestId.current === currentRequestId) {
          console.log("[LOGIC] Response diterima & valid. Update ServerData.");
          setServerData(uiData); // Update data "aman"
          setStatus("success");

          // Balik ke idle setelah 2 detik biar cantik
          setTimeout(() => setStatus("idle"), 2000);
        } else {
          console.warn("[LOGIC] Response diabaikan karena ada request lebih baru.");
        }

      } catch (error) {
        // E. ROLLBACK MECHANISM
        // Kalau API error, dan ini adalah request terakhir...
        if (lastRequestId.current === currentRequestId) {
          console.error("[LOGIC] Error terjadi, melakukan Rollback.");
          setStatus("error");
          setErrorMessage("Gagal menyimpan! Mengembalikan data lama...");

          // ROLLBACK: Paksa UI kembali ke data server terakhir yang sukses
          setUiData(serverData);
        }
      }
    }, 1000); // Waktu debounce 1000ms (1 detik)
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">

        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          CMS Optimistic Update
        </h1>

        {/* STATUS BAR DINAMIS */}
        <div className={`mb-4 flex items-center justify-between h-8 px-3 rounded transition-colors duration-300
          ${status === 'error' ? 'bg-red-100' : status === 'success' ? 'bg-green-100' : 'bg-gray-50'}
        `}>
          <span className="text-sm text-gray-500 font-medium">Status:</span>

          {status === "idle" && <span className="text-gray-500 text-sm font-bold">Idle (Menunggu)</span>}
          {status === "saving" && <span className="text-blue-600 text-sm font-bold animate-pulse">Saving...</span>}
          {status === "success" && <span className="text-green-600 text-sm font-bold">✅ Saved!</span>}
          {status === "error" && <span className="text-red-600 text-sm font-bold">❌ Error (Rollback)</span>}
        </div>

        {/* TEXT AREA */}
        <div className="relative">
          <textarea
            value={uiData}
            onChange={handleChange}
            // Kalau error, kasih border merah
            className={`w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
              ${status === 'error'
                ? 'border-red-500 focus:ring-red-200 bg-red-50'
                : 'border-gray-300 focus:ring-blue-400'
              }
            `}
          />
        </div>

        {/* PESAN ERROR */}
        {errorMessage && (
          <p className="mt-2 text-xs text-red-600 font-semibold text-center animate-bounce">
            {errorMessage}
          </p>
        )}

        {/* TOMBOL SAVE */}
        <button
          onClick={handleSave}
          disabled={status === 'saving'} // Opsional: disable saat saving kalau mau strict
          className={`mt-4 w-full text-white py-3 rounded-lg font-semibold transition-all
            ${status === 'saving' ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 active:scale-95'}
          `}
        >
          {status === 'saving' ? 'Processing...' : 'Save Article'}
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          *Coba klik "Save" berkali-kali dengan cepat (Spam)* <br />
          *Tunggu error rate 30% muncul untuk lihat Rollback*
        </p>
      </div>
    </div>
  );
}

export default App;