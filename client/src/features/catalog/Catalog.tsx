import { useState, useEffect, type ChangeEvent } from "react";
import { Product } from "../../app/models/product";
import ProductList from "./ProductList";
import agent from "../../app/api/agent";
import Spinner from "../../app/layout/Spinner";
import { Box, Button, Chip, FormControl, FormControlLabel, FormLabel, Grid, Pagination, Paper, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material";
import { Brand } from "../../app/models/brand";
import { Type } from "../../app/models/type";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShuffleOutlined } from "@mui/icons-material";


const sortOptions =[
  {value: "asc", label:"Ascending"},
  {value: "desc", label:"Descending"}
];

function parsePageParam(pageParam: string | null) {
  const page = Number(pageParam ?? "1");
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default function Catalog(){
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") === "desc" ? "desc" : "asc");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") ?? "All");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") ?? "All");
  const [selectedBrandId, setSelectedBrandId] = useState(0);
  const [selectedTypeId, setSelectedTypeId] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [appliedSearch, setAppliedSearch] = useState(searchParams.get("search") ?? "");
  const [totalItems, setTotaItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(parsePageParam(searchParams.get("page")));
  const [metadataReady, setMetadataReady] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const nextSort = searchParams.get("sort") === "desc" ? "desc" : "asc";
    const nextBrand = searchParams.get("brand") ?? "All";
    const nextType = searchParams.get("type") ?? "All";
    const nextSearch = searchParams.get("search") ?? "";
    const nextPage = parsePageParam(searchParams.get("page"));

    setSelectedSort(nextSort);
    setSelectedBrand(nextBrand);
    setSelectedType(nextType);
    setSearchTerm(nextSearch);
    setAppliedSearch(nextSearch);
    setCurrentPage(nextPage);
  }, [searchParams]);

  useEffect(() => {
    Promise.all([agent.Store.brands(), agent.Store.types()])
      .then(([brandsResp, typesResp]) => {
        setBrands(brandsResp);
        setTypes(typesResp);
        setMetadataReady(true);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!metadataReady) {
      return;
    }

    const brand = brands.find((item) => item.name === selectedBrand);
    const type = types.find((item) => item.name === selectedType);
    setSelectedBrandId(brand?.id ?? 0);
    setSelectedTypeId(type?.id ?? 0);
  }, [brands, metadataReady, selectedBrand, selectedType, types]);

  useEffect(() => {
    if (!metadataReady) {
      return;
    }

    setLoading(true);
    let requestUrl = `products?page=${currentPage - 1}&size=${pageSize}&sort=name&order=${selectedSort}`;

    if (selectedBrandId > 0) {
      requestUrl += `&brandId=${selectedBrandId}`;
    }

    if (selectedTypeId > 0) {
      requestUrl += `&typeId=${selectedTypeId}`;
    }

    if (appliedSearch.trim()) {
      requestUrl += `&keyword=${encodeURIComponent(appliedSearch.trim())}`;
    }

    agent.Store.list(currentPage, pageSize, undefined, undefined, requestUrl)
      .then((productsRes) => {
        setProducts(productsRes.content);
        setTotaItems(productsRes.totalElements);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [appliedSearch, currentPage, metadataReady, pageSize, selectedBrandId, selectedSort, selectedTypeId]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (selectedBrand !== "All") {
      nextParams.set("brand", selectedBrand);
    }

    if (selectedType !== "All") {
      nextParams.set("type", selectedType);
    }

    if (selectedSort !== "asc") {
      nextParams.set("sort", selectedSort);
    }

    if (appliedSearch.trim()) {
      nextParams.set("search", appliedSearch.trim());
    }

    if (currentPage !== 1) {
      nextParams.set("page", currentPage.toString());
    }

    setSearchParams(nextParams, { replace: true });
  }, [appliedSearch, currentPage, selectedBrand, selectedSort, selectedType, setSearchParams]);
  
  const handleSortChange = (event: ChangeEvent<HTMLInputElement>) =>{
    setSelectedSort(event.target.value);
    setCurrentPage(1);
  };

  const handleBrandChange = (event: ChangeEvent<HTMLInputElement>) =>{
    setSelectedBrand(event.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) =>{
    setSelectedType(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event: ChangeEvent<unknown>, page: number) =>{
    void event;
    setCurrentPage(page);
  };

  const applySearch = () => {
    setAppliedSearch(searchTerm.trim());
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedSort("asc");
    setSelectedBrand("All");
    setSelectedType("All");
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const applyQuickPreset = (preset: {
    brand?: string;
    type?: string;
    search?: string;
    sort?: string;
  }) => {
    setSelectedBrand(preset.brand ?? "All");
    setSelectedType(preset.type ?? "All");
    setSelectedSort(preset.sort === "desc" ? "desc" : "asc");
    setSearchTerm(preset.search ?? "");
    setAppliedSearch((preset.search ?? "").trim());
    setCurrentPage(1);
  };

  const quickPresets = [
    { label: "All gear", onClick: () => clearFilters() },
    { label: "Football", onClick: () => applyQuickPreset({ type: "Football" }) },
    { label: "Shoes", onClick: () => applyQuickPreset({ type: "Shoes" }) },
    { label: "Rackets", onClick: () => applyQuickPreset({ type: "Rackets" }) },
    { label: "Adidas", onClick: () => applyQuickPreset({ brand: "Adidas" }) },
    { label: "Yonex", onClick: () => applyQuickPreset({ brand: "Yonex" }) }
  ];

  const handleSurpriseMe = () => {
    if (products.length === 0) {
      return;
    }

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    navigate(`/store/${randomProduct.id}`);
  };

  const activeFilters = [
    appliedSearch ? `Search: ${appliedSearch}` : null,
    selectedBrand !== "All" ? `Brand: ${selectedBrand}` : null,
    selectedType !== "All" ? `Type: ${selectedType}` : null,
    selectedSort === "desc" ? "Sort: Descending" : null
  ].filter((filter): filter is string => Boolean(filter));

  if(!products) return <h3>Unable to load Products</h3>
  if(loading) return <Spinner message='Loading Products...'/>
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 5 }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Storefront
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Explore the catalog with quick search, shareable filters, and fast preset actions.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSurpriseMe}
                disabled={products.length === 0}
                startIcon={<ShuffleOutlined />}
                sx={{ alignSelf: "flex-start" }}
              >
                Surprise me
              </Button>
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField 
                label="Search products" 
                variant="outlined" 
                fullWidth 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applySearch();
                  }
                }}
              />
              <Button variant="contained" color="secondary" onClick={applySearch}>
                Search
              </Button>
              <Button variant="outlined" onClick={clearFilters}>
                Clear all
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {quickPresets.map((preset) => (
                <Chip
                  key={preset.label}
                  label={preset.label}
                  clickable
                  color="secondary"
                  variant="outlined"
                  onClick={preset.onClick}
                />
              ))}
            </Stack>
            {activeFilters.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {activeFilters.map((filter) => (
                  <Chip key={filter} label={filter} variant="outlined" />
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={3}>
        <Paper sx={{mb:2}}>
          <Box p={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Filter the catalog
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Narrow by brand, type, and sort order.
            </Typography>
          </Box>
        </Paper>
        <Paper sx={{ mb: 2, p: 2, borderRadius: 4 }}>
          <FormControl>
            <FormLabel id="sort-by-name-label">Sort by Name</FormLabel>
            <RadioGroup
              aria-label="sort-by-name"
              name="sort-by-name"
              value={selectedSort}
              onChange={handleSortChange}
            >
              {sortOptions.map(({ value, label }) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
        <Paper sx={{ mb: 2, p: 2, borderRadius: 4 }}>
          <FormControl>
            <FormLabel id="brands-label">Brands</FormLabel>
            <RadioGroup
              aria-label="brands"
              name="brands"
              value={selectedBrand}
              onChange={handleBrandChange}
            >
              {brands.map((brand) => (
                <FormControlLabel
                  key={brand.id}
                  value={brand.name}
                  control={<Radio />}
                  label={brand.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
        <Paper sx={{ mb: 2, p: 2, borderRadius: 4 }}>
          <FormControl>
            <FormLabel id="types-label">Types</FormLabel>
            <RadioGroup
              aria-label="types"
              name="types"
              value={selectedType}
              onChange={handleTypeChange}
            >
              {types.map((type) => (
                <FormControlLabel
                  key={type.id}
                  value={type.name}
                  control={<Radio />}
                  label={type.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8} lg={9}>
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="subtitle1">
              Displaying {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
            </Typography>
            <Pagination
              count={Math.max(1, Math.ceil(totalItems / pageSize))}
              color="primary"
              onChange={handlePageChange}
              page={currentPage}
            />
          </Box>
          {products.length === 0 ? (
            <Paper sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                No products matched your filters
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Try clearing a filter or searching for a different keyword.
              </Typography>
              <Button variant="contained" color="secondary" onClick={clearFilters}>
                Reset catalog view
              </Button>
            </Paper>
          ) : (
            <ProductList products={products}/>
          )}
          <Box mt={1} display="flex" justifyContent="center">
            <Pagination
              count={Math.max(1, Math.ceil(totalItems / pageSize))}
              color="primary"
              onChange={handlePageChange}
              page={currentPage}
            />
          </Box>
        </Stack>
      </Grid>
    </Grid>
  )
}
