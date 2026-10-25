import { baseApi } from "./baseApi";

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: ({ page = 1, limit = 20, rating = "", q = "" } = {}) => ({
        url: "reviews",
        params: { page, limit, rating, q },
      }),
      providesTags: ["Review"],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({ url: `reviews/${id}`, method: "DELETE" }),
      invalidatesTags: ["Review", "ReviewBlock", "Product"],
    }),
    getReviewBlocks: builder.query({
      query: () => "reviews/blocks",
      providesTags: ["ReviewBlock"],
    }),
    blockReviewer: builder.mutation({
      query: (body) => ({ url: "reviews/blocks", method: "POST", body }),
      invalidatesTags: ["Review", "ReviewBlock", "Product"],
    }),
    unblockReviewer: builder.mutation({
      query: (userId) => ({ url: "reviews/blocks", method: "DELETE", params: { userId } }),
      invalidatesTags: ["Review", "ReviewBlock"],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useDeleteReviewMutation,
  useGetReviewBlocksQuery,
  useBlockReviewerMutation,
  useUnblockReviewerMutation,
} = reviewsApi;
