"use client";
import React, { useEffect, useMemo, useState, Suspense } from "react";
import homepageData from "@/data/homepageData";
import ProductCard from "@/components/ProductCard";
import { useParams, useSearchParams } from "next/navigation";
import { getProductsByCategory } from "@/services/productService";

type CatalogItem = { id: string | number; name: string; brand?: string; price: number | string; image: string };

const keyMap: Record<string, keyof typeof homepageData> = {
  mobiles: "mobiles",
  laptops: "laptops",
  appliances: "appliances",
  clothes: "clothes",
  footwear: "footwear",
  trending: "trending",
};

export default function CategoryProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryProductsContent />
    </Suspense>
  );
}

function CategoryProductsContent() {
  const params = useParams<{ category: string }>();
  const search = useSearchParams();
  const category = (params?.category || "").toString().toLowerCase();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dbProducts, setDbProducts] = useState<CatalogItem[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Remaining predefined data after first 5 (homepage shows 5)
  const predefinedAll: CatalogItem[] = useMemo(() => {
    const key = keyMap[category];
    if (!key) return [];
    const list = (homepageData as any)[key] || [];
    return Array.isArray(list) ? list.slice(5) : [];
  }, [category]);

  useEffect(() => {
    let isMounted = true;
    async function load(pageNum: number) {
      try {
        setLoading(true);
        const res = await getProductsByCategory(category, pageNum, 24);
        if (!isMounted) return;
        if (pageNum === 1) {
          setDbProducts(res.data as any);
        } else {
          setDbProducts((prev) => [...prev, ...(res.data as any)]);
        }
        setHasMore(Boolean(res?.meta?.hasMore));
      } catch (e) {
        console.error("Failed to load category products", e);
        setHasMore(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (category) {
      setDbProducts([]);
      setPage(1);
      setHasMore(true);
      load(1);
    }
    return () => {
      isMounted = false;
    };
  }, [category]);

  const combined = [...predefinedAll, ...dbProducts];

  return (
    <main className="max-w-7xl mx-auto px-6 py-10" data-testid="category-products-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 capitalize">{category} — See All</h1>
      </div>

      {combined.length === 0 && !loading && (
        <p className="text-center text-gray-500">No products found for this category.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {combined.map((p, idx) => (
          <ProductCard key={`${p.id}-${idx}`} product={p as any} isHomepageProduct={typeof p.id === 'string'} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {hasMore ? (
          <button
            disabled={loading}
            onClick={async () => {
              if (!hasMore || loading) return;
              const next = page + 1;
              setPage(next);
              try {
                setLoading(true);
                const res = await getProductsByCategory(category, next, 24);
                console.log('Load More response:', res);
                setDbProducts((prev) => [...prev, ...(res.data as any)]);
                setHasMore(Boolean(res?.meta?.hasMore));
              } finally {
                setLoading(false);
              }
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        ) : (
          <p className="text-sm text-gray-500">No more products.</p>
        )}
      </div>
    </main>
  );
}
