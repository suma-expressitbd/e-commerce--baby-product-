import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

import { VariantGroup } from "../../../types/product";

export interface TPreorderCartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
  variantValues?: string[];
  variantGroups?: VariantGroup[];
  variantId?: string;
  isPreOrder: boolean;
  currency: string;
}

interface PreorderCartState {
  item: TPreorderCartItem | null;
  discount: number;
  isOpen: boolean;
}

const initialState: PreorderCartState = {
  item: null,
  discount: 0,
  isOpen: false,
};

const preorderCartSlice = createSlice({
  name: "preorderCart",
  initialState,
  reducers: {
    setPreorderItem: (state, action: PayloadAction<TPreorderCartItem>) => {
      // Debug: Log preorder item being set
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 PreOrderCartSlice setPreorderItem:", {
          itemId: action.payload._id,
          itemName: action.payload.name,
          itemPrice: action.payload.price,
          itemPriceType: typeof action.payload.price,
          itemPriceIsNaN: isNaN(action.payload.price),
          itemPriceIsZero: action.payload.price === 0,
          itemQuantity: action.payload.quantity,
          itemVariantValues: action.payload.variantValues,
        });
      }
      state.item = action.payload;
      state.isOpen = true;
    },
    clearPreorderCart: (state) => {
      // Debug logging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log("🛒 CLEARING PREORDER CART STATE");
      }
      state.item = null;
      state.discount = 0;
      state.isOpen = false;
    },
    setDiscountAmount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
    },
    openPreorderCart: (state) => {
      state.isOpen = true;
    },
    closePreorderCart: (state) => {
      state.isOpen = false;
    },
    togglePreorderCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    updatePreorderQuantity: (state, action: PayloadAction<number>) => {
      if (state.item) {
        state.item.quantity = Math.max(
          1,
          Math.min(action.payload, state.item.maxStock)
        );
      }
    },
  },
});

/* Actions */
export const {
  setPreorderItem,
  clearPreorderCart,
  setDiscountAmount,
  openPreorderCart,
  closePreorderCart,
  togglePreorderCart,
  updatePreorderQuantity,
} = preorderCartSlice.actions;

/* Selectors */
export const selectPreorderItem = (state: RootState) => state.preorderCart.item;
export const selectPreorderItemCount = (state: RootState) =>
  state.preorderCart.item ? 1 : 0;
export const selectPreorderSubtotal = (state: RootState) =>
  state.preorderCart.item
    ? state.preorderCart.item.price * state.preorderCart.item.quantity
    : 0;
export const selectPreorderDiscount = (state: RootState) =>
  state.preorderCart.discount;
export const selectPreorderGrandTotal = (state: RootState) =>
  selectPreorderSubtotal(state) - state.preorderCart.discount;
export const selectIsPreorderCartOpen = (state: RootState) =>
  state.preorderCart.isOpen;

export default preorderCartSlice.reducer;
