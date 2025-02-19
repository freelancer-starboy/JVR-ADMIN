import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getOrders = createAsyncThunk(
    "admin/getOrders",
    async ({ page, limit, search, searchQuery }, thunkAPI) => {
        try {
            const response = await axios.get("/api/Orders/getAllOrders?page=" + page + "&limit=" + limit + "&search=" + search + "&searchQuery=" + searchQuery);

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Something went wrong"
            );
        }
    }
);

const OrdersSlice = createSlice({
    name: "Orders",
    initialState: {
        orders: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
                state.totalPages = action.payload.totalPages;
                state.error = null;
            })
            .addCase(getOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.orders = [];
            });
    },
});

export default OrdersSlice.reducer;
