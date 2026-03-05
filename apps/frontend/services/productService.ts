import api from "../lib/axios";

// Get all products with optional filters
export const getProducts = async (filters: Record<string, any> = {}) => {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
    )
  ).toString();

  const { data } = await api.get(`/products${params ? `?${params}` : ""}`);
  return data?.products || data;
};

// Get single product by ID
export const getProductById = async (id: string | number) => {
  const { data } = await api.get(`/products/${id}`);
  return data?.product || data;
};

// Get products by category — paginated
export const getProductsByCategory = async (
  category: string,
  page = 1,
  limit = 24
) => {
  const { data } = await api.get(
    `/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`
  );

  return {
    data: data?.data || [],
    meta: data?.meta || {
      total: 0,
      page,
      limit,
      hasMore: false,
      category,
    },
  };
};
