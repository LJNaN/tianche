import { request } from './index'

// 卡匣数据同步接口
export function GetCarrierInfo() {
  return request('/api1/MCS/GetCarrierInfo')
}


// 卡匣弹窗信息
export function CarrierFindCmdId(id) {
  return request(`/api1/MCS/CarrierFindCmdId/${id}`)
}


// 天车弹窗信息
export function OhtFindCmdId(id = '') {
  return request(`/api1/MOC/OhtFindCmdId/${id}`)
}


// 实时指令接口
export function GetRealTimeCmd() {
  return request(`/api1/MOC/GetRealTimeCmd`)
}


// 机台弹窗接口
export function GetEqpStateInfo() {
  return request(`/api1/MCS/GetEqpStateInfo`)
}

// 机台弹窗接口、实时状态接口
export function GetRealTimeEqpState(id = '') {
  return request(`/api1/MCS/GetRealTimeEqpState/${id}`)
}


// 二维 OHB Storage Ratio
export function OhbStorageRatio() {
  return request(`/api1/MCS/OhbStorageRatio`)
}


// 二维 Delivery Time/Count
export function McsDeliveryInfo() {
  return request(`/api1/MCS/McsDeliveryInfo`)
}


// 二维 GetMTBFInfo
export function GetMTBFInfo() {
  return request(`/api1/EA/GetMTBFInfo`)
}


// 二维 GetMCBFInfo
export function GetMCBFInfo() {
  return request(`/api1/EA/GetMCBFInfo`)
}

// 轨道状态接口 刷新页面调用  带参是单个 点击轨道弹窗使用
export function GetBayStateInfo(id = '') {
  return request(`/api1/MOC/GetBayStateInfo/${id}`)
}

// 历史轨迹、时间回溯接口
export function GetReplayData(date) {
  if (!date || date.length < 2) return

  const params = {
    query: {
      bool: {
        must: [
          {
            range: {
              createTime: {
                from: date[0],
                to: date[1],
                include_lower: true,
                include_upper: true,
                boost: 1
              }
            }
          },
          {
            match: {
              logType: "plc"
            }
          }
        ]
      }
    },
    sort: [
      {
        createTime: {
          order: "asc"
        }
      }
    ]
  }
  return request(`/api2/moc_log/_search`, params, 'POST')
}
