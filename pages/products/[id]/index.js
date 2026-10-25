import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Rating,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ColorSwatch from "@/components/common/ColorSwatch";
import ProductThumb from "@/components/common/ProductThumb";
import { EmptyState, ErrorState } from "@/components/common/States";
import { categoryLabel } from "@/components/products/constants";
import { errorMessage } from "@/utils/api/baseApi";
import { useDeleteProductMutation, useGetProductByIdQuery } from "@/utils/api/ProductsApi";
import { formatCurrency, formatDate, formatNumber, initials, productStock } from "@/utils/format";

function Gallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => setActive(0), [images]);

  const current = images[active];
  return (
    <>
      <Box
        onClick={() => current && setZoom(true)}
        sx={{
          aspectRatio: "4 / 5",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#F1F2F8",
          cursor: current ? "zoom-in" : "default",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {current ? (
          <Box component="img" src={current} alt={name} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "text.disabled" }}>
            <Typography variant="body2">No photos for this colour</Typography>
          </Box>
        )}
      </Box>
      {images.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, overflowX: "auto", pb: 0.5 }}>
          {images.map((image, index) => (
            <Box
              key={image}
              component="button"
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              sx={{
                p: 0,
                border: "2px solid",
                borderColor: index === active ? "primary.main" : "transparent",
                borderRadius: 2,
                bgcolor: "transparent",
                cursor: "pointer",
                flexShrink: 0,
                lineHeight: 0,
              }}
            >
              <ProductThumb src={image} size={64} radius={6} />
            </Box>
          ))}
        </Stack>
      )}
      <Dialog open={zoom} onClose={() => setZoom(false)} maxWidth="md" PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" } }}>
        <IconButton
          onClick={() => setZoom(false)}
          aria-label="Close"
          sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "#fff" } }}
        >
          <CloseIcon />
        </IconButton>
        {current && <Box component="img" src={current} alt={name} sx={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 2, display: "block" }} />}
      </Dialog>
    </>
  );
}

function DetailsSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Skeleton variant="rounded" sx={{ aspectRatio: "4 / 5", height: "auto" }} />
      </Grid>
      <Grid item xs={12} md={7}>
        <Skeleton width="30%" />
        <Skeleton width="70%" height={44} />
        <Skeleton width="25%" height={36} />
        <Skeleton variant="rounded" height={180} sx={{ mt: 2 }} />
      </Grid>
    </Grid>
  );
}

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, error, refetch } = useGetProductByIdQuery(id, { skip: !id });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [variantIndex, setVariantIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const product = data?.product;
  const reviews = data?.reviews || [];
  const variants = product?.productVariants || [];
  const variant = variants[variantIndex] || variants[0];
  const stock = productStock(product);
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length : 0;
  const description = product?.productDetails?.[0] || "";

  const handleDelete = async () => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted");
      router.replace("/products");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete product"));
    }
  };

  return (
    <>
      <PageHeader
        title={product?.productName || "Product"}
        documentTitle={product?.productName || "Product"}
        breadcrumbs={[{ label: "Products", href: "/products" }, { label: product?.productName || "Details" }]}
        actions={
          product && (
            <>
              <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setConfirmOpen(true)}>
                Delete
              </Button>
              <Button component={Link} href={`/products/${id}/edit`} variant="contained" startIcon={<EditOutlinedIcon />}>
                Edit product
              </Button>
            </>
          )
        }
      />

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load this product" />
        </Card>
      ) : isLoading || !product ? (
        <DetailsSkeleton />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
            <Gallery images={variant?.images || []} name={product.productName} />
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                    <Chip size="small" label={categoryLabel(product.productCategory)} />
                    <Chip size="small" label={product.productType} variant="outlined" />
                    <Chip size="small" label={product.productBrand} variant="outlined" />
                    {stock === 0 ? (
                      <Chip size="small" color="error" label="Out of stock" />
                    ) : (
                      <Chip size="small" color="success" variant="outlined" label={`${formatNumber(stock)} in stock`} />
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="baseline">
                    <Typography variant="h4">{formatCurrency(product.productPrice)}</Typography>
                    {product.productOldPrice > product.productPrice && (
                      <>
                        <Typography color="text.disabled" sx={{ textDecoration: "line-through" }}>
                          {formatCurrency(product.productOldPrice)}
                        </Typography>
                        <Chip
                          size="small"
                          color="success"
                          label={`${Math.round(
                            ((product.productOldPrice - product.productPrice) / product.productOldPrice) * 100
                          )}% off`}
                        />
                      </>
                    )}
                  </Stack>

                  {reviews.length > 0 && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Rating value={averageRating} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {averageRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                      </Typography>
                    </Stack>
                  )}

                  <Divider sx={{ my: 2.5 }} />

                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Colours
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {variants.map((item, index) => (
                      <Chip
                        key={`${item.color}-${index}`}
                        icon={<ColorSwatch color={item.color} size={14} />}
                        label={item.color}
                        variant={index === variantIndex ? "filled" : "outlined"}
                        color={index === variantIndex ? "primary" : "default"}
                        onClick={() => setVariantIndex(index)}
                        sx={{ pl: 0.5, textTransform: "uppercase" }}
                      />
                    ))}
                  </Stack>

                  <TableContainer sx={{ mt: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Size</TableCell>
                          <TableCell align="right">Stock</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(variant?.sizes || []).map((size) => (
                          <TableRow key={size._id || size.size}>
                            <TableCell>{size.size}</TableCell>
                            <TableCell align="right">
                              {size.stock > 0 ? (
                                <Typography variant="body2" fontWeight={600} color={size.stock <= 3 ? "warning.main" : "text.primary"}>
                                  {size.stock}
                                </Typography>
                              ) : (
                                <Chip size="small" label="Sold out" color="error" variant="outlined" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Description" />
                <CardContent sx={{ pt: 1 }}>
                  {description.replace(/<[^>]*>/g, "").trim() ? (
                    // Admin-authored HTML from the product editor
                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <Typography color="text.secondary">No description yet.</Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader title={`Customer reviews (${reviews.length})`} />
                <CardContent sx={{ pt: 1 }}>
                  {reviews.length === 0 ? (
                    <EmptyState compact icon={RateReviewOutlinedIcon} title="No reviews yet" description="Reviews written on the storefront will show up here." />
                  ) : (
                    <Stack divider={<Divider flexItem />} spacing={2}>
                      {reviews.map((review) => (
                        <Box key={review._id}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 34, height: 34, fontSize: 13 }}>{initials(review.user)}</Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2">{review.user || "Customer"}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(review.createdAt)}
                              </Typography>
                            </Box>
                            <Rating value={review.rating || 0} readOnly size="small" />
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                            {review.comment}
                          </Typography>
                          {review.imageUrls?.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: "wrap" }} useFlexGap>
                              {review.imageUrls.map((url) => (
                                <a key={url} href={url} target="_blank" rel="noreferrer">
                                  <ProductThumb src={url} size={72} />
                                </a>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this product?"
        description="It will be removed from the store along with its photos and reviews. This can't be undone."
        confirmLabel="Delete product"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
