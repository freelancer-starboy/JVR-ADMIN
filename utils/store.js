import { configureStore } from "@reduxjs/toolkit/react";
import { productsApi } from "./api/ProductsApi";
import OrdersReducer from "./OrdersSlice";
import { CheckoutApi } from "./api/ChekoutApi";

export const store = configureStore({
    reducer : {
        Orders : OrdersReducer,
        [productsApi.reducerPath] : productsApi.reducer,
        [CheckoutApi.reducerPath] : CheckoutApi.reducer
    },
    middleware : (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware).concat(CheckoutApi.middleware)
})