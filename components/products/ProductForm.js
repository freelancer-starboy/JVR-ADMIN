import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/common/RichTextEditor";
import ProductThumb from "@/components/common/ProductThumb";
import VariantEditor from "./VariantEditor";
import { CATEGORIES, MAX_IMAGE_BYTES, TYPES_BY_CATEGORY } from "./constants";
import { formatCurrency, formatNumber } from "@/utils/format";

let keyCounter = 0;
const uid = () => `k${(keyCounter += 1)}`;

const emptySize = (size = "") => ({ key: uid(), size, stock: "" });
const emptyVariant = () => ({ key: uid(), color: "", sizes: [emptySize()], existingImages: [], newImages: [] });

function fromProduct(product) {
  return {
    fields: {
      productName: product.productName || "",
      productBrand: product.productBrand || "",
      productCategory: String(product.productCategory || "").toLowerCase(),
      productType: product.productType || "",
      productPrice: product.productPrice ?? "",
      productOldPrice: product.productOldPrice ? product.productOldPrice : "",
      description: Array.isArray(product.productDetails) ? product.productDetails[0] || "" : product.productDetails || "",
    },
    variants: (product.productVariants?.length ? product.productVariants : [{}]).map((variant) => ({
      key: uid(),
      color: variant.color || "",
      sizes: variant.sizes?.length
        ? variant.sizes.map((size) => ({ key: uid(), size: size.size || "", stock: size.stock ?? "" }))
        : [emptySize()],
      existingImages: variant.images || [],
      newImages: [],
    })),
  };
}

const EMPTY_FIELDS = {
  productName: "",
  productBrand: "",
  productCategory: "",
  productType: "",
  productPrice: "",
  productOldPrice: "",
  description: "",
};

function validate(fields, variants) {
  const errors = { variants: {} };
  if (!fields.productName.trim()) errors.productName = "Give the product a name";
  if (!fields.productBrand.trim()) errors.productBrand = "Enter the brand";
  if (!fields.productCategory) errors.productCategory = "Choose a category";
  if (!String(fields.productType).trim()) errors.productType = "Choose or type a product type";

  const price = Number(fields.productPrice);
  if (fields.productPrice === "" || !Number.isFinite(price) || price <= 0) {
    errors.productPrice = "Enter the selling price";
  }
  if (fields.productOldPrice !== "") {
    const oldPrice = Number(fields.productOldPrice);
    if (!Number.isFinite(oldPrice) || oldPrice < 0) errors.productOldPrice = "Enter a valid MRP";
    else if (oldPrice > 0 && Number.isFinite(price) && oldPrice < price) {
      errors.productOldPrice = "MRP should be higher than the selling price";
    }
  }

  variants.forEach((variant) => {
    const variantErrors = { sizes: {} };
    if (!/^#[0-9A-F]{6}$/i.test(variant.color) && !variant.color.trim()) variantErrors.color = "Pick a colour";
    else if (variant.color.startsWith("#") && !/^#[0-9A-F]{6}$/i.test(variant.color)) {
      variantErrors.color = "Use a 6-digit hex code";
    }

    const seen = new Set();
    variant.sizes.forEach((size) => {
      const sizeErrors = {};
      const name = size.size.trim().toLowerCase();
      if (!name) sizeErrors.size = "Required";
      else if (seen.has(name)) sizeErrors.size = "Duplicate";
      seen.add(name);
      const stock = Number(size.stock);
      if (size.stock === "" || !Number.isInteger(stock) || stock < 0) sizeErrors.stock = "0 or more";
      if (Object.keys(sizeErrors).length) variantErrors.sizes[size.key] = sizeErrors;
    });

    if (variant.existingImages.length + variant.newImages.length === 0) {
      variantErrors.images = "Add at least one photo of this colour";
    }

    const hasErrors = variantErrors.color || variantErrors.images || Object.keys(variantErrors.sizes).length;
    if (hasErrors) errors.variants[variant.key] = { ...variantErrors, any: true };
  });

  const colours = variants.map((variant) => variant.color.trim().toLowerCase()).filter(Boolean);
  if (new Set(colours).size !== colours.length) errors.form = "Two variants have the same colour - merge them or pick another colour.";

  const valid =
    Object.keys(errors).filter((key) => key !== "variants").length === 0 && Object.keys(errors.variants).length === 0;
  return { errors, valid };
}

/**
 * Shared add / edit product form.
 * `onSubmit(formData, { onProgress })` must return a promise.
 */
export default function ProductForm({ mode = "create", product, onSubmit, cancelHref = "/products" }) {
  const initial = useMemo(() => (product ? fromProduct(product) : null), [product]);
  const [fields, setFields] = useState(initial?.fields || EMPTY_FIELDS);
  const [variants, setVariants] = useState(() => initial?.variants || [emptyVariant()]);
  const [errors, setErrors] = useState({ variants: {} });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dirty, setDirty] = useState(false);
  const previews = useRef(new Set());

  // Load product data once it arrives (edit mode)
  useEffect(() => {
    if (initial) {
      setFields(initial.fields);
      setVariants(initial.variants);
      setDirty(false);
    }
  }, [initial]);

  // Release image previews when leaving the page
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty || saving) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, saving]);

  // Re-validate live after the first submit attempt
  useEffect(() => {
    if (submitted) setErrors(validate(fields, variants).errors);
  }, [fields, variants, submitted]);

  const setField = (name, value) => {
    setDirty(true);
    setFields((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "productCategory" && prev.productCategory !== value) {
        const types = TYPES_BY_CATEGORY[value] || [];
        if (prev.productType && !types.includes(prev.productType)) next.productType = "";
      }
      return next;
    });
  };

  const updateVariant = useCallback((key, updater) => {
    setDirty(true);
    setVariants((prev) => prev.map((variant) => (variant.key === key ? updater(variant) : variant)));
  }, []);

  const addVariant = () => {
    setDirty(true);
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (key) => {
    setDirty(true);
    setVariants((prev) => {
      const target = prev.find((variant) => variant.key === key);
      target?.newImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
        previews.current.delete(image.preview);
      });
      return prev.filter((variant) => variant.key !== key);
    });
  };

  const addImages = (key, files) => {
    const accepted = [];
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.warn(`${file.name} is not an image`);
      } else if (file.size > MAX_IMAGE_BYTES) {
        toast.warn(`${file.name} is larger than 10 MB`);
      } else {
        const preview = URL.createObjectURL(file);
        previews.current.add(preview);
        accepted.push({ id: uid(), file, preview });
      }
    });
    if (accepted.length) updateVariant(key, (variant) => ({ ...variant, newImages: [...variant.newImages, ...accepted] }));
  };

  const removeNewImage = (key, id) => {
    updateVariant(key, (variant) => {
      const image = variant.newImages.find((item) => item.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        previews.current.delete(image.preview);
      }
      return { ...variant, newImages: variant.newImages.filter((item) => item.id !== id) };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    const result = validate(fields, variants);
    setErrors(result.errors);
    if (!result.valid) {
      toast.error(result.errors.form || "Please fix the highlighted fields");
      setTimeout(() => {
        document.querySelector(".Mui-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    const formData = new FormData();
    formData.append("productName", fields.productName.trim());
    formData.append("productBrand", fields.productBrand.trim());
    formData.append("productCategory", fields.productCategory);
    formData.append("productType", String(fields.productType).trim());
    formData.append("productPrice", String(fields.productPrice));
    formData.append("productOldPrice", fields.productOldPrice === "" ? "0" : String(fields.productOldPrice));
    formData.append("productDetails", JSON.stringify([fields.description || ""]));
    formData.append(
      "productVariants",
      JSON.stringify(
        variants.map((variant) => ({
          color: variant.color.trim(),
          sizes: variant.sizes.map((size) => ({ size: size.size.trim(), stock: Number(size.stock) || 0 })),
          existingImages: variant.existingImages,
        }))
      )
    );
    variants.forEach((variant, index) => {
      variant.newImages.forEach((image) => formData.append(`variantImages_${index}`, image.file));
    });

    setSaving(true);
    setProgress(0);
    try {
      await onSubmit(formData, { onProgress: setProgress });
      setDirty(false);
    } catch (error) {
      toast.error(error.message || "Could not save the product");
    } finally {
      setSaving(false);
    }
  };

  const types = TYPES_BY_CATEGORY[fields.productCategory] || [...new Set(Object.values(TYPES_BY_CATEGORY).flat())];
  const price = Number(fields.productPrice) || 0;
  const oldPrice = Number(fields.productOldPrice) || 0;
  const discount = oldPrice > price && price > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const totalStock = variants.reduce(
    (sum, variant) => sum + variant.sizes.reduce((acc, size) => acc + (Number(size.stock) || 0), 0),
    0
  );
  const totalImages = variants.reduce((sum, variant) => sum + variant.existingImages.length + variant.newImages.length, 0);
  const coverImage = variants[0]?.existingImages[0] || variants[0]?.newImages[0]?.preview;
  const newImageCount = variants.reduce((sum, variant) => sum + variant.newImages.length, 0);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            <Card>
              <CardHeader title="Basic details" subheader="What customers see on the product page" />
              <CardContent>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      label="Product name"
                      value={fields.productName}
                      onChange={(event) => setField("productName", event.target.value)}
                      error={Boolean(errors.productName)}
                      helperText={errors.productName}
                      placeholder="e.g. Cotton printed kurta"
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Category"
                      value={fields.productCategory}
                      onChange={(event) => setField("productCategory", event.target.value)}
                      error={Boolean(errors.productCategory)}
                      helperText={errors.productCategory}
                      fullWidth
                      required
                    >
                      {CATEGORIES.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      freeSolo
                      options={types}
                      value={fields.productType}
                      inputValue={fields.productType}
                      onInputChange={(event, value) => setField("productType", value)}
                      onChange={(event, value) => setField("productType", value || "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Type"
                          required
                          error={Boolean(errors.productType)}
                          helperText={errors.productType || "Pick one or type a new type"}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Brand"
                      value={fields.productBrand}
                      onChange={(event) => setField("productBrand", event.target.value)}
                      error={Boolean(errors.productBrand)}
                      helperText={errors.productBrand}
                      placeholder="e.g. JVR"
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <RichTextEditor
                      value={fields.description}
                      onChange={(html) => setField("description", html)}
                      placeholder="Fabric, fit, wash care, occasion…"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Colours, sizes & photos"
                subheader="Add one entry per colour, with its sizes, stock and photos"
                action={
                  <Button startIcon={<AddIcon />} onClick={addVariant} sx={{ mt: 1, mr: 1 }}>
                    Add colour
                  </Button>
                }
              />
              <CardContent>
                <Stack spacing={2.5}>
                  {errors.form && <Alert severity="error">{errors.form}</Alert>}
                  {variants.map((variant, index) => (
                    <VariantEditor
                      key={variant.key}
                      variant={variant}
                      index={index}
                      category={fields.productCategory}
                      errors={errors.variants?.[variant.key]}
                      canRemove={variants.length > 1}
                      onChange={(patch) => updateVariant(variant.key, (current) => ({ ...current, ...patch }))}
                      onRemove={() => removeVariant(variant.key)}
                      onAddSize={(size) =>
                        updateVariant(variant.key, (current) => ({ ...current, sizes: [...current.sizes, emptySize(size)] }))
                      }
                      onSizeChange={(sizeKey, patch) =>
                        updateVariant(variant.key, (current) => ({
                          ...current,
                          sizes: current.sizes.map((size) => (size.key === sizeKey ? { ...size, ...patch } : size)),
                        }))
                      }
                      onRemoveSize={(sizeKey) =>
                        updateVariant(variant.key, (current) => ({
                          ...current,
                          sizes: current.sizes.filter((size) => size.key !== sizeKey),
                        }))
                      }
                      onAddImages={(files) => addImages(variant.key, files)}
                      onRemoveExisting={(url) =>
                        updateVariant(variant.key, (current) => ({
                          ...current,
                          existingImages: current.existingImages.filter((item) => item !== url),
                        }))
                      }
                      onRemoveNew={(id) => removeNewImage(variant.key, id)}
                    />
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addVariant}
                    sx={{ alignSelf: "flex-start", borderStyle: "dashed" }}
                  >
                    Add another colour
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Card>
              <CardHeader title="Pricing" />
              <CardContent>
                <Stack spacing={2.5}>
                  <TextField
                    label="Selling price"
                    type="number"
                    value={fields.productPrice}
                    onChange={(event) => setField("productPrice", event.target.value)}
                    onWheel={(event) => event.target.blur()}
                    error={Boolean(errors.productPrice)}
                    helperText={errors.productPrice || "The price customers pay"}
                    required
                    fullWidth
                    inputProps={{ min: 0, step: "any" }}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                  <TextField
                    label="MRP (optional)"
                    type="number"
                    value={fields.productOldPrice}
                    onChange={(event) => setField("productOldPrice", event.target.value)}
                    onWheel={(event) => event.target.blur()}
                    error={Boolean(errors.productOldPrice)}
                    helperText={errors.productOldPrice || "Shown struck-through next to the price"}
                    fullWidth
                    inputProps={{ min: 0, step: "any" }}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                  {discount > 0 && (
                    <Chip color="success" variant="outlined" label={`${discount}% off for customers`} sx={{ alignSelf: "flex-start" }} />
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Summary" />
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ProductThumb src={coverImage} size={72} radius={10} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {fields.productName || "Untitled product"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {price ? formatCurrency(price) : "No price yet"}
                      {discount > 0 && (
                        <Box component="del" sx={{ ml: 1, color: "text.disabled" }}>
                          {formatCurrency(oldPrice)}
                        </Box>
                      )}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  {[
                    ["Colours", variants.length],
                    ["Total stock", `${formatNumber(totalStock)} pcs`],
                    ["Photos", totalImages],
                  ].map(([label, value]) => (
                    <Stack key={label} direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                {saving && (
                  <Box sx={{ mt: 2.5 }}>
                    <LinearProgress
                      variant={progress < 100 ? "determinate" : "indeterminate"}
                      value={progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                      {progress < 100
                        ? `Uploading… ${progress}%`
                        : newImageCount
                        ? "Saving photos to the image library…"
                        : "Saving…"}
                    </Typography>
                  </Box>
                )}

                <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  >
                    {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Publish product"}
                  </Button>
                  <Button component={Link} href={cancelHref} color="inherit" disabled={saving}>
                    Cancel
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
