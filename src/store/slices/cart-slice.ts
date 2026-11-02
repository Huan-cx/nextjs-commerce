import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Cart, CartItem} from "@/types/api/trade/cart";


// Helper function to recalculate cart totals
const recalculateCart = (cart: Cart): Cart => {
  const itemsQty = cart.items.reduce((total, item) => total + item.count, 0);
  const totalPrice = cart.items.reduce(
      (total, item) => total + item.sku.price * item.count,
      0,
  );
  return {...cart, itemsQty, totalPrice};
};

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
    // Reducer to add an item to the local cart (for guests)
    addItemLocal: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      if (!state.cart) {
        state.cart = {items: [newItem], itemsQty: 0, totalPrice: 0};
      } else {
        const existingItem = state.cart.items.find(
            (item) => item.sku.id === newItem.sku.id,
        );
        if (existingItem) {
          existingItem.count += newItem.count;
        } else {
          state.cart.items.push(newItem);
        }
      }
      state.cart = recalculateCart(state.cart);
    },
    // Reducer to remove an item from the local cart (for guests)
    removeItemLocal: (state, action: PayloadAction<number>) => {
      const skuIdToRemove = action.payload;
      if (state.cart) {
        state.cart.items = state.cart.items.filter(
            (item) => item.sku.id !== skuIdToRemove,
        );
        state.cart = recalculateCart(state.cart);
      }
    },
    // Reducer to update an item's quantity in the local cart (for guests)
    updateItemQuantityLocal: (
        state,
        action: PayloadAction<{ skuId: number; count: number }>,
    ) => {
      const {skuId, count} = action.payload;
      if (state.cart) {
        const itemToUpdate = state.cart.items.find(
            (item) => item.sku.id === skuId,
        );
        if (itemToUpdate) {
          itemToUpdate.count = count;
        }
        state.cart = recalculateCart(state.cart);
      }
    },
    // 用获取到的商品详情丰富游客购物车
    enrichGuestCartItems: (state, action: PayloadAction<CartItem[]>) => {
      const productInfos = action.payload;
      if (state.cart && state.cart.items) {
        state.cart.items = state.cart.items.map(item => {
          const productInfo = productInfos.find(p => p.sku.id === item.sku.id);
          if (productInfo) {
            // 合并详细信息，同时保留原有的 count 和 selected 状态
            return {
              ...item,
              spu: productInfo.spu,
              sku: {...item.sku, ...productInfo.sku},
            };
          }
          return item;
        });
        state.cart = recalculateCart(state.cart);
      }
    },
  },
});

export const {
  addItem,
  updateCart,
  clearCart,
  addItemLocal,
  removeItemLocal,
  updateItemQuantityLocal,
  enrichGuestCartItems,
} = cartSlice.actions;


export default cartSlice.reducer;