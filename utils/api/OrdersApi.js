import { baseApi } from "./baseApi";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ page = 1, limit = 10, status = "", searchQuery = "" } = {}) => ({
        url: "Orders/getAllOrders",
        params: { page, limit, status, searchQuery },
      }),
      providesTags: ["Order"],
    }),
    getOrder: builder.query({
      query: (id) => `Orders/getOrderDetails/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: "Orders/updateStatus",
        method: "PUT",
        params: { id, status },
      }),
      invalidatesTags: (result, error, { id }) => ["Order", { type: "Order", id }, "Dashboard"],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery, useUpdateOrderStatusMutation } = ordersApi;
