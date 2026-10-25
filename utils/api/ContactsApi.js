import { baseApi } from "./baseApi";

// Contact-form messages ("Enquiries")
export const contactsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: ({ filter = "all", q = "" } = {}) => ({
        url: "contact/getContact",
        params: { filter, q },
      }),
      providesTags: ["Contact"],
    }),
    getContact: builder.query({
      query: (id) => `contact/${id}`,
      providesTags: (result, error, id) => [{ type: "Contact", id }],
    }),
    setContactRead: builder.mutation({
      query: ({ id, read = true }) => ({
        url: `contact/changeStatus/${id}`,
        method: "PUT",
        params: { read },
      }),
      invalidatesTags: (result, error, { id }) => ["Contact", { type: "Contact", id }, "Counts", "Dashboard"],
    }),
    replyToContact: builder.mutation({
      query: ({ id, message }) => ({
        url: "contact/replyEmail",
        method: "POST",
        body: { id, message },
      }),
      invalidatesTags: (result, error, { id }) => ["Contact", { type: "Contact", id }, "Counts"],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({ url: `contact/${id}`, method: "DELETE" }),
      invalidatesTags: ["Contact", "Counts", "Dashboard"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactQuery,
  useSetContactReadMutation,
  useReplyToContactMutation,
  useDeleteContactMutation,
} = contactsApi;
