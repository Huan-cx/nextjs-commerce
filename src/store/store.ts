import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE,} from "redux-persist";
import storage from "./storage"; // We will create this file
import cartSlice from "./slices/cart-slice";
import userSlice from "./slices/user-slice";
import checkoutSlice from "./slices/checkout-slice";

const rootReducer = combineReducers({
  cartDetail: cartSlice,
  user: userSlice,
  checkout: checkoutSlice,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cartDetail"], // Only cartDetail will be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;