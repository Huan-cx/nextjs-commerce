"use client";

import {useCallback, useRef, useState} from "react";
import {getAddressList} from "@/utils/api/address";
import {Address} from "@/types/api/address/type";

export const useAddress = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 用于跟踪是否已经成功获取过数据
  const hasFetchedRef = useRef(false);
  // 用于跟踪是否正在进行请求
  const isFetchingRef = useRef(false);

  const fetchAddresses = useCallback(async () => {
    // 避免重复请求
    if (isFetchingRef.current) return;

    setIsLoading(true);
    setError(null);
    isFetchingRef.current = true;

    try {
      const addressList = await getAddressList();
      setAddresses(addressList);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch addresses"));
      setAddresses([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const getAddresses = useCallback(async () => {
    // 只有在未获取过数据或数据为空时才发起请求
    if (!hasFetchedRef.current || addresses.length === 0) {
      await fetchAddresses();
    }
  }, [fetchAddresses, addresses.length]);

  const refetch = useCallback(async () => {
    // 强制重新获取数据
    hasFetchedRef.current = false;
    await fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    isLoading,
    error,
    refetch,
    getAddresses,
  };
};