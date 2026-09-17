const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://dplosokk.my.id/api";

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

async function request(
    path,
    {
        method = "GET",
        body,
        params,
        signal
    } = {}
) {
    let url = `${BASE_URL}${path}`;

    if (params) {
        const qs = new URLSearchParams(
            Object.entries(params).filter(
                ([, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
            )
        ).toString();

        if (qs) {
            url += `?${qs}`;
        }
    }

    const headers = new Headers();

    const token =
        localStorage.getItem("dplosokk_token") ||
        localStorage.getItem("token");

    if (token) {
        headers.set(
            "Authorization",
            `Bearer ${token}`
        );
    }

    const isFormData =
        body instanceof FormData;

    if (
        !isFormData &&
        body !== undefined
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    const res = await fetch(url, {
        method,
        headers,
        body:
            body === undefined
                ? undefined
                : isFormData
                    ? body
                    : JSON.stringify(body),
        signal
    });

    const text = await res.text();

    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!res.ok) {
        if (res.status === 401) {
            localStorage.removeItem(
                "dplosokk_token"
            );

            localStorage.removeItem(
                "dplosokk_user"
            );

            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        throw new ApiError(
            data?.message ||
                `Permintaan gagal (${res.status})`,
            res.status,
            data
        );
    }

    return {
        data,
        status: res.status
    };
}


/* =========================
   AUTH
========================= */

export const login = (
    uname,
    passwd
) =>
    request("/auth/login", {
        method: "POST",
        body: {
            uname,
            passwd
        }
    });

export const register = (data) =>
    request("/auth/register", {
        method: "POST",
        body: data
    });


/* =========================
   PRODUK
========================= */

export const getProduk = (params) =>
    request("/produk", {
        params
    });

export const getProdukById = (id) =>
    request(`/produk/${id}`);

export const createProduk = (data) =>
    request("/produk", {
        method: "POST",
        body: data
    });

export const updateProduk = (
    id,
    data
) =>
    request(`/produk/${id}`, {
        method: "PUT",
        body: data
    });

export const deleteProduk = (id) =>
    request(`/produk/${id}`, {
        method: "DELETE"
    });


/* =========================
   PEMBELIAN
========================= */

export const getPembelian = (params) =>
    request("/pembelian", {
        params
    });

export const createPembelian = (data) =>
    request("/pembelian", {
        method: "POST",
        body: data
    });

export const updatePembelianStatus = (
    id,
    status
) =>
    request(`/pembelian/${id}`, {
        method: "PUT",
        body: {
            status
        }
    });


/* =========================
   ARTIKEL
========================= */

export const getArtikel = (params) =>
    request("/artikel", {
        params
    });

export const getArtikelById = (id) =>
    request(`/artikel/${id}`);


/* =========================
   EXPORT
========================= */

export { ApiError };

export default {
    login,
    register,

    getProduk,
    getProdukById,
    createProduk,
    updateProduk,
    deleteProduk,

    getPembelian,
    createPembelian,
    updatePembelianStatus,

    getArtikel,
    getArtikelById
};