import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export const productsApi = createApi({
    reducerPath : 'productsApi',
    baseQuery : fetchBaseQuery({
        baseUrl : '/api/'
    }),
    endpoints : ( builder ) => ({
        addProducts : builder.mutation({
            query : ( data ) => ({
                url : 'Products/addProducts',
                method: 'POST',
                body : data,
            })
        }),
        getAllProducts : builder.query({
            query : () => 'Products/getAllProducts'
        })
    })
})

export const { useAddProductsMutation, useGetAllProductsQuery } = productsApi