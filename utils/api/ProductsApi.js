import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    addProducts: builder.mutation({
      query: (data) => ({
        url: "Products/addProducts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    getAllProducts: builder.query({
      query: () => "Products/getAllProducts",
      providesTags: ["Product"],
    }),
    getProductById: builder.mutation({
      query: (data) => ({
        url: "Products/getProductsById",
        method: "POST",
        body: data,
      }),
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: "Products/updateProduct",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `Products/delete/${id}`,
        method: "DELETE",
      }),
       invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useAddProductsMutation,
  useGetAllProductsQuery,
  useGetProductByIdMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productsApi;
