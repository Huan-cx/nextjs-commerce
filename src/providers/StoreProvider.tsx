"use client";

import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import {persistor, store} from "@/store/store";
import {ReactNode} from "react";

export const StoreProvider = ({children}: { children: ReactNode }) => {
  return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
  );
}