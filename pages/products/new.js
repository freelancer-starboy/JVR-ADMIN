import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import { baseApi } from "@/utils/api/baseApi";
import { sendForm } from "@/utils/upload";

export default function AddProduct() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (formData, { onProgress }) => {
    const data = await sendForm({ url: "/api/Products/addProducts", method: "POST", formData, onProgress });
    dispatch(baseApi.util.invalidateTags([{ type: "Product", id: "LIST" }, "Dashboard"]));
    toast.success("Product published");
    router.push(data.product?._id ? `/products/${data.product._id}` : "/products");
  };

  return (
    <>
      <PageHeader
        title="Add product"
        subtitle="Upload a new dress with its colours, sizes and photos."
        breadcrumbs={[{ label: "Products", href: "/products" }, { label: "Add product" }]}
      />
      <ProductForm mode="create" onSubmit={handleSubmit} />
    </>
  );
}
