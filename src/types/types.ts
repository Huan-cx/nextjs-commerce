import {SVGProps} from "react";
import {AddressLine} from "@/types/api/address/type";


export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};


/**
 * Sorting & filtration constants
 */
export type SortFilterItemTypes = {
  key: string;
  title: string;
  slug: string | null;
  sortKey: "name" | "created_at" | "price" | "PRICE";
  reverse: boolean;
  position: string;
};
export type getFilterAttributeTypes = {
  id: number;
  code: string;
  adminName: string;
  type: string;
  isRequired: boolean;
  isUnique: boolean;
  valuePerLocale: boolean;
  valuePerChannel: boolean;
  isFilterable: boolean;
  isConfigurable: boolean;
  isVisibleOnFront: boolean;
  isUserDefined: boolean;
  isComparable: boolean;
  options: {
    id: string;
    adminName: string;
    swatchValue: string;
    sortOrder: number;
    attributeId: string;
    isNew: string;
    isDelete: string;
    position: string;
    translations: {
      id: string;
      locale: string;
      label: string;
      attributeOptionId: string;
    }[];
  }[];
};


export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type ImageInfo = {
  url: string;
  type: string;
  path: string;
  productId: number;
  altText: string;
};
export type Product = Omit<BagistoProductInfo, "variants" | "images"> & {
  products: ProductDetailsInfo[];
  paginatorInfo: {
    count: number;
    currentPage: number;
    lastPage: number;
    total: number;
  };
};

export type ProductDetailsInfo = Omit<
  BagistoProductInfo,
  "variants" | "images"
> & {
  variants: ProductVariant[];
  images: ImageInfo[];
};

export type ProductOption = {
  id: string;
  name: string;
  // values: string[];
  displayName: string;
  values: ProductOptionValues[];
};

export type ProductOptionValues = {
  label: string;
  hexColors?: string[];
};

export type ProductVariant = {
  id: string;
  label: string;
  sku: string;
  availableForSale: boolean;
  options: {
    id: string;
    label: string;
    products: [number];
  }[];
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: string;
};

export type SEO = {
  title: string;
  description: string;
};

export type BagistoCollectionMenus = {
  id: string;
  logoPath?: string;
  logoUrl?: string;
  name: string;
  slug: string;
};

export type BagistoProduct = {
  name: string;
  longDescription?: string;
  urlKey: string;
  slug?: string;
  path?: string;
  price: ProductPrice;
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type BagistoProductInfo = {
  name: string;
  longDescription?: string;
  urlKey: string;
  type: string;
  status: boolean;
  slug?: string;
  width: string;
  height: string;
  path?: string;
  metaTitle: string;
  metaDescription: string;
  price: ProductPrice;
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  shortDescription: string;
  descriptionHtml: string;
  options: ProductOption[];
  cacheGalleryImages: {
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    originalImageUrl: string;
  }[];
  priceHtml: {
    regularPrice: string;
    currencyCode: string;
    formattedRegularPrice: string;
    finalPrice: string;
    formattedFinalPrice: string;
  };
  variants: Array<ProductVariant>;
  featuredImage: Image;
  images: Array<ImageInfo>;
  productFlats: {
    id: string;
    name: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    width: string;
    height: string;
  }[];
  relatedProducts: RelatedProducts[];
  inventories: {
    qty: string;
  }[];
  configutableData: {
    attributes: ConfigurableProductData[];
    index: ConfigurableProductIndexData[];
  };
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type ConfigurableProductIndexData = {
  id: string;
  attributeOptionIds: {
    attributeId: string;
    attributeCode: string;
    attributeOptionId: string;
  }[];
};
export type RealatedImageArray = {
  url: string;
};

export type RelatedProducts = {
  id: string;
  name: string;
  urlKey: string;
  type: string;
  priceHtml: {
    regularPrice: string;
    currencyCode: string;
    finalPrice: string;
  };
  images?: RealatedImageArray[];
  cacheGalleryImages: {
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    originalImageUrl: string;
  }[];
};

export type ConfigurableProductData = {
  id: string;
  code: string;
  label: string;
  availableForSale: boolean;
  options: {
    id: string;
    code: string;
    label: string;
    swatchType: string;
    swatchValue: string;
    products: [number];
  }[];
};

export type AttributeOptionNode = {
  id: string;
  adminName?: string;
  label?: string;
  isValid: boolean;
};

export type AttributeOptionEdge = {
  node: AttributeOptionNode;
};

export type AttributeData = {
  id: string;
  code: string;
  label?: string;
  options: AttributeOptionNode[] | {
    edges: AttributeOptionEdge[];
  };
};

export type ProductPrice = {
  value: number;
  currencyCode?: "USD" | "EUR" | "ARS" | string;
  retailPrice?: number;
  salePrice?: number;
  listPrice?: number;
  extendedSalePrice?: number;
  extendedListPrice?: number;
};


export type BagistoAddressDataTypes = {
  data: {
    checkoutAddresses: {
      isGuest: boolean;
      customer: {
        addresses?: AddressLine[];
      };
    };
  };
};

export type EditItemTypes = {
  state: boolean;
  type: string;
  address?: AddressLine;
  label: string;
};



export type BagistoUserTypes = {
  customerSignUp: BagistoUserTypes;
  error: {
    message: string;
  };
};

export type BagistoCreateUserOperation = {
  data: {
    createCustomer: {
      customer: BagistoUser;
    };
  };
  variables: {
    input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      phone?: string;
      gender?: string;
      dateOfBirth?: string;
      status?: string;
      isVerified?: string;
      isSuspended?: string;
      subscribedToNewsLetter?: boolean;
    };
  };
};

export type BagistoUser = {
  id: string;
  _id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  status: string;
  apiToken?: string;
  customerGroupId?: string | null;
  channelId?: string | null;
  subscribedToNewsLetter: boolean;
  isVerified: string;
  isSuspended: string;
  token?: string;
  rememberToken?: string | null;
  name: string;
};




export type BagistoCollectionProductsOperation = {
  data: {
    allProducts: {
      data: BagistoProductInfo[];
      paginatorInfo: {
        count: number;
        currentPage: number;
        lastPage: number;
        total: number;
      };
    };
  };
  variables: {
    input: InputData[];
    reverse?: boolean;
    sortKey?: string;
  };
};


export type ThemeCustomizationTypes = {
  id: string;
  themeCode?: string;
  type: string;
  name: string;
  sortOrder: string;
  status: string;
  channelId?: string;
  createdAt: string;
  updatedAt: string;
  translations: TranslationsTypes[];
};

export type TranslationsTypes = {
  id: string;
  themeCustomizationId: number;
  localeCode: string;
  type: string;
  options: OptionDataTypes;
};

export type FilterDataTypes = {
  key: string;
  value: string;
  __typename: string;
};

export type ThemeOptions = {
  picUrl: string;
  title: string;
  sortOrder: string;
};
export type OptionDataTypes = {
  title: string;
  css: string;
  html: string;
  images: ImagesDataType[];
  filters: FilterDataTypes[];
  column_1: ThemeOptions[];
  column_2: ThemeOptions[];
  column_3: ThemeOptions[];
  services: {
    service_icon: string;
    description: string;
    title: string;
  }[];
};

export type ImagesDataType = {
  title: string;
  link: string;
  image: string;
  imageUrl: string;
};

export type BagistoCollectionHomeOperation = {
  data: {
    themeCustomization: Array<ThemeCustomizationTypes>;
  };
};

export type InputData = {
  key: string;
  value: string | number;
};


export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};