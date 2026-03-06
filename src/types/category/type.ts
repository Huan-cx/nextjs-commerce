// Category List Types 


// Category Details Types 

export interface ProductOptionNode {
  id: string;
  adminName: string;
  isValid?: boolean; 
}


export interface ProductOptionEdge {
  node: ProductOptionNode;
}


export interface AttributeOptions {
  edges: ProductOptionEdge[];
}


export interface ProductAttribute {
  id: string;
  code: string;
  adminName: string;
  options: AttributeOptions;
}
export type AttributeData = ProductAttribute;


export interface ProductReview {
  id: string;
  rating: number;
  name: string;
  title: string;
  comment: string;
}

export interface ProductReviewEdge {
  node: ProductReview;
}

export interface ProductVariant {
  id: string;
  sku: string;
  baseImageUrl: string;
}

export interface ProductVariantEdge {
  node: ProductVariant;
}

export interface ProductNode {
  id: string;
  sku: string;
  type: string;
  name: string;
  urlKey: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number | string;
  baseImageUrl?: string | null;
  minimumPrice?: number | string | null;

  variants?: {
    edges: ProductVariantEdge[];
  };

  reviews?: {
    edges: ProductReviewEdge[];
  };
}

export interface SingleProductResponse {
  product: ProductNode;
}

// Product Swatch Review Types
export interface SuperAttributeOption {
  id: string;
  code: string;
  label?: string;
  adminName?: string;
  type?: string;
  swatchType?: string;
  swatchValue?: string;
  options?: Array<{
    id: string;
    label?: string;
    swatchValue?: string;
    products?: number[];
  }>;
}

export interface AttributeValueNode {
  id: string;
  code: string;
  label?: string;
  value?: string | null;
  attribute?: {
    id: string;
    code: string;
    adminName?: string;
    type?: string;
  };
}

export interface ProductSwatchReview {
  id: string;
  type: string;
  isSaleable?: string;
  superAttributeOptions?: string; // JSON string
  combinations?: string; // JSON string
  superAttributes?: {
    edges: Array<{
      node: SuperAttributeOption;
    }>;
  };
  attributeValues?: {
    edges: Array<{
      node: AttributeValueNode;
    }>;
  };
}



// GraphQL Response Types

export interface ProductEdge {
  node: {
    id: string;
    name: string;
    urlKey: string;
    type: string;
    sku: string;
    baseImageUrl?: string;
    minimumPrice?: string;
    specialPrice?: string;
    priceHtml?: {
      regularPrice: string;
      finalPrice: string;
      currencyCode: string;
    };
  };
}

export interface ProductsResponse {
  products: {
    edges: ProductEdge[];
    pageInfo?: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount?: number;
  };
}

export interface CategoryEdge {
  node: {
    id: string;
    position?: number;
    logoUrl?: string;
    translation: {
      name: string;
      slug: string;
      description?: string;
    };
  };
}

export interface CategoriesResponse {
  categories: {
    edges: CategoryEdge[];
  };
}

export interface RelatedProductsResponse {
  relatedProducts: {
    edges: ProductEdge[];
  };
}


// Review Types

export interface ReviewInput {
  productId: number;
  title: string;
  comment: string;
  rating: number;
  name: string;
  email: string;
  attachments?: string;
}

export interface ReviewFieldInputs {
  input: ReviewInput;
}

export interface ProductReview {
  id: string;
  name: string;
  title: string;
  rating: number;
  comment: string;
  status: string;
}

export interface CreateProductReviewData {
  createProductReview: {
    success: boolean;
    review: ProductReview;
  };
}

export interface CreateProductReviewVariables {
  input: ReviewInput;
}

export interface CreateProductReviewOperation {
  data: CreateProductReviewData;
  variables: CreateProductReviewVariables;
}
