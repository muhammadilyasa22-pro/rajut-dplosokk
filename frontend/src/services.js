import { API_URL } from "./config";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("dplosokk_token");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = options.body instanceof FormData;

  const requestOptions = {
    ...options,
    headers
  };

  if (!isFormData && options.body !== undefined) {
    headers.set("Content-Type", "application/json");

    // Fetch tidak otomatis mengubah object JavaScript menjadi JSON.
    // Tanpa stringify, backend menerima "[object Object]" dan req.body
    // tidak berisi status/pembayaran yang dipilih dari panel admin.
    if (typeof options.body === "object") {
      requestOptions.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`${API_URL}${path}`, requestOptions);

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : "Permintaan ke server gagal"
    );
  }

  return data;
}
