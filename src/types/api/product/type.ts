export interface Category {
  /*分类编号 */
  id: number;

  /*父分类编号 */
  parentId: number;

  /*分类名称 */
  name: string;

  /*移动端分类图 */
  picUrl: string;

  /*分类排序 */
  sort: number;

  /*开启状态 */
  status: number;

  /*分类描述 */
  description: string;

  /*创建时间 */
  createTime: Record<string, unknown>;

  /*子分类列表 */
  children?: Category[];
}

/** 商品 SPU */
export interface Spu {
  id?: number; // 商品编号
  name?: string; // 商品名称
  categoryId?: number; // 商品分类
  keyword?: string; // 关键字
  unit?: number; // 单位
  picUrl?: string; // 商品封面图
  sliderPicUrls?: string[]; // 商品轮播图
  introduction?: string; // 商品简介
  deliveryTypes?: number[]; // 配送方式
  deliveryTemplateId?: number; // 运费模版
  brandId?: number; // 商品品牌编号
  specType?: boolean; // 商品规格
  subCommissionType?: boolean; // 分销类型
  skus?: Sku[]; // sku数组
  description?: string; // 商品详情
  sort?: number; // 商品排序
  giveIntegral?: number; // 赠送积分
  virtualSalesCount?: number; // 虚拟销量
  price?: number; // 商品价格
  combinationPrice?: number; // 商品拼团价格
  seckillPrice?: number; // 商品秒杀价格
  salesCount?: number; // 商品销量
  marketPrice?: number; // 市场价
  costPrice?: number; // 成本价
  stock?: number; // 商品库存
  createTime?: Date; // 商品创建时间
  status?: number; // 商品状态
  browseCount?: number; // 浏览量
}

/** 商品 SKU */
export interface Sku {
  id?: number; // 商品 SKU 编号
  name?: string; // 商品 SKU 名称
  spuId?: number; // SPU 编号
  properties?: Property[]; // 属性数组
  price?: number | string; // 商品价格
  marketPrice?: number | string; // 市场价
  costPrice?: number | string; // 成本价
  barCode?: string; // 商品条码
  picUrl?: string; // 图片地址
  stock?: number; // 库存
  weight?: number; // 商品重量，单位：kg 千克
  volume?: number; // 商品体积，单位：m^3 平米
  firstBrokeragePrice?: number | string; // 一级分销的佣金
  secondBrokeragePrice?: number | string; // 二级分销的佣金
  salesCount?: number; // 商品销量
}

/** 商品属性 */
export interface Property {
  propertyId?: number; // 属性编号
  propertyName?: string; // 属性名称
  valueId?: number; // 属性值编号
  valueName?: string; // 属性值名称
}

/** 商品状态更新请求 */
export interface SpuStatusUpdateReqVO {
  id: number; // 商品编号
  status: number; // 商品状态
}

export interface Comment {
  id: number; // 评论编号
  userId: number; // 用户编号
  userNickname: string; // 用户昵称
  userAvatar: string; // 用户头像
  anonymous: boolean; // 是否匿名
  orderId: number; // 订单编号
  orderItemId: number; // 订单项编号
  spuId: number; // 商品SPU编号
  spuName: string; // 商品名称
  skuId: number; // 商品SKU编号
  visible: boolean; // 是否可见
  scores: number; // 总评分
  descriptionScores: number; // 描述评分
  benefitScores: number; // 服务评分
  content: string; // 评论内容
  picUrls: string[]; // 评论图片
  replyStatus: boolean; // 是否回复
  replyUserId: number; // 回复人编号
  replyContent: string; // 回复内容
  replyTime: Date; // 回复时间
  createTime: Date; // 创建时间
  skuProperties: {
    propertyId: number; // 属性 ID
    propertyName: string; // 属性名称
    valueId: number; // 属性值 ID
    valueName: string; // 属性值名称
  }[]; // SKU 属性数组
}

export interface SearchProductResponse {
  /*商品 SPU 编号 */
  id: number;

  /*商品名称 */
  name: string;

  /*商品简介 */
  introduction: string;

  /*分类编号 */
  categoryId: number;

  /*商品封面图 */
  picUrl: string;

  /*商品轮播图 */
  sliderPicUrls: Record<string, unknown>[];

  /*规格类型 */
  specType: boolean;

  /*商品价格，单位使用：分 */
  price: number;

  /*市场价，单位使用：分 */
  marketPrice: number;

  /*库存 */
  stock: number;

  /*商品销量 */
  salesCount: number;

  /*配送方式数组 */
  deliveryTypes: Record<string, unknown>[];
}