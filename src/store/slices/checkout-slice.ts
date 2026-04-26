import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AddressLine} from "@/types/api/address/type";
import {getOrderSettlement, OrderSettlement, SubmitOrderRequest} from "@utils/api/trade";
import {CartState} from "@/store/slices/cart-slice";

export const fetchOrderSettlement = createAsyncThunk(
    'checkout/fetchOrderSettlement',
    async (_, {getState}) => {
      const {checkout, cartDetail} = getState() as { checkout: CheckoutState, cartDetail: CartState };
      /**

       */
      const params: SubmitOrderRequest = {
        items: cartDetail?.cart?.items.map(item => ({
          skuId: item.sku.id,
          cartId: item.id,
          count: item.count,
        })) || [],
        ...checkout
      };
      const response = await getOrderSettlement(params);
      return response;
    }
);

// 定义结账状态的结构
export interface CheckoutState {
  deliveryType: number; // 配送方式
  paymentMethod: number; // 支付方式
  receiverAddress: AddressLine | null; // 收货地址
  billingAddress: AddressLine | null; // 账单地址
  businessAddress: AddressLine | null; // 公司地址
  receiveUseBilling: boolean; // 是否使用账单地址作为收货地址
  businessUseBilling: boolean; // 是否使用账单地址作为公司地址
  couponId: number | null; // 优惠券ID
  pointStatus: boolean; // 是否使用积分
  settlementData: OrderSettlement | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  email: string | null; // 访客的邮箱
}

// 初始化状态
const initialState: CheckoutState = {
  deliveryType: 1, // 默认为快递发货
  paymentMethod: 1, // 默认为在线支付
  receiverAddress: null,
  billingAddress: null,
  businessAddress: null,
  receiveUseBilling: true,
  businessUseBilling: true,
  couponId: null,
  pointStatus: false,
  settlementData: null,
  status: 'idle',
  error: null,
  email: null,
};

// 创建 checkout slice
export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    // 设置配送方式
    setDeliveryType: (state, action: PayloadAction<number>) => {
      state.deliveryType = action.payload;
    },
    // 设置支付方式
    setPaymentMethod: (state, action: PayloadAction<number>) => {
      state.paymentMethod = action.payload;
    },
    // 设置收货地址
    setReceiverAddress: (state, action: PayloadAction<AddressLine | null>) => {
      state.receiverAddress = action.payload;
    },
    // 设置账单地址
    setBillingAddress: (state, action: PayloadAction<AddressLine | null>) => {
      state.billingAddress = action.payload;
    },
    // 设置公司地址
    setBusinessAddress: (state, action: PayloadAction<AddressLine | null>) => {
      state.businessAddress = action.payload;
    },
    // 切换“收货地址是否使用账单地址”
    toggleReceiveUseBilling: (state, action: PayloadAction<boolean>) => {
      state.receiveUseBilling = action.payload;
    },
    // 切换“公司地址是否使用账单地址”
    toggleBusinessUseBilling: (state, action: PayloadAction<boolean>) => {
      state.businessUseBilling = action.payload;
    },
    // 设置优惠券ID
    setCouponId: (state, action: PayloadAction<number | null>) => {
      state.couponId = action.payload;
    },
    // 设置积分使用状态
    setPointStatus: (state, action: PayloadAction<boolean>) => {
      state.pointStatus = action.payload;
    },
    // 设置访客邮箱
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    // 重置为初始状态
    resetCheckoutState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchOrderSettlement.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchOrderSettlement.fulfilled, (state, action: PayloadAction<OrderSettlement>) => {
          state.status = 'succeeded';
          state.settlementData = action.payload;
        })
        .addCase(fetchOrderSettlement.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || 'Failed to fetch order settlement';
        });
  }
});

// 导出 actions
export const {
  setDeliveryType,
  setPaymentMethod,
  setReceiverAddress,
  setBillingAddress,
  setBusinessAddress,
  toggleReceiveUseBilling,
  toggleBusinessUseBilling,
  setCouponId,
  setPointStatus,
  setEmail,
  resetCheckoutState,
} = checkoutSlice.actions;

// 导出 reducer
export default checkoutSlice.reducer;