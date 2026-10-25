import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SearchField from "@/components/common/SearchField";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ColorSwatch from "@/components/common/ColorSwatch";
import ProductThumb from "@/components/common/ProductThumb";
import { EmptyState, ErrorState } from "@/components/common/States";
import { CATEGORIES, categoryLabel } from "@/components/products/constants";
import { errorMessage } from "@/utils/api/baseApi";
import { useDeleteProductMutation, useGetAllProductsQuery } from "@/utils/api/ProductsApi";
import { formatCurrency, formatNumber, productStock } from "@/utils/format";

const SORTS = {
  newest: { label: "Newest first", fn: () => 0 },
  name: { label: "Name A–Z", fn: (a, b) => a.productName.localeCompare(b.productName) },
  priceLow: { label: "Price: low to high", fn: (a, b) => a.productPrice - b.productPrice },
  priceHigh: { label: "Price: high to low", fn: (a, b) => b.productPrice - a.productPrice },
  stockLow: { label: "Stock: low first", fn: (a, b) => productStock(a) - productStock(b) },
};

function StockChip({ stock }) {
  if (stock === 0) return <Chip size="small" label="Out of stock" color="error" />;
  if (stock <= 5) return <Chip size="small" label={`Only ${stock} left`} color="warning" />;
  return null;
}

function ProductCard({ product, onDelete }) {
  const stock = productStock(product);
  const colors = (product.productVariants || []).map((variant) => variant.color).filter(Boolean);
  const cover = product.productVariants?.[0]?.images?.[0];
  const hasDiscount = product.productOldPrice > product.productPrice;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 200ms ease, transform 200ms ease",
        "&:hover": { boxShadow: "0 12px 28px rgba(16,24,40,0.10)", transform: "translateY(-2px)" },
        "&:hover .cover": { transform: "scale(1.04)" },
      }}
    >
      <CardActionArea component={Link} href={`/products/${product._id}`} sx={{ flexGrow: 1, alignItems: "stretch" }}>
        <Box sx={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", bgcolor: "#F1F2F8" }}>
          {cover ? (
            <Box
              className="cover"
              component="img"
              src={cover}
              alt={product.productName}
              loading="lazy"
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 350ms ease" }}
            />
          ) : (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "text.disabled" }}>
              <CheckroomOutlinedIcon sx={{ fontSize: 48 }} />
            </Box>
          )}
          <Box sx={{ position: "absolute", top: 10, left: 10 }}>
            <StockChip stock={stock} />
          </Box>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {categoryLabel(product.productCategory)} · {product.productType}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.25, lineHeight: 1.35 }} noWrap title={product.productName}>
            {product.productName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
            <Typography fontWeight={700}>{formatCurrency(product.productPrice)}</Typography>
            {hasDiscount && (
              <Typography variant="body2" color="text.disabled" sx={{ textDecoration: "line-through" }}>
                {formatCurrency(product.productOldPrice)}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }}>
            <Stack direction="row" spacing={0.5}>
              {colors.slice(0, 6).map((color, index) => (
                <ColorSwatch key={`${color}-${index}`} color={color} size={14} />
              ))}
              {colors.length > 6 && (
                <Typography variant="caption" color="text.secondary">
                  +{colors.length - 6}
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatNumber(stock)} in stock
            </Typography>
          </Stack>
        </Box>
      </CardActionArea>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
        <Button
          component={Link}
          href={`/products/${product._id}/edit`}
          variant="outlined"
          size="small"
          startIcon={<EditOutlinedIcon />}
          fullWidth
        >
          Edit
        </Button>
        <Tooltip title="Delete product">
          <IconButton size="small" color="error" onClick={() => onDelete(product)} aria-label={`Delete ${product.productName}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}

function ProductRow({ product, onDelete }) {
  const stock = productStock(product);
  return (
    <Card sx={{ "&:hover": { borderColor: "primary.light" }, transition: "border-color 150ms ease" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 1.5, pr: 2 }}>
        <Box component={Link} href={`/products/${product._id}`} sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1, minWidth: 0 }}>
          <ProductThumb src={product.productVariants?.[0]?.images?.[0]} alt={product.productName} size={56} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {product.productName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {categoryLabel(product.productCategory)} · {product.productType} · {product.productBrand}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: { xs: "none", sm: "block" }, width: 110, textAlign: "right" }}>
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(product.productPrice)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatNumber(stock)} in stock
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" }, width: 110 }}>
          <StockChip stock={stock} />
        </Box>
        <Tooltip title="Edit">
          <IconButton component={Link} href={`/products/${product._id}/edit`} size="small" aria-label="Edit">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(product)} aria-label="Delete">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}

export default function Products() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetAllProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toDelete, setToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const view = router.query.view === "list" ? "list" : "grid";
  const category = typeof router.query.category === "string" ? router.query.category : "all";

  const setQuery = (patch) => {
    const query = { ...router.query, ...patch };
    Object.keys(query).forEach((key) => (query[key] === "" || query[key] === "all" || query[key] === "grid") && delete query[key]);
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const products = useMemo(() => data?.products || [], [data]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((product) => category === "all" || String(product.productCategory).toLowerCase() === category)
      .filter(
        (product) =>
          !term ||
          [product.productName, product.productType, product.productBrand, product.productCategory]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
      )
      .sort(SORTS[sort].fn);
  }, [products, search, category, sort]);

  const handleDelete = async () => {
    try {
      await deleteProduct(toDelete._id).unwrap();
      toast.success(`"${toDelete.productName}" deleted`);
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete product"));
    }
  };

  const counts = useMemo(() => {
    const result = { all: products.length };
    products.forEach((product) => {
      const key = String(product.productCategory).toLowerCase();
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  }, [products]);

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={data ? `${formatNumber(products.length)} products in your catalogue` : "Your catalogue"}
        actions={
          <Button component={Link} href="/products/new" variant="contained" startIcon={<AddIcon />}>
            Add product
          </Button>
        }
      />

      <Card sx={{ p: 1.5, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search name, type or brand" delay={150} />
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ flexGrow: 1 }}>
            {[{ value: "all", label: "All" }, ...CATEGORIES].map((option) => (
              <Chip
                key={option.value}
                label={`${option.label}${counts[option.value] ? ` · ${counts[option.value]}` : ""}`}
                color={category === option.value ? "primary" : "default"}
                variant={category === option.value ? "filled" : "outlined"}
                onClick={() => setQuery({ category: option.value })}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField select size="small" value={sort} onChange={(event) => setSort(event.target.value)} sx={{ minWidth: 180 }} inputProps={{ "aria-label": "Sort" }}>
              {Object.entries(SORTS).map(([key, option]) => (
                <MenuItem key={key} value={key}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(event, value) => value && setQuery({ view: value })}
              aria-label="View"
            >
              <ToggleButton value="grid" sx={{ px: 1.5 }}>
                Grid
              </ToggleButton>
              <ToggleButton value="list" sx={{ px: 1.5 }}>
                List
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Card>

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load products" />
        </Card>
      ) : isLoading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 5", height: "auto" }} />
                <Box sx={{ p: 2 }}>
                  <Skeleton width="40%" />
                  <Skeleton width="80%" height={28} />
                  <Skeleton width="30%" />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckroomOutlinedIcon}
            title="No products yet"
            description="Add your first dress with its colours, sizes and photos. It will appear on the storefront right away."
            action={
              <Button component={Link} href="/products/new" variant="contained" startIcon={<AddIcon />}>
                Add your first product
              </Button>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchOffOutlinedIcon}
            title="No matching products"
            description="Try a different search or category."
            action={
              <Button
                onClick={() => {
                  setSearch("");
                  setQuery({ category: "all" });
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : view === "grid" ? (
        <Grid container spacing={2.5}>
          {filtered.map((product) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={product._id}>
              <ProductCard product={product} onDelete={setToDelete} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack spacing={1.25}>
          {filtered.map((product) => (
            <ProductRow key={product._id} product={product} onDelete={setToDelete} />
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this product?"
        description={
          toDelete
            ? `"${toDelete.productName}" will be removed from the store along with its photos and reviews. This can't be undone.`
            : ""
        }
        confirmLabel="Delete product"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
