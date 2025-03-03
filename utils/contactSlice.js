import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getContactList = createAsyncThunk(
    "admin/getContactList",
    async ( _, thunkApi) => {
        try {
            const response = await axios.get("/api/contact/getContact")
            return response.data
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || "Something went wrong")
        }
    }
)

export const getSpecificContact = createAsyncThunk(
    "admin/getSpecificContact",
    async (id, thunkApi) => {
        try {
            const response = await axios.get(`/api/contact/${id}`)
            return response.data
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || "Something went wrong")
        }
    }
)

const contactSlice = createSlice({
    name : "contacts",
    initialState : {
        contacts : [],
        loading : false,
        error : null,
    },
    reducers : {},
    extraReducers : (builder) => {
        builder
            .addCase(getContactList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getContactList.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload;
                state.error = null;
            })
            .addCase(getContactList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.contacts = [];
            })
            .addCase(getSpecificContact.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSpecificContact.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload;
                state.error = null;
            })
            .addCase(getSpecificContact.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.contacts = [];
            })
    }
})

export default contactSlice.reducer