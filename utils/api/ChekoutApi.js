import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const CheckoutApi = createApi({
    reducerPath : "checkoutApi",
    baseQuery: fetchBaseQuery({
        baseUrl : "/api/",
    }),
    endpoints : (builder) => ({
        getOrders : builder.query({
            query : (id) => `Orders/getOrderDetails/${id}`
        })
    })
})


export const { useGetOrdersQuery } = CheckoutApi