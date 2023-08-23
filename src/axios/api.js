import { request } from './index'

// 卡匣数据同步接口
export function GetCarrierInfo() {
  return request('/api/MCS/GetCarrierInfo')
}


// 天车弹窗信息
export function OhtFindCmdId(id) {
  return request(`/api/MOC/OhtFindCmdId/${id}`)
}


// 二维 OHB Storage Ratio
export function OhbStorageRatio() {
  return request(`/api/MCS/OhbStorageRatio`)
}


// 二维 Delivery Time/Count
export function McsDeliveryInfo() {
  return request(`/api/MCS/McsDeliveryInfo`)
}