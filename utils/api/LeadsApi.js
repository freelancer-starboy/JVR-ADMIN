import { baseApi } from "./baseApi";

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: ({ page = 1, limit = 20, status = "", q = "" } = {}) => ({
        url: "leads",
        params: { page, limit, status, q },
      }),
      providesTags: ["Lead"],
    }),
    getLead: builder.query({
      query: (id) => `leads/${id}`,
      providesTags: (result, error, id) => [{ type: "Lead", id }],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `leads/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Lead", { type: "Lead", id }, "Dashboard", "Counts"],
    }),
  }),
});

export const { useGetLeadsQuery, useGetLeadQuery, useUpdateLeadMutation } = leadsApi;
