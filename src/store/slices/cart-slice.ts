import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Cart} from "@/types/api/trade/cart";


export interface CartState {
  cart?: Cart;
}

const initialState: CartState = {
  cart: undefined,
};

const cartSlice = createSlice({
  name: "cartDetail",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Cart>) => {
      state.cart = { ...action.payload };
    },
    updateCart: (state, action: PayloadAction<Partial<Cart>>) => {
      if (state.cart) {
        state.cart = { ...state.cart, ...action.payload };
      } else {
        state.cart = action.payload as Cart;
      }
    },
    clearCart(state) {
      state.cart = undefined;
    },
  },
});

export const {
  addItem,
  updateCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;