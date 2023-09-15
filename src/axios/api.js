import { request } from './index'

// 卡匣数据同步接口
export function GetCarrierInfo() {
  return request('/api/MCS/GetCarrierInfo')
}


// 卡匣弹窗信息
export function CarrierFindCmdId(id) {
  return request(`/api/MCS/CarrierFindCmdId/${id}`)
}


// 天车弹窗信息
export function OhtFindCmdId(id = '') {
  return request(`/api/MOC/OhtFindCmdId/${id}`)
}


// 机台弹窗信息
export function GetEqpInfoById(id = '') {
  return request(`/api/MCS/GetEqpInfoByID/${id}`)
}


// 二维 OHB Storage Ratio
export function OhbStorageRatio() {
  return request(`/api/MCS/OhbStorageRatio`)
}


// 二维 Delivery Time/Count
export function McsDeliveryInfo() {
  return request(`/api/MCS/McsDeliveryInfo`)
}


// 二维 GetMTBFInfo
export function GetMTBFInfo() {
  return request(`/api/EA/GetMTBFInfo`)
}


// 二维 GetMCBFInfo
export function GetMCBFInfo() {
  return request(`/api/EA/GetMCBFInfo`)
}

