import { request } from './index'

// 卡匣数据同步接口
export function getCarrierInfo() {
  return request('/api/MCS/GetCarrierInfo')
}