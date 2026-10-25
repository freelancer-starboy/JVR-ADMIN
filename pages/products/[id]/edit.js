import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Card, CardContent, Grid, Skeleton, Stack } from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/States";
import ProductForm from "@/components/products/ProductForm";
import { baseApi } from "@/utils/api/baseApi";
import { useGetProductByIdQuery } from "@/utils/api/ProductsApi";
import { sendForm } from "@/utils/upload";

function FormSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Skeleton width="30%" height={28} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={200} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Skeleton variant="rounded" height={220} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default function EditProduct() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const { data, isLoading, error, refetch } = useGetProductByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const product = data?.product;

  const handleSubmit = async (formData, { onProgress }) => {
    formData.append("productId", id);
    await sendForm({ url: "/api/Products/updateProduct", method: "PUT", formData, onProgress });
    dispatch(baseApi.util.invalidateTags([{ type: "Product", id }, { type: "Product", id: "LIST" }, "Dashboard"]));
    toast.success("Changes saved");
    router.push(`/products/${id}`);
  };

  return (
    <>
      <PageHeader
        title={product ? `Edit ${product.productName}` : "Edit product"}
        documentTitle="Edit product"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          ...(product ? [{ label: product.productName, href: `/products/${id}` }] : []),
          { label: "Edit" },
        ]}
      />
      {error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load this product" />
        </Card>
      ) : isLoading || !product ? (
        <FormSkeleton />
      ) : (
        <ProductForm mode="edit" product={product} onSubmit={handleSubmit} cancelHref={`/products/${id}`} />
      )}
    </>
  );
}
