import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({ baseUrl: "/api/", credentials: "same-origin" });

export function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname === "/") return;
  const next = window.location.pathname + window.location.search;
  window.location.assign(`/?next=${encodeURIComponent(next)}`);
}

// Sends the user back to the login page when the session has expired.
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) redirectToLogin();
  return result;
};

// Every feature module injects its endpoints into this single API slice.
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Product", "Order", "Lead", "Contact", "Review", "ReviewBlock", "Dashboard", "Counts", "Me"],
  refetchOnFocus: false,
  endpoints: () => ({}),
});

// Extracts a human readable message from an RTK Query / fetch error.
export function errorMessage(error, fallback = "Something went wrong") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.data?.message) return error.data.message;
  if (error.status === "FETCH_ERROR") return "Network error - check your connection";
  if (error.message) return error.message;
  return fallback;
}
