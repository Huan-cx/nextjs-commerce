export interface HttpResponse<T = any> {
  /**
   * 0 表示成功 其他表示失败
   * 0 means success, others means fail
   */
  code: number;
  data: T;
  msg: string;
}

export interface PageParam {
  pageNo: number;
  pageSize: number;

  [key: string]: any;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}