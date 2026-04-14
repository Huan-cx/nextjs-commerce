import {Spu} from "@/types/api/product/type";

export type ProductsSectionProps = {
  title: string;
  description: string;
  products: Spu[];
};


export interface AttributeType {
  isVisibleOnFront: string;
  id: string;
  code: string;
  adminName: string;
  type: string;
  label?: string;
}

export type additionalDataTypes = {
  attribute: AttributeType;
  id: string;
  code: string;
  label: string;
  value: string | null;
  admin_name: string;
  type: string;
};

// Product review

export interface RatingTypes {
  length?: number;
  value?: number;
  size?: string;
  className?: string;
  onChange?: (value: number) => void;
}

