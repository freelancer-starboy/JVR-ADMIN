import { baseApi } from "./baseApi";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => "Products/getAllProducts",
      providesTags: (result) => [
        { type: "Product", id: "LIST" },
        ...(result?.products || []).map((product) => ({ type: "Product", id: product._id })),
      ],
    }),
    getProductById: builder.query({
      query: (productId) => ({
        url: "Products/getProductsById",
        method: "POST",
        body: { productId },
      }),
      providesTags: (result, error, productId) => [{ type: "Product", id: productId }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `Products/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        "Dashboard",
      ],
    }),
  }),
});

export const { useGetAllProductsQuery, useGetProductByIdQuery, useDeleteProductMutation } = productsApi;
