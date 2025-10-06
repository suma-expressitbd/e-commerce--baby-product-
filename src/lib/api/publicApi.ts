// publicApi.ts (from pasted document, no changes needed)
import { ApiResponse } from "@/types/apiResponse";
import { Business, Category } from "@/types/business";
import { OnlineOrderPayload, OnlineOrderResponse } from "@/types/onlineOrder";
import type { Product } from "@/types/product";
import type { Action, PayloadAction } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";

/*ENV CONSTANTS*/
const OWNER_ID = process.env.NEXT_PUBLIC_OWNER_ID;
const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

//console.log("🔐 ENV:", {
//   OWNER_ID,
//   BUSINESS_ID,
//   PUBLIC_API_URL,
// });

/*HYDRATE GUARD*/
function isHydrate(action: Action): action is PayloadAction<any> {
  return action.type === HYDRATE;
}

/*API INSTANCE */
export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({ baseUrl: PUBLIC_API_URL }),
  tagTypes: ["Product", "Products", "Category"],

  extractRehydrationInfo(action, { reducerPath }) {
    if (isHydrate(action)) return action.payload[reducerPath];
  },

  endpoints: (builder) => ({
    /* 1. BUSINESS */
    getBusiness: builder.query<Business, void>({
      query: () => {
        const url = `/public/${OWNER_ID}/${BUSINESS_ID}`;
        //console.log("📦 getBusiness →", url);
        return url;
      },
      transformResponse: (res: ApiResponse<Business[]>) => {
        //console.log("✅ getBusiness fetched:", res?.data?.[0]);
        return res.data[0];
      },
    }),

    /* 2. PRODUCTS */
    getProducts: builder.query<
      Product[],
      Partial<{ search?: string; page?: number; limit?: number; _id?: string }>
    >({
      query: (params = {}) => {
        const payload: Record<string, number | string | undefined> = {
          ...params,
        };
        if (payload.search)
          payload.search = decodeURIComponent(String(payload.search));

        const url = `/public/${OWNER_ID}/${BUSINESS_ID}/products`;
        //console.log("🛎 getProducts →", url);
        //console.log("🧾 params:", payload);

        return {
          url,
          params: payload,
          headers: { "Cache-Control": "no-cache" },
          cache: "no-store", // Disable Next.js Data Cache
        };
      },

      transformResponse: (res: ApiResponse<Product[]>) => {
        //console.log("✅ getProducts fetched:", res?.data?.length ?? 0);
        return res.data;
      },

      keepUnusedDataFor: 0,

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Product" as const,
                id: _id,
              })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    /* 3. SINGLE PRODUCT */
    getProduct: builder.query<Product, string>({
      query: (id) => {
        const url = `/public/${OWNER_ID}/${BUSINESS_ID}/products?_id=${id}`;
        //console.log("🔎 getProduct →", url);
        return {
          url,
        };
      },
      transformResponse: (res: ApiResponse<Product>) => {
        //console.log("✅ getProduct fetched:", res.data);
        return res.data;
      },
      providesTags: (r) =>
        r
          ? [{ type: "Product", id: r._id }]
          : [{ type: "Products", id: "LIST" }],
    }),

    /* 4. ONLINE ORDER */
    createOnlineOrder: builder.mutation<
      OnlineOrderResponse,
      OnlineOrderPayload
    >({
      query: (body) => {
        const url = `/public/${OWNER_ID}/${BUSINESS_ID}/online-order`;
        //console.log("📤 createOnlineOrder →", url);
        //console.log("📨 payload:", body);
        return {
          url,
          method: "POST",
          body,
        };
      },
    }),

    /* 5. CATEGORIES */
    getCategories: builder.query<Category[], void>({
      query: () => {
        const url = `/public/${OWNER_ID}/${BUSINESS_ID}`;
        //console.log("📚 getCategories →", url);
        return url;
      },
      transformResponse: (res: ApiResponse<Business[]>) => {
        //console.log("✅ getCategories fetched:", res.data[0]?.categories);
        return res.data[0].categories;
      },
      providesTags: (r) =>
        r ? r.map((c) => ({ type: "Category" as const, id: c._id })) : [],
    }),
  }),
});

/*HOOK EXPORTS*/
export const {
  useGetBusinessQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateOnlineOrderMutation,
  useGetCategoriesQuery,
} = publicApi;
