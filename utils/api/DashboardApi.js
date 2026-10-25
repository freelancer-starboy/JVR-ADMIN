import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => "dashboard/summary",
      providesTags: ["Dashboard"],
    }),
    getNavCounts: builder.query({
      query: () => "dashboard/counts",
      providesTags: ["Counts"],
    }),
    getMe: builder.query({
      query: () => "auth/me",
      providesTags: ["Me"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery, useGetNavCountsQuery, useGetMeQuery } = dashboardApi;
