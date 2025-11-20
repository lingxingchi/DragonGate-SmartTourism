/**
 * API接口类型定义
 */

// 基础分页请求参数
export interface PageRequest {
  current?: number
  pageSize?: number
  sortField?: string
  sortOrder?: string
}

// 基础分页响应结构
export interface PageResponse<T> {
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: OrderItem[]
  pages: number
  records: T[]
  searchCount: boolean
  size: number
  total: number
}

// 排序项
export interface OrderItem {
  asc: boolean
  column: string
}

// 公告声明相关
export interface AnnounceStatementVO {
  id: number
  content: string
  imgUrl: string
  offlineTime: string
  publishTime: string
  title: string
}

// 活动声明相关
export interface EventStatementVO {
  id: number
  content: string
  imgPath: string
  offlineTime: string
  publishTime: string
  title: string
}

// 景点相关
export interface Attraction {
  content: string
  createTime: string
  id: number
  imgUrl: string
  isDelete: number
  location: string
  name: string
  updateTime: string
}

export interface AttractionQueryRequest extends PageRequest {
  searchText?: string
}

// 景点路线相关
export interface AttractionItemVO {
  attractionId: number
  content: string
  id: number
  imgUrl: string
  location: string
  name: string
  sort: number
}

export interface AttractionRouteVO {
  attractionCount: number
  attractions: AttractionItemVO[]
  content: string
  createTime: string
  id: number
  name: string
  updateTime: string
}

export interface AttractionRouteListRequest {
  routeId: number
}

// 路线相关
export interface Route {
  content: string
  createTime: string
  id: number
  isDelete: number
  name: string
  updateTime: string
}

export interface RouteQueryRequest extends PageRequest {
  searchText?: string
}

// 商品相关
export interface GoodInfoVO {
  id: number
  content: string
  cover: string
  name: string
  price: number
  stock: number
  typeId: number
}

export interface GoodInfoQueryRequest extends PageRequest {
  hprice?: number
  lprice?: number
  searchText?: string
  typeId?: number[]
}

// 商品类型
export interface GoodsType {
  createTime: string
  id: number
  isDelete: number
  typeName: string
  updateTime: string
}

export interface GoodsTypeVO {
  typeName: string
}

// 公告相关
export interface NoticeStatement {
  content: string
  createTime: string
  id: number
  isDelete: number
  updateTime: string
}

// 购物车
export interface ShoppingcartVO {
  createTime: string
  goodsCover: string
  goodsId: number
  goodsName: string
  goodsNum: number
  goodsPrice: number
  goodsStock: number
  goodsTypeId: number
  id: number
  updateTime: string
  userId: number
}

export interface ShoppingcartAddRequest {
  content?: string
  goodsId: number
  goodsNum: number
}

export interface DeleteRequest {
  id: number
}

// 用户相关
export interface UserVO {
  createTime: string
  gender: number
  id: number
  updateTime: string
  userAccount: string
  userAvatar: string
  userName: string
  userRole: string
  age: number
}

export interface User extends UserVO {
  isDelete: number
  userPassword: string
}

export interface UserLoginRequest {
  userAccount: string
  userPassword: string
}

export interface UserRegisterRequest {
  checkPassword: string
  userAccount: string
  userPassword: string
}

export interface UserUpdateRequest {
  gender?: number
  id?: number
  userAccount?: string
  userAvatar?: string
  userName?: string
  userPassword?: string
  age?: number
} 