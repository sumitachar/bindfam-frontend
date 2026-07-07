// src/pages/Parents/Shopping/ShoppingPage.jsx
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import {
  Search,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Baby,
  Sparkles,
  ExternalLink,
  Star,
  Package,
  AlertCircle,
  Store,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { searchWithSource } from "@/api/Parents/shopping";

const ITEMS_PER_PAGE = 12;

const getAgeRange = (age) => {
  if (age <= 0.25) return "0-3 months";
  if (age <= 0.5) return "3-6 months";
  if (age <= 1) return "6-12 months";
  if (age <= 2) return "1-2 years";
  if (age <= 3) return "2-3 years";
  return "2-3 years";
};

const normalizeName = (str = "") =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 100);

const ShoppingPage = () => {
  const { selectedEntity } = useContext(UserContext);
  const abortControllerRef = useRef(null);

  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    displayedProducts: [],
    searchQuery: "",
    selectedAgeRange: "All Ages",
    selectedPriceRange: "All Prices",
    selectedPriority: "All Priorities",
    currentPage: 1,
    totalPages: 1,
    selectedProduct: null,
    showProductDialog: false,
    isSearching: true,
    hasSearched: false,
    error: null,
    favorites: new Set(
      JSON.parse(localStorage.getItem("baby_favorites") || "[]")
    ),
    selectedStore: "all",
  });

  // Favorites sync
  useEffect(() => {
    const saved = localStorage.getItem("baby_favorites");
    if (saved)
      setState((prev) => ({ ...prev, favorites: new Set(JSON.parse(saved)) }));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "baby_favorites",
      JSON.stringify([...state.favorites])
    );
  }, [state.favorites]);

  const childAgeRange = selectedEntity ? getAgeRange(selectedEntity.age) : "";
  const gender = selectedEntity?.gender === "male" ? "boy" : "girl";

  const performSearch = useCallback(
    async (queryOverride = null) => {
      let query = queryOverride?.trim();
      if (!query) {
        query =
          state.selectedAgeRange === "All Ages"
            ? `${childAgeRange} ${gender} baby essentials clothes toys diapers india`
            : `${state.selectedAgeRange} ${gender} baby essentials clothes toys diapers india`;
      }

      if (!query || !selectedEntity) return;

      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({
        ...prev,
        isSearching: true,
        hasSearched: true,
        error: null,
        products: [],
        currentPage: 1,
      }));

      try {
        const rawProducts = await searchWithSource(query, state.selectedStore, {
          signal: controller.signal,
        });

        const seen = new Map();
        const normalized = (Array.isArray(rawProducts) ? rawProducts : [])
          .filter((item) => item?.name && (item.price || item.sale_price))
          .map((item) => ({
            id: `prod_${Date.now()}_${Math.random()}`,
            name: item.name || "Baby Product",
            description: `Great for ${childAgeRange} ${gender} babies`,
            price: Number(item.sale_price || item.price || 999),
            image_url:
              item.image_url ||
              item.image ||
              "https://via.placeholder.com/300x300.png?text=Baby",
            url: item.url || item.link || "#",
            rating: item.rating || 4.2 + Math.random() * 0.8,
            reviews: item.reviews || Math.floor(Math.random() * 10000),
            platform: item.platform || item.source || "Store",
            priority: Math.random() > 0.4 ? "Essential" : "Recommended",
            ageRange: childAgeRange,
          }))
          .filter((p) => {
            const key = `${normalizeName(p.name)}-${p.price}-${p.platform}`;
            if (seen.has(key)) return false;
            seen.set(key, true);
            return true;
          })
          .sort((a, b) => a.price - b.price);

        setState((prev) => ({
          ...prev,
          products: normalized,
          filteredProducts: normalized,
          isSearching: false,
          error:
            normalized.length === 0
              ? "No products found for this search."
              : null,
        }));

        if (normalized.length > 0) {
          toast.success(`Found ${normalized.length} products!`);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Search failed:", err);
        setState((prev) => ({
          ...prev,
          isSearching: false,
          error: "Search failed. Please try again.",
        }));
        toast.error("Search failed");
      }
    },
    [
      childAgeRange,
      gender,
      state.selectedStore,
      state.selectedAgeRange,
      selectedEntity,
    ]
  );

  // Initial load + filters that trigger full search
  useEffect(() => {
    if (!selectedEntity) return;
    performSearch();
  }, [
    selectedEntity,
    state.selectedAgeRange,
    state.selectedStore,
    performSearch,
  ]);

  // Local filtering only
  useEffect(() => {
    let filtered = [...state.products];

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (state.selectedPriceRange !== "All Prices") {
      filtered = filtered.filter((p) => {
        const price = p.price;
        switch (state.selectedPriceRange) {
          case "Under ₹500":
            return price < 500;
          case "₹500 - ₹1000":
            return price >= 500 && price <= 1000;
          case "₹1000 - ₹2000":
            return price >= 1000 && price <= 2000;
          case "Above ₹2000":
            return price > 2000;
          default:
            return true;
        }
      });
    }

    if (state.selectedPriority !== "All Priorities") {
      filtered = filtered.filter((p) => p.priority === state.selectedPriority);
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;

    setState((prev) => ({
      ...prev,
      filteredProducts: filtered,
      displayedProducts: filtered.slice(start, start + ITEMS_PER_PAGE),
      totalPages,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage,
    }));
  }, [
    state.products,
    state.searchQuery,
    state.selectedPriceRange,
    state.selectedPriority,
    state.currentPage,
  ]);

  const handleProductClick = (product) => {
    setState((prev) => ({
      ...prev,
      selectedProduct: product,
      showProductDialog: true,
    }));
  };

  const toggleFavorite = (id) => {
    setState((prev) => {
      const newSet = new Set(prev.favorites);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      toast.success(
        newSet.has(id) ? "Added to favorites!" : "Removed from favorites"
      );
      return { ...prev, favorites: newSet };
    });
  };

  // NEW: Handle search on Enter or Button click only
  const handleSearch = () => {
    if (state.searchQuery.trim()) {
      performSearch(state.searchQuery.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!selectedEntity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <Baby className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <p className="text-2xl text-gray-600">Please select a child first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl">
          <CardHeader className="text-center py-12">
            <div className="flex justify-center gap-6 mb-6">
              <Baby className="w-16 h-16" />
              <Sparkles className="w-14 h-14 animate-pulse" />
            </div>
            <CardTitle className="text-5xl font-bold">
              Shopping for {selectedEntity.name?.split(" ")[0]}
            </CardTitle>
            <p className="text-2xl mt-3 opacity-90">
              {childAgeRange} old {gender} • {state.products.length} products
            </p>
          </CardHeader>
        </Card>

        {/* Store Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          {["all", "amazon", "flipkart"].map((store) => (
            <Button
              key={store}
              variant={state.selectedStore === store ? "default" : "outline"}
              onClick={() => {
                setState((prev) => ({ ...prev, selectedStore: store }));
                performSearch(state.searchQuery || undefined);
              }}
              className={
                store === "amazon"
                  ? "text-orange-600"
                  : store === "flipkart"
                  ? "text-blue-600"
                  : ""
              }
            >
              <Store className="w-5 h-5 mr-2" />
              {store === "all"
                ? "All Stores"
                : store.charAt(0).toUpperCase() + store.slice(1)}
            </Button>
          ))}
        </div>

        {/* Search Bar with Button */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
          <Input
            placeholder={`Search ${
              state.selectedStore === "all" ? "all stores" : state.selectedStore
            } `}
            value={state.searchQuery}
            onChange={(e) =>
              setState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            onKeyPress={handleKeyPress}
            className="pl-14 pr-16 py-7 text-lg border-2"
            disabled={state.isSearching}
          />
          <Button
            onClick={handleSearch}
            disabled={state.isSearching || !state.searchQuery.trim()}
            className="absolute button-primary right-2 top-1/2 -translate-y-1/2 h-12 px-6 "
          >
            {state.isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-10">
          <Select
            value={state.selectedAgeRange}
            onValueChange={(v) =>
              setState((prev) => ({ ...prev, selectedAgeRange: v }))
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {[
                "All Ages",
                "0-3 months",
                "3-6 months",
                "6-12 months",
                "1-2 years",
                "2-3 years",
              ].map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={state.selectedPriceRange}
            onValueChange={(v) =>
              setState((prev) => ({
                ...prev,
                selectedPriceRange: v,
                currentPage: 1,
              }))
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {[
                "All Prices",
                "Under ₹500",
                "₹500 - ₹1000",
                "₹1000 - ₹2000",
                "Above ₹2000",
              ].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={state.selectedPriority}
            onValueChange={(v) =>
              setState((prev) => ({
                ...prev,
                selectedPriority: v,
                currentPage: 1,
              }))
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="All Priorities">All Priorities</SelectItem>
              <SelectItem value="Essential">Essential</SelectItem>
              <SelectItem value="Recommended">Recommended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {state.isSearching && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-64" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State / Features Coming Soon */}
        {!state.isSearching && state.hasSearched && (state.error || state.displayedProducts.length === 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-200"
          >
            <div className="relative inline-block mb-6">
              <Package className="w-20 h-20 mx-auto text-purple-300" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-purple-900 mb-2">
              Features Coming Soon!
            </h3>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We are currently expanding our {state.selectedStore !== 'all' ? state.selectedStore : 'curated'} collection for <b>{selectedEntity.name}</b>. 
              Check back shortly for personalized recommendations and exclusive deals!
            </p>
            <Button 
              variant="outline" 
              className="mt-8 border-purple-400 text-purple-600 hover:bg-purple-50"
              onClick={() => performSearch("baby essentials india")}
            >
              Try General Search
            </Button>
          </motion.div>
        )}

        {/* Products */}
        {!state.isSearching && state.displayedProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
              {state.displayedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Product Image */}
                    <div className="relative group">
                      <img
                        src={
                          product.image_url ||
                          "https://via.placeholder.com/300x300.png?text=Product"
                        }
                        alt={product.name}
                        className="w-full h-56 sm:h-64 md:h-56 lg:h-64 xl:h-60 object-cover bg-gray-50"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/300x300.png?text=Product";
                        }}
                      />
                      <Badge
                        className={`absolute top-2 left-2 px-2 py-1 text-xs ${
                          product.priority === "Essential"
                            ? "bg-red-600"
                            : "bg-orange-500"
                        }`}
                      >
                        {product.priority}
                      </Badge>
                      <Badge className="absolute top-2 right-2 px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">
                        ₹{product.price.toLocaleString()}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-10 right-2 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            state.favorites.has(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-700"
                          }`}
                        />
                      </Button>
                    </div>

                    {/* Product Info */}
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm sm:text-base md:text-base line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                        {product.rating && (
                          <>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>
                              {product.rating.toFixed(1)} (
                              {product.reviews?.toLocaleString() || 0} reviews)
                            </span>
                          </>
                        )}
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px] sm:text-xs"
                        >
                          {product.platform}
                        </Badge>
                      </div>

                      <div className="mt-auto pt-3">
                        <Button
                          className="w-full text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 sm:py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(product.url, "_blank");
                          }}
                        >
                          <Package className="w-4 h-4 mr-1 inline" /> Buy Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 mb-8">
                <Button
                  variant="outline"
                  disabled={state.currentPage === 1}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                <span className="text-sm sm:text-base font-medium">
                  Page {state.currentPage} of {state.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={state.currentPage === state.totalPages}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Product Dialog */}
        <Dialog
          open={state.showProductDialog}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showProductDialog: open }))
          }
        >
          <DialogContent className=" max-h-[90vh] overflow-y-auto">
            {state.selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl pr-10">
                    {state.selectedProduct.name}
                  </DialogTitle>
                  <DialogDescription className="text-lg">
                    {state.selectedProduct.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <img
                    src={state.selectedProduct.image_url}
                    alt={state.selectedProduct.name}
                    className="w-full rounded-xl shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/500x500.png?text=Product";
                    }}
                  />
                  <div className="flex flex-col justify-center space-y-6">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl">
                      <p className="text-5xl font-bold text-purple-800 mb-6">
                        ₹{state.selectedProduct.price.toLocaleString()}
                      </p>
                      <Button
                        className="w-full text-lg py-7 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        size="lg"
                        onClick={() =>
                          window.open(state.selectedProduct.url, "_blank")
                        }
                      >
                        Buy Now on {state.selectedProduct.platform}
                      </Button>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <Badge variant="secondary" className="px-4 py-2">
                        {state.selectedProduct.priority}
                      </Badge>
                      <Badge variant="secondary" className="px-4 py-2">
                        {state.selectedProduct.ageRange}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ShoppingPage;