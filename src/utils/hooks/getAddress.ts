"use client"

import {useAddress} from "./useAddress";
import {useAppSelector} from "@/store/hooks";
import {useEffect} from "react";
import {Address} from "@/types/api/address/type";

export const useAddressesFromApi = (autoFetch: boolean = false): {
  billingAddress: Address | null;
  receiverAddress: Address | null;
  businessAddress: Address | null;
  getAddresses: () => Promise<void>;
} => {
  const { addresses: data, getAddresses } = useAddress();
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const address = data;

  const reduxBilling = cartDetail?.billingAddress;
  const reduxShipping = cartDetail?.receiverAddress;
  const reduxBusiness = cartDetail?.businessAddress;

  useEffect(() => {
    if (autoFetch && !address.length && !reduxBilling && !reduxShipping && !reduxBusiness) {
      getAddresses();
    }
  }, [autoFetch, address.length, reduxBilling, reduxShipping, reduxBusiness, getAddresses]);

  if (!Array.isArray(address) && !reduxBilling && !reduxShipping && !reduxBusiness)
    return {billingAddress: null, receiverAddress: null, businessAddress: null, getAddresses};

  const billingNode = address.find((a: Address) => a?.type === 2); // 2 是账单地址

  const shippingNode = address.find((a: Address) => a?.type === 1); // 1 是收货地址

  const businessNode = address.find((a: Address) => a?.type === 3); // 1 是收货地址

  const mapNode = (
      node?: Address
  ): Address | null =>
    node
      ? {
          id: (node as any).id || 0,
        firstName: node.firstName,
        lastName: node.lastName,
        companyName: node.companyName,
          address: node.address || (node as any).street || '',
        city: node.city,
        state: node.state,
        country: node.country,
          postcode: node.postcode || (node as any).zipCode || '',
        email: node.email,
        phone: node.phone,
          street: node.address || (node as any).street || '',
          defaultStatus: (node as any).defaultStatus || false,
          type: (node as any).type || 0,
          vat: (node as any).vat || '',
          eori: (node as any).eori || '',
      }
      : null;

  return {
    billingAddress: reduxBilling ? mapNode(reduxBilling) : mapNode(billingNode),
    receiverAddress: reduxShipping ? mapNode(reduxShipping) : mapNode(shippingNode),
    businessAddress: reduxBusiness ? mapNode(reduxBusiness) : mapNode(businessNode),
    getAddresses,
  };
};