import { request } from './index'

// 卡匣数据同步接口
export function getCarrierInfo() {
  return request('/api/MCS/GetCarrierInfo')
}

export function test() {
  return request('http://192.168.150.133:8090/MCS/GetCarrierInfo')
}