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


// 实时指令接口
export function GetRealTimeCmd() {
  return request(`/api/MOC/GetRealTimeCmd`)
}


// 机台弹窗接口
export function GetEqpStateInfo() {
  return request(`/api/MCS/GetEqpStateInfo`)
}

// 机台弹窗接口、实时状态接口
export function GetRealTimeEqpState(id = '') {
  return request(`/api/MCS/GetRealTimeEqpState/${id}`)
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

// 轨道状态接口 刷新页面调用  带参是单个 点击轨道弹窗使用
export function GetBayStateInfo(id = '') {
  return request(`/api/MOC/GetBayStateInfo/${id}`)
}
