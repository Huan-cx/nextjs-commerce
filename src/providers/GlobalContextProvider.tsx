"use client";

import {createContext, Dispatch, SetStateAction, useContext, useState,} from "react";
import {DEFAULT_PRICE_CONFIG, PriceConfig} from "@/utils/constants";

interface ContextProps {
  countryCode: string;
  setCountryCode: Dispatch<SetStateAction<string>>;
  priceConfig: PriceConfig;
}

const GlobalContext = createContext<ContextProps>({
  countryCode: "",
  setCountryCode: (): string => "",
  priceConfig: DEFAULT_PRICE_CONFIG,
});

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [countryCode, setCountryCode] = useState("");

  return (
      <GlobalContext.Provider value={{countryCode, setCountryCode, priceConfig: DEFAULT_PRICE_CONFIG}}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
