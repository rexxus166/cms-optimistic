import { useState } from "react";

function App() {
  // State sederhana dulu untuk nampung teks
  const [text, setText] = useState("Tulis artikelmu di sini...");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">

        {/* JUDUL */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          CMS Optimistic Update
        </h1>

        {/* STATUS BAR (Nanti kita bikin dinamis) */}
        <div className="mb-4 flex items-center justify-between h-6 bg-gray-50 px-2 rounded">
          <span className="text-sm text-gray-500 font-medium">Status:</span>
          <span className="text-gray-400 text-sm font-bold">Idle (Siap)</span>
        </div>

        {/* TEXT AREA */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            placeholder="Ketik sesuatu..."
          />
        </div>

        {/* TOMBOL SAVE */}
        <button
          className="mt-4 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 active:scale-95 transition-transform"
        >
          Save Article (Simulasi)
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Tugas Individu: Romi Setiawan
        </p>
      </div>
    </div>
  );
}

export default App;