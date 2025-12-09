export interface ApiResponse {
    success: boolean;
    message: string;
    data?: string;
}

export const mockSaveApi = (content: string): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        console.log(`[API] Request masuk: "${content}"... menunggu 3 detik`);

        setTimeout(() => {
            // Simulasi Error Rate 30%
            const shouldFail = Math.random() < 0.3;

            if (shouldFail) {
                console.error("[API] Gagal! (Simulasi Error)");
                reject(new Error("Server error: Gagal menyimpan data (Simulasi 30%)"));
            } else {
                console.log("[API] Sukses!");
                resolve({
                    success: true,
                    message: "Data berhasil disimpan!",
                    data: content,
                });
            }
        }, 3000); // Delay 3 detik
    });
};