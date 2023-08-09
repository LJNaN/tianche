import { request } from './index'

// 卡匣数据同步接口
export function GetCarrierInfo() {
  return request('/api/MCS/GetCarrierInfo')
}


// 天车弹窗信息
export function OhtFindCmdId(id) {
  return request(`/api/MOC/OhtFindCmdId/${id}`)
}


