export interface Cart {
  id?: number;
  itemsQty: number;
  totalPrice: number;
  items: CartItem[];
}


// 新的购物车列表响应类型
export interface CartItem {
  id: number;
  count: number;
  selected: boolean;
  spu: {
    id: number;
    name: string;
    picUrl: string;
    categoryId: number;
    stock: number;
    status: number;
  };
  sku: {
    id: number;
    picUrl: string;
    price: number;
    stock: number;
    properties: Array<{
      propertyId: number;
      propertyName: string;
      valueId: number;
      valueName: string;
    }>;
  };
}