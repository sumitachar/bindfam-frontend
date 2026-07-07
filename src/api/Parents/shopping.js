// src/api/Parents/shopping.js

import api from "../base";

// 1. MAIN — Search Amazon + Flipkart together (your default & best option)
export const searchProducts = async (query, { signal } = {}) => {
  if (!query?.trim()) return [];
  try {
    const res = await api.get("/shopping/search", {
      params: { q: query },
      signal,
      timeout: 30000,
    });
    return res.data || [];
  } catch (e) {
    if (e.name === "AbortError" || e.name === "CanceledError") {
      return [];
    }
    console.error("searchProducts error:", e);
    return [];
  }
};

// 2. Amazon Only
export const searchAmazonOnly = async (query, { signal } = {}) => {
  if (!query?.trim()) return [];
  try {
    const res = await api.get("/shopping/amazon", {
      params: { q: query },
      signal,
      timeout: 30000,
    });
    return res.data || [];
  } catch (e) {
    if (e.name === "AbortError" || e.name === "CanceledError") return [];
    console.error("searchAmazonOnly error:", e);
    return [];
  }
};

// 3. Flipkart Only
export const searchFlipkartOnly = async (query, { signal } = {}) => {
  if (!query?.trim()) return [];
  try {
    const res = await api.get("/shopping/flipkart", {
      params: { q: query },
      signal,
      timeout: 30000,
    });
    return res.data || [];
  } catch (e) {
    if (e.name === "AbortError" || e.name === "CanceledError") return [];
    console.error("searchFlipkartOnly error:", e);
    return [];
  }
};

// BONUS: One function to rule them all — super convenient!
export const searchWithSource = async (
  query,
  source = "all", // "all" | "amazon" | "flipkart"
  { signal } = {}
) => {
  switch (source) {
    case "amazon":
      return await searchAmazonOnly(query, { signal });
    case "flipkart":
      return await searchFlipkartOnly(query, { signal });
    case "all":
    default:
      return await searchProducts(query, { signal });
  }
};