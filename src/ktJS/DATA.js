import { reactive, ref } from 'vue'

// 摆设备位置
const deviceMap = reactive(window.deviceMap)
const deviceMapArray = []
for (let key in deviceMap) {
  for (let key2 in deviceMap[key]) {
    const data = deviceMap[key][key2]
    data.modelType = key
    data.id = key2
    deviceMapArray.push(data)
  }
}

// 模拟天车位置
const skyCarMap = [{
  id: 'V0001',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0002',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0003',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0004',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0005',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0006',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0007',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0008',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0009',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0010',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0011',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0012',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0013',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0014',
  coordinate: Math.floor(Math.random() * 1500000)
}, {
  id: 'V0015',
  coordinate: Math.floor(Math.random() * 1500000)
}]

// 天车弹窗的状态、颜色、图片状态
const skyCarStateColorMap = [
  { id: 0, name: '小车去起始地取货走行中', color: '#00fbf8', img: [39, 40, 12] },
  { id: 1, name: '小车去目的地放货走行中', color: '#0000f6', img: [37, 38, 12] },
  { id: 2, name: '小车去取货/放货动作执行中', color: '#8183fd', img: [35, 36, 12] },
  { id: 3, name: '小车无指令状态/cycling状态', color: '#00f600', img: [33, 34, 12] },
  { id: 4, name: '小车发生故障', color: '#fd0100', img: [31, 32, 13] },
  { id: 5, name: '小车上线前状态', color: '#7d7d7d', img: [41, 42, 12] }
]

// OHB 货架
const shelvesMap = {
  "WBW01G01": {
    "W01_2_01": { fields: [1197, 1198, 1199, 1200], rotate: 270, position: [-159, 25.17, -92], direction: "right", axle: '-x' },
    "W01_2_02": { fields: [1204, 1203, 1202, 1201], rotate: 270, position: [-182, 25.17, -92], direction: "right", axle: '-x' },
    "W01_2_03": { fields: [1208, 1207, 1206, 1205], rotate: 270, position: [-204, 25.17, -92], direction: "right", axle: '-x' },
    "W01_2_04": { fields: [1212, 1211, 1210, 1209], rotate: 270, position: [-227, 25.17, -92], direction: "right", axle: '-x' },
    "W01_2_05": { fields: [1213, 1214, 1215, 1216], rotate: 90, position: [-159, 25.17, -84.7], direction: "left", axle: '-x' },
    "W01_2_06": { fields: [1217, 1218, 1219, 1220], rotate: 90, position: [-182, 25.17, -84.7], direction: "left", axle: '-x' },
    "W01_2_07": { fields: [1221, 1222, 1223, 1224], rotate: 90, position: [-204, 25.17, -84.7], direction: "left", axle: '-x' },
    "W01_2_08": { fields: [1225, 1226, 1227, 1228], rotate: 90, position: [-227, 25.17, -84.7], direction: "left", axle: '-x' }
  },
  "WBW01G02": {
    "W01_2_09": { fields: [1232, 1231, 1230, 1229], rotate: 270, position: [-138, 25.17, -66], direction: "left", axle: 'x' },
    "W01_2_10": { fields: [1236, 1235, 1234, 1233], rotate: 270, position: [-160, 25.17, -66], direction: "left", axle: 'x' },
    "W01_2_11": { fields: [1240, 1239, 1238, 1237], rotate: 270, position: [-182, 25.17, -66], direction: "left", axle: 'x' },
    "W01_2_12": { fields: [1244, 1243, 1242, 1241], rotate: 270, position: [-204, 25.17, -66], direction: "left", axle: 'x' },
    "W01_2_13": { fields: [1248, 1247, 1246, 1245], rotate: 270, position: [-226, 25.17, -66], direction: "left", axle: 'x' },
    "W01_2_18": { fields: [1268, 1267, 1266, 1265], rotate: 90, position: [-226, 25.17, -59], direction: "right", axle: 'x' },
    "W01_2_17": { fields: [1264, 1263, 1262, 1261], rotate: 90, position: [-204, 25.17, -59], direction: "right", axle: 'x' },
    "W01_2_16": { fields: [1260, 1259, 1258, 1257], rotate: 90, position: [-182, 25.17, -59], direction: "right", axle: 'x' },
    "W01_2_15": { fields: [1256, 1255, 1254, 1253], rotate: 90, position: [-160, 25.17, -59], direction: "right", axle: 'x' },
    "W01_2_14": { fields: [1252, 1251, 1250, 1249], rotate: 90, position: [-138, 25.17, -59], direction: "right", axle: 'x' }
  },
  "WBW01G03": {
    "W01_1_05": { fields: [1165, 1166, 1167, 1168], rotate: 270, position: [-226, 25.17, -11], direction: "right", axle: '-x' },
    "W01_1_04": { fields: [1161, 1162, 1163, 1164], rotate: 270, position: [-204, 25.17, -11], direction: "right", axle: '-x' },
    "W01_1_03": { fields: [1157, 1158, 1159, 1160], rotate: 270, position: [-182, 25.17, -11], direction: "right", axle: '-x' },
    "W01_1_02": { fields: [1153, 1154, 1155, 1156], rotate: 270, position: [-160, 25.17, -11], direction: "right", axle: '-x' },
    "W01_1_01": { fields: [1149, 1150, 1151, 1152], rotate: 270, position: [-138, 25.17, -11], direction: "right", axle: '-x' },
    "W01_1_10": { fields: [1185, 1186, 1187, 1188], rotate: 90, position: [-226, 25.17, -4], direction: "left", axle: '-x' },
    "W01_1_09": { fields: [1181, 1182, 1183, 1184], rotate: 90, position: [-204, 25.17, -4], direction: "left", axle: '-x' },
    "W01_1_08": { fields: [1177, 1178, 1179, 1180], rotate: 90, position: [-182, 25.17, -4], direction: "left", axle: '-x' },
    "W01_1_07": { fields: [1173, 1174, 1175, 1176], rotate: 90, position: [-160, 25.17, -4], direction: "left", axle: '-x' },
    "W01_1_06": { fields: [1169, 1170, 1171, 1172], rotate: 90, position: [-138, 25.17, -4], direction: "left", axle: '-x' },
    "W01_1_11": { fields: [1192, 1191, 1190, 1189], rotate: 270, position: [-222, 25.17, 15], direction: "left", axle: 'x' },
    "W01_1_12": { fields: [1196, 1195, 1194, 1193], rotate: 90, position: [-222, 25.17, 22], direction: "right", axle: 'x' }
  },
  "WBW01G04": {
    "W01_38": { fields: [1148, 1147, 1146, 1145], rotate: 0, position: [-119, 25.17, -100], direction: "right", axle: 'z' },
    "W01_35": { fields: [1136, 1135, 1134, 1133], rotate: 180, position: [-112, 25.17, -100], direction: "left", axle: 'z' },
    "W01_37": { fields: [1144, 1143, 1142, 1141], rotate: 0, position: [-119, 25.17, -45], direction: "right", axle: 'z' },
    "W01_36": { fields: [1140, 1139, 1138, 1137], rotate: 0, position: [-119, 25.17, -24], direction: "right", axle: 'z' },
    "W01_34": { fields: [1132, 1131, 1130, 1129], rotate: 180, position: [-112, 25.17, -45], direction: "left", axle: 'z' },
    "W01_33": { fields: [1128, 1127, 1126, 1125], rotate: 180, position: [-112, 25.17, -24], direction: "left", axle: 'z' },
    "W01_32": { fields: [1124, 1123, 1122, 1121], rotate: 180, position: [-112, 25.17, 30], direction: "left", axle: 'z' },
    "W01_31": { fields: [1120, 1119, 1118, 1117], rotate: 180, position: [-112, 25.17, 51], direction: "left", axle: 'z' },
    "W01_30": { fields: [1116, 1115, 1114, 1113], rotate: 180, position: [-112, 25.17, 72], direction: "left", axle: 'z' },
    "W01_29": { fields: [1112, 1111, 1110, 1109], rotate: 180, position: [-112, 25.17, 93], direction: "left", axle: 'z' },
    "W01_28": { fields: [1108, 1107, 1106, 1105], rotate: 180, position: [-112, 25.17, 114], direction: "left", axle: 'z' },
    "W01_27": { fields: [1104, 1103, 1102, 1101], rotate: 180, position: [-112, 25.17, 135], direction: "left", axle: 'z' }
  },
  "WBW01G05": {
    "W01_19": { fields: [1071, 1072, 1073, 1074], rotate: 0, position: [-106, 25.17, 30], direction: "left", axle: '-z' },
    "W01_18": { fields: [1067, 1068, 1069, 1070], rotate: 0, position: [-106, 25.17, 51], direction: "left", axle: '-z' },
    "W01_17": { fields: [1063, 1064, 1065, 1066], rotate: 0, position: [-106, 25.17, 72], direction: "left", axle: '-z' },
    "W01_16": { fields: [1059, 1060, 1061, 1062], rotate: 0, position: [-106, 25.17, 93], direction: "left", axle: '-z' },
    "W01_15": { fields: [1055, 1056, 1057, 1058], rotate: 0, position: [-106, 25.17, 114], direction: "left", axle: '-z' },
    "W01_14": { fields: [1051, 1052, 1053, 1054], rotate: 0, position: [-106, 25.17, 135], direction: "left", axle: '-z' },
    "W01_06": { fields: [1021, 1022, 1023, 1024], rotate: 180, position: [-99, 25.17, 30], direction: "right", axle: '-z' },
    "W01_05": { fields: [1017, 1018, 1019, 1020], rotate: 180, position: [-99, 25.17, 51], direction: "right", axle: '-z' },
    "W01_04": { fields: [1013, 1014, 1015, 1016], rotate: 180, position: [-99, 25.17, 72], direction: "right", axle: '-z' },
    "W01_03": { fields: [1009, 1010, 1011, 1012], rotate: 180, position: [-99, 25.17, 93], direction: "right", axle: '-z' },
    "W01_02": { fields: [1005, 1006, 1007, 1008], rotate: 180, position: [-99, 25.17, 114], direction: "right", axle: '-z' },
    "W01_01": { fields: [1001, 1002, 1003, 1004], rotate: 180, position: [-99, 25.17, 135], direction: "right", axle: '-z' }
  },
  "WBW01G06": {
    "W01_26": { fields: [1099, 1100], rotate: 0, position: [-106, 25.17, -110], direction: "left", axle: '-z' },
    "W01_13": { fields: [1049, 1050], rotate: 180, position: [-99, 25.17, -110], direction: "right", axle: '-z' },
    "W01_25": { fields: [1095, 1096, 1097, 1098], rotate: 0, position: [-106, 25.17, -94], direction: "left", axle: '-z' },
    "W01_24": { fields: [1091, 1092, 1093, 1094], rotate: 0, position: [-106, 25.17, -73.3], direction: "left", axle: '-z' },
    "W01_23": { fields: [1087, 1088, 1089, 1090], rotate: 0, position: [-106, 25.17, -52.6], direction: "left", axle: '-z' },
    "W01_22": { fields: [1083, 1084, 1085, 1086], rotate: 0, position: [-106, 25.17, -31.9], direction: "left", axle: '-z' },
    "W01_21": { fields: [1079, 1080, 1081, 1082], rotate: 0, position: [-106, 25.17, -11.2], direction: "left", axle: '-z' },
    "W01_20": { fields: [1075, 1076, 1077, 1078], rotate: 0, position: [-106, 25.17, 9.5], direction: "left", axle: '-z' },
    "W01_12": { fields: [1045, 1046, 1047, 1048], rotate: 180, position: [-99, 25.17, -94], direction: "right", axle: '-z' },
    "W01_11": { fields: [1041, 1042, 1043, 1044], rotate: 180, position: [-99, 25.17, -73.3], direction: "right", axle: '-z' },
    "W01_10": { fields: [1037, 1038, 1039, 1040], rotate: 180, position: [-99, 25.17, -52.6], direction: "right", axle: '-z' },
    "W01_09": { fields: [1033, 1034, 1035, 1036], rotate: 180, position: [-99, 25.17, -31.9], direction: "right", axle: '-z' },
    "W01_08": { fields: [1029, 1030, 1031, 1032], rotate: 180, position: [-99, 25.17, -11.2], direction: "right", axle: '-z' },
    "W01_07": { fields: [1025, 1026, 1027, 1028], rotate: 180, position: [-99, 25.17, 9.5], direction: "right", axle: '-z' }
  },
  "WBW02G01": {
    "W02_73": { fields: [2288, 2287, 2286, 2285], rotate: 0, position: [-36, 25.17, -210], direction: "right", axle: 'z' },
    "W02_72": { fields: [2284, 2283, 2282, 2281], rotate: 0, position: [-36, 25.17, -188.5], direction: "right", axle: 'z' },
    "W02_71": { fields: [2280, 2279, 2278, 2277], rotate: 0, position: [-36, 25.17, -167], direction: "right", axle: 'z' },
    "W02_70": { fields: [2276, 2275, 2274, 2273], rotate: 0, position: [-36, 25.17, -145.5], direction: "right", axle: 'z' },
    "W02_69": { fields: [2272, 2271, 2270, 2269], rotate: 0, position: [-36, 25.17, -124], direction: "right", axle: 'z' },
    "W02_56": { fields: [2220, 2219, 2218, 2217], rotate: 180, position: [-29, 25.17, -210], direction: "left", axle: 'z' },
    "W02_55": { fields: [2216, 2215, 2214, 2213], rotate: 180, position: [-29, 25.17, -188.5], direction: "left", axle: 'z' },
    "W02_54": { fields: [2212, 2211, 2210, 2209], rotate: 180, position: [-29, 25.17, -167], direction: "left", axle: 'z' },
    "W02_53": { fields: [2208, 2207, 2206, 2205], rotate: 180, position: [-29, 25.17, -145.5], direction: "left", axle: 'z' },
    "W02_52": { fields: [2204, 2203, 2202, 2201], rotate: 180, position: [-29, 25.17, -124], direction: "left", axle: 'z' }
  },
  "WBW02G08": {
    "W02_40": { fields: [2153, 2154, 2155, 2156], rotate: 0, position: [-10, 25.17, -210], direction: "left", axle: '-z' },
    "W02_39": { fields: [2149, 2150, 2151, 2152], rotate: 0, position: [-10, 25.17, -188.5], direction: "left", axle: '-z' },
    "W02_38": { fields: [2145, 2146, 2147, 2148], rotate: 0, position: [-10, 25.17, -167], direction: "left", axle: '-z' },
    "W02_37": { fields: [2141, 2142, 2143, 2144], rotate: 0, position: [-10, 25.17, -145.5], direction: "left", axle: '-z' },
    "W02_36": { fields: [2137, 2138, 2139, 2140], rotate: 0, position: [-10, 25.17, -124], direction: "left", axle: '-z' },
    "W02_20": { fields: [2075, 2076, 2077, 2078], rotate: 180, position: [-4, 25.17, -210], direction: "right", axle: '-z' },
    "W02_19": { fields: [2071, 2072, 2073, 2074], rotate: 180, position: [-4, 25.17, -188.5], direction: "right", axle: '-z' },
    "W02_18": { fields: [2067, 2068, 2069, 2070], rotate: 180, position: [-4, 25.17, -167], direction: "right", axle: '-z' },
    "W02_17": { fields: [2063, 2064, 2065, 2066], rotate: 180, position: [-4, 25.17, -145.5], direction: "right", axle: '-z' },
    "W02_16": { fields: [2059, 2060, 2061, 2062], rotate: 180, position: [-4, 25.17, -124], direction: "right", axle: '-z' }
  },
  "WBW02G02": {
    "W02_68": { fields: [2268, 2267, 2266, 2265], rotate: 0, position: [-36, 25.17, -93], direction: "right", axle: 'z' },
    "W02_67": { fields: [2264, 2263, 2262, 2261], rotate: 0, position: [-36, 25.17, -71.9], direction: "right", axle: 'z' },
    "W02_66": { fields: [2260, 2259, 2258, 2257], rotate: 0, position: [-36, 25.17, -50.8], direction: "right", axle: 'z' },
    "W02_65": { fields: [2256, 2255, 2254, 2253], rotate: 0, position: [-36, 25.17, -29.7], direction: "right", axle: 'z' },
    "W02_64": { fields: [2252, 2251, 2250, 2249], rotate: 0, position: [-36, 25.17, -8.6], direction: "right", axle: 'z' },
    "W02_63": { fields: [2248, 2247, 2246, 2245], rotate: 0, position: [-36, 25.17, 12.6], direction: "right", axle: 'z' },
    "W02_51": { fields: [2200, 2199, 2198, 2197], rotate: 180, position: [-29, 25.17, -93], direction: "left", axle: 'z' },
    "W02_50": { fields: [2196, 2195, 2194, 2193], rotate: 180, position: [-29, 25.17, -71.9], direction: "left", axle: 'z' },
    "W02_49": { fields: [2192, 2191, 2190, 2189], rotate: 180, position: [-29, 25.17, -50.8], direction: "left", axle: 'z' },
    "W02_48": { fields: [2188, 2187, 2186, 2185], rotate: 180, position: [-29, 25.17, -29.7], direction: "left", axle: 'z' }
  },
  "WBW02G03": {
    "W02_62": { fields: [2244, 2243, 2242, 2241], rotate: 0, position: [-36, 25.17, 33.7], direction: "right", axle: 'z' },
    "W02_61": { fields: [2240, 2239, 2238, 2237], rotate: 0, position: [-36, 25.17, 54.8], direction: "right", axle: 'z' },
    "W02_60": { fields: [2236, 2235, 2234, 2233], rotate: 0, position: [-36, 25.17, 75.9], direction: "right", axle: 'z' },
    "W02_47": { fields: [2184, 2183, 2182, 2181], rotate: 180, position: [-29, 25.17, 33.7], direction: "left", axle: 'z' },
    "W02_46": { fields: [2180, 2179, 2178, 2177], rotate: 180, position: [-29, 25.17, 54.8], direction: "left", axle: 'z' },
    "W02_45": { fields: [2176, 2175, 2174, 2173], rotate: 180, position: [-29, 25.17, 75.9], direction: "left", axle: 'z' },
    "W02_44": { fields: [2172, 2171, 2170, 2169], rotate: 180, position: [-29, 25.17, 97], direction: "left", axle: 'z' }
  },
  "WBW02G07": {
    "W02_35": { fields: [2133, 2134, 2135, 2136], rotate: 0, position: [-10, 25.17, -93], direction: "left", axle: '-z' },
    "W02_34": { fields: [2129, 2130, 2131, 2132], rotate: 0, position: [-10, 25.17, -71.9], direction: "left", axle: '-z' },
    "W02_33": { fields: [2125, 2126, 2127, 2128], rotate: 0, position: [-10, 25.17, -50.8], direction: "left", axle: '-z' },
    "W02_32": { fields: [2121, 2122, 2123, 2124], rotate: 0, position: [-10, 25.17, -29.7], direction: "left", axle: '-z' },
    "W02_31": { fields: [2117, 2118, 2119, 2120], rotate: 0, position: [-10, 25.17, -8.6], direction: "left", axle: '-z' },
    "W02_15": { fields: [2055, 2056, 2057, 2058], rotate: 180, position: [-4, 25.17, -93], direction: "right", axle: '-z' },
    "W02_14": { fields: [2051, 2052, 2053, 2054], rotate: 180, position: [-4, 25.17, -71.9], direction: "right", axle: '-z' },
    "W02_13": { fields: [2047, 2048, 2049, 2050], rotate: 180, position: [-4, 25.17, -50.8], direction: "right", axle: '-z' },
    "W02_12": { fields: [2043, 2044, 2045, 2046], rotate: 180, position: [-4, 25.17, -29.7], direction: "right", axle: '-z' },
    "W02_11": { fields: [2039, 2040, 2041, 2042], rotate: 180, position: [-4, 25.17, -8.6], direction: "right", axle: '-z' }
  },
  "WBW02G06": {
    "W02_30": { fields: [2113, 2114, 2115, 2116], rotate: 0, position: [-10, 25.17, 12.6], direction: "left", axle: '-z' },
    "W02_29": { fields: [2109, 2110, 2111, 2112], rotate: 0, position: [-10, 25.17, 33.7], direction: "left", axle: '-z' },
    "W02_28": { fields: [2105, 2106, 2107, 2108], rotate: 0, position: [-10, 25.17, 54.8], direction: "left", axle: '-z' },
    "W02_27": { fields: [2101, 2102, 2103, 2104], rotate: 0, position: [-10, 25.17, 75.9], direction: "left", axle: '-z' },
    "W02_26": { fields: [2097, 2098, 2099, 2100], rotate: 0, position: [-10, 25.17, 97], direction: "left", axle: '-z' },
    "W02_10": { fields: [2035, 2036, 2037, 2038], rotate: 180, position: [-4, 25.17, 12.6], direction: "right", axle: '-z' },
    "W02_09": { fields: [2031, 2032, 2033, 2034], rotate: 180, position: [-4, 25.17, 33.7], direction: "right", axle: '-z' },
    "W02_08": { fields: [2027, 2028, 2029, 2030], rotate: 180, position: [-4, 25.17, 54.8], direction: "right", axle: '-z' },
    "W02_07": { fields: [2023, 2024, 2025, 2026], rotate: 180, position: [-4, 25.17, 75.9], direction: "right", axle: '-z' },
    "W02_06": { fields: [2019, 2020, 2021, 2022], rotate: 180, position: [-4, 25.17, 97], direction: "right", axle: '-z' }
  },
  "WBW02G04": {
    "W02_59": { fields: [2232, 2231, 2230, 2229], rotate: 0, position: [-36, 25.17, 130], direction: "right", axle: 'z' },
    "W02_58": { fields: [2228, 2227, 2226, 2225], rotate: 0, position: [-36, 25.17, 152], direction: "right", axle: 'z' },
    "W02_43": { fields: [2168, 2167, 2166, 2165], rotate: 180, position: [-29, 25.17, 130], direction: "left", axle: 'z' },
    "W02_42": { fields: [2164, 2163, 2162, 2161], rotate: 180, position: [-29, 25.17, 152], direction: "left", axle: 'z' },
    "W02_57": { fields: [2224, 2223, 2222, 2221], rotate: 0, position: [-36, 25.17, 202], direction: "right", axle: 'z' },
    "W02_41": { fields: [2160, 2159, 2158, 2157], rotate: 180, position: [-29, 25.17, 202], direction: "left", axle: 'z' }
  },
  "WBW02G05": {
    "W02_25": { fields: [2093, 2094, 2095, 2096], rotate: 0, position: [-10, 25.17, 130], direction: "left", axle: '-z' },
    "W02_24": { fields: [2089, 2090, 2091, 2092], rotate: 0, position: [-10, 25.17, 151.3], direction: "left", axle: '-z' },
    "W02_23": { fields: [2085, 2086, 2087, 2088], rotate: 0, position: [-10, 25.17, 172.7], direction: "left", axle: '-z' },
    "W02_22": { fields: [2081, 2082, 2083, 2084], rotate: 0, position: [-10, 25.17, 194], direction: "left", axle: '-z' },
    "W02_21": { fields: [2079, 2080], rotate: 0, position: [-10, 25.17, 210], direction: "left", axle: '-z' },
    "W02_05": { fields: [2015, 2016, 2017, 2018], rotate: 180, position: [-4, 25.17, 130.5], direction: "right", axle: '-z' },
    "W02_04": { fields: [2011, 2012, 2013, 2014], rotate: 180, position: [-4, 25.17, 151.3], direction: "right", axle: '-z' },
    "W02_03": { fields: [2007, 2008, 2009, 2010], rotate: 180, position: [-4, 25.17, 172.7], direction: "right", axle: '-z' },
    "W02_02": { fields: [2003, 2004, 2005, 2006], rotate: 180, position: [-4, 25.17, 194], direction: "right", axle: '-z' },
    "W02_01": { fields: [2001, 2002], rotate: 180, position: [-4, 25.17, 210.5], direction: "right", axle: '-z' }
  },
  "WBW03G01": {
    "W03_77": { fields: [3300, 3299, 3298, 3297], rotate: 0, position: [53, 25.17, -210], direction: "right", axle: 'z' },
    "W03_76": { fields: [3296, 3295, 3294, 3293], rotate: 0, position: [53, 25.17, -188.5], direction: "right", axle: 'z' },
    "W03_75": { fields: [3292, 3291, 3290, 3289], rotate: 0, position: [53, 25.17, -167], direction: "right", axle: 'z' },
    "W03_74": { fields: [3288, 3287, 3286, 3285], rotate: 0, position: [53, 25.17, -145.5], direction: "right", axle: 'z' },
    "W03_73": { fields: [3284, 3283, 3282, 3281], rotate: 0, position: [53, 25.17, -124], direction: "right", axle: 'z' },
    "W03_72": { fields: [3280, 3279], rotate: 0, position: [53, 25.17, -107.5], direction: "right", axle: 'z' },
    "W03_57": { fields: [3222, 3221, 3220, 3219], rotate: 180, position: [59.5, 25.17, -210], direction: "left", axle: 'z' },
    "W03_56": { fields: [3218, 3217, 3216, 3215], rotate: 180, position: [59.5, 25.17, -188.5], direction: "left", axle: 'z' },
    "W03_55": { fields: [3214, 3213, 3212, 3211], rotate: 180, position: [59.5, 25.17, -167], direction: "left", axle: 'z' },
    "W03_54": { fields: [3210, 3209, 3208, 3207], rotate: 180, position: [59.5, 25.17, -145.5], direction: "left", axle: 'z' },
    "W03_53": { fields: [3206, 3205, 3204, 3203], rotate: 180, position: [59.5, 25.17, -124], direction: "left", axle: 'z' },
    "W03_52": { fields: [3202, 3201], rotate: 180, position: [59.5, 25.17, -107.5], direction: "left", axle: 'z' }
  },
  "WBW03G08": {
    "W03_37": { fields: [3141, 3142, 3143, 3144], rotate: 0, position: [75, 25.17, -210], direction: "left", axle: '-z' },
    "W03_36": { fields: [3137, 3138, 3139, 3140], rotate: 0, position: [75, 25.17, -188.5], direction: "left", axle: '-z' },
    "W03_35": { fields: [3133, 3134, 3135, 3136], rotate: 0, position: [75, 25.17, -167], direction: "left", axle: '-z' },
    "W03_34": { fields: [3129, 3130, 3131, 3132], rotate: 0, position: [75, 25.17, -145.5], direction: "left", axle: '-z' },
    "W03_33": { fields: [3125, 3126, 3127, 3128], rotate: 0, position: [75, 25.17, -124], direction: "left", axle: '-z' },
    "W03_32": { fields: [3123, 3124], rotate: 0, position: [75, 25.17, -107.5], direction: "left", axle: '-z' },
    "W03_19": { fields: [3071, 3072, 3073, 3074], rotate: 180, position: [82, 25.17, -210], direction: "right", axle: '-z' },
    "W03_18": { fields: [3067, 3068, 3069, 3070], rotate: 180, position: [82, 25.17, -188.5], direction: "right", axle: '-z' },
    "W03_17": { fields: [3063, 3064, 3065, 3066], rotate: 180, position: [82, 25.17, -167], direction: "right", axle: '-z' },
    "W03_16": { fields: [3059, 3060, 3061, 3062], rotate: 180, position: [82, 25.17, -145.5], direction: "right", axle: '-z' },
    "W03_15": { fields: [3055, 3056, 3057, 3058], rotate: 180, position: [82, 25.17, -124], direction: "right", axle: '-z' },
    "W03_14": { fields: [3053, 3054], rotate: 180, position: [82, 25.17, -107.5], direction: "right", axle: '-z' }
  },
  "WBW04G01": {
    "W04-81": { fields: [4300, 4299, 4298, 4297], rotate: 0, position: [113, 25.17, -210], direction: "right", axle: "z" },
    "W04-80": { fields: [4296, 4295, 4294, 4293], rotate: 0, position: [113, 25.17, -188.5], direction: "right", axle: "z" },
    "W04-79": { fields: [4292, 4291, 4290, 4289], rotate: 0, position: [113, 25.17, -167], direction: "right", axle: "z" },
    "W04-78": { fields: [4288, 4287, 4286, 4285], rotate: 0, position: [113, 25.17, -145.5], direction: "right", axle: "z" },
    "W04-77": { fields: [4284, 4283, 4282, 4281], rotate: 0, position: [113, 25.17, -124], direction: "right", axle: "z" },
    "W04-76": { fields: [4280, 4279], rotate: 0, position: [113, 25.17, -107.5], direction: "right", axle: "z" },
    "W04-61": { fields: [4226, 4225, 4224, 4223], rotate: 180, position: [120, 25.17, -210], direction: "left", axle: "z" },
    "W04-60": { fields: [4222, 4221, 4220, 4219], rotate: 180, position: [120, 25.17, -188.5], direction: "left", axle: "z" },
    "W04-59": { fields: [4218, 4217, 4216, 4215], rotate: 180, position: [120, 25.17, -167], direction: "left", axle: "z" },
    "W04-58": { fields: [4214, 4213, 4212, 4211], rotate: 180, position: [120, 25.17, -145.5], direction: "left", axle: "z" },
    "W04-57": { fields: [4210, 4209, 4208, 4207], rotate: 180, position: [120, 25.17, -124], direction: "left", axle: "z" },
    "W04-56": { fields: [4206, 4205], rotate: 180, position: [120, 25.17, -107.5], direction: "left", axle: "z" }
  },
  "WBW04G08": {
    "W04-42": { fields: [4153, 4154, 4155, 4156], rotate: 0, position: [136, 25.17, -210], direction: "left", axle: '-z' },
    "W04-41": { fields: [4149, 4150, 4151, 4152], rotate: 0, position: [136, 25.17, -188.5], direction: "left", axle: '-z' },
    "W04-40": { fields: [4145, 4146, 4147, 4148], rotate: 0, position: [136, 25.17, -167], direction: "left", axle: '-z' },
    "W04-39": { fields: [4141, 4142, 4143, 4144], rotate: 0, position: [136, 25.17, -145.5], direction: "left", axle: '-z' },
    "W04-38": { fields: [4137, 4138, 4139, 4140], rotate: 0, position: [136, 25.17, -124], direction: "left", axle: '-z' },
    "W04-37": { fields: [4135, 4136], rotate: 0, position: [136, 25.17, -107.5], direction: "left", axle: '-z' },
    "W04-21": { fields: [4075, 4076, 4077, 4078], rotate: 180, position: [143, 25.17, -210], direction: "right", axle: '-z' },
    "W04-20": { fields: [4071, 4072, 4073, 4074], rotate: 180, position: [143, 25.17, -188.5], direction: "right", axle: '-z' },
    "W04-19": { fields: [4067, 4068, 4069, 4070], rotate: 180, position: [143, 25.17, -167], direction: "right", axle: '-z' },
    "W04-18": { fields: [4063, 4064, 4065, 4066], rotate: 180, position: [143, 25.17, -145.5], direction: "right", axle: '-z' },
    "W04-17": { fields: [4059, 4060, 4061, 4062], rotate: 180, position: [143, 25.17, -124], direction: "right", axle: '-z' },
    "W04-16": { fields: [4057, 4058], rotate: 180, position: [143, 25.17, -107.5], direction: "right", axle: '-z' }
  },
  "WBW05G01": {
    "W05-81": { fields: [5799, 5798, 5797, 5796], rotate: 0, position: [175, 25.17, -210], direction: "right", axle: 'z' },
    "W05-80": { fields: [5795, 5794, 5793, 5792], rotate: 0, position: [175, 25.17, -188.5], direction: "right", axle: 'z' },
    "W05-79": { fields: [5791, 5790, 5789, 5788], rotate: 0, position: [175, 25.17, -167], direction: "right", axle: 'z' },
    "W05-78": { fields: [5787, 5786, 5785, 5784], rotate: 0, position: [175, 25.17, -145.5], direction: "right", axle: 'z' },
    "W05-77": { fields: [5783, 5782, 5781, 5780], rotate: 0, position: [175, 25.17, -124], direction: "right", axle: 'z' },
    "W05-76": { fields: [5779, 5778], rotate: 0, position: [175, 25.17, -107.5], direction: "right", axle: 'z' },
    "W05-61": { fields: [5725, 5724, 5723, 5722], rotate: 180, position: [181, 25.17, -210], direction: "left", axle: 'z' },
    "W05-60": { fields: [5721, 5720, 5719, 5718], rotate: 180, position: [181, 25.17, -188.5], direction: "left", axle: 'z' },
    "W05-59": { fields: [5717, 5716, 5715, 5714], rotate: 180, position: [181, 25.17, -167], direction: "left", axle: 'z' },
    "W05-58": { fields: [5713, 5712, 5711, 5710], rotate: 180, position: [181, 25.17, -145.5], direction: "left", axle: 'z' },
    "W05-57": { fields: [5709, 5708, 5707, 5706], rotate: 180, position: [181, 25.17, -124], direction: "left", axle: 'z' },
    "W05-56": { fields: [5705, 5704], rotate: 180, position: [181, 25.17, -107.5], direction: "left", axle: 'z' }
  },
  "WBW05G08": {
    "W05-42": { fields: [5652, 5653, 5654, 5655], rotate: 0, position: [197, 25.17, -210], direction: "left", axle: '-z' },
    "W05-41": { fields: [5648, 5649, 5650, 5651], rotate: 0, position: [197, 25.17, -188.5], direction: "left", axle: '-z' },
    "W05-40": { fields: [5644, 5645, 5646, 5647], rotate: 0, position: [197, 25.17, -167], direction: "left", axle: '-z' },
    "W05-39": { fields: [5640, 5641, 5642, 5643], rotate: 0, position: [197, 25.17, -145.5], direction: "left", axle: '-z' },
    "W05-38": { fields: [5636, 5637, 5638, 5639], rotate: 0, position: [197, 25.17, -124], direction: "left", axle: '-z' },
    "W05-37": { fields: [5634, 5635], rotate: 0, position: [197, 25.17, -107.5], direction: "left", axle: '-z' },
    "W05-21": { fields: [5574, 5575, 5576, 5577], rotate: 180, position: [203, 25.17, -210], direction: "right", axle: '-z' },
    "W05-20": { fields: [5570, 5571, 5572, 5573], rotate: 180, position: [203, 25.17, -188.5], direction: "right", axle: '-z' },
    "W05-19": { fields: [5566, 5567, 5568, 5569], rotate: 180, position: [203, 25.17, -167], direction: "right", axle: '-z' },
    "W05-18": { fields: [5562, 5563, 5564, 5565], rotate: 180, position: [203, 25.17, -145.5], direction: "right", axle: '-z' },
    "W05-17": { fields: [5558, 5559, 5560, 5561], rotate: 180, position: [203, 25.17, -124], direction: "right", axle: '-z' },
    "W05-16": { fields: [5556, 5557], rotate: 180, position: [203, 25.17, -107.5], direction: "right", axle: '-z' }
  },
  "WBW03G02": {
    "W03_71": { fields: [3278, 3277, 3276, 3275], rotate: 0, position: [53, 25.17, -82], direction: "right", axle: 'z' },
    "W03_70": { fields: [3274, 3273, 3272, 3271], rotate: 0, position: [53, 25.17, -60.9], direction: "right", axle: 'z' },
    "W03_69": { fields: [3270, 3269, 3268, 3267], rotate: 0, position: [53, 25.17, -39.8], direction: "right", axle: 'z' },
    "W03_68": { fields: [3266, 3265, 3264, 3263], rotate: 0, position: [53, 25.17, -18.6], direction: "right", axle: 'z' },
    "W03_51": { fields: [3200, 3199, 3198, 3197], rotate: 180, position: [59.5, 25.17, -82], direction: "left", axle: 'z' },
    "W03_50": { fields: [3196, 3195, 3194, 3193], rotate: 180, position: [59.5, 25.17, -60.9], direction: "left", axle: 'z' },
    "W03_49": { fields: [3192, 3191, 3190, 3189], rotate: 180, position: [59.5, 25.17, -39.8], direction: "left", axle: 'z' },
    "W03_48": { fields: [3188, 3187, 3186, 3185], rotate: 180, position: [59.5, 25.17, -18.6], direction: "left", axle: 'z' }
  },
  "WBW03G03": {
    "W03_67": { fields: [3262, 3261, 3260, 3259], rotate: 0, position: [53, 25.17, 2.5], direction: "right", axle: 'z' },
    "W03_66": { fields: [3258, 3257, 3256, 3255], rotate: 0, position: [53, 25.17, 23.6], direction: "right", axle: 'z' },
    "W03_65": { fields: [3254, 3253, 3252, 3251], rotate: 0, position: [53, 25.17, 44.8], direction: "right", axle: 'z' },
    "W03_64": { fields: [3250, 3249, 3248, 3247], rotate: 0, position: [53, 25.17, 65.9], direction: "right", axle: 'z' },
    "W03_63": { fields: [3246, 3245, 3244, 3243], rotate: 0, position: [53, 25.17, 87], direction: "right", axle: 'z' },
    "W03_47": { fields: [3184, 3183, 3182, 3181], rotate: 180, position: [59.5, 25.17, 2.5], direction: "left", axle: 'z' },
    "W03_46": { fields: [3180, 3179, 3178, 3177], rotate: 180, position: [59.5, 25.17, 23.6], direction: "left", axle: 'z' },
    "W03_45": { fields: [3176, 3175, 3174, 3173], rotate: 180, position: [59.5, 25.17, 44.8], direction: "left", axle: 'z' },
    "W03_44": { fields: [3172, 3171, 3170, 3169], rotate: 180, position: [59.5, 25.17, 65.9], direction: "left", axle: 'z' },
    "W03_43": { fields: [3168, 3167, 3166, 3165], rotate: 180, position: [59.5, 25.17, 87], direction: "left", axle: 'z' }
  },
  "WBW03G07": {
    "W03_31": { fields: [3119, 3120, 3121, 3122], rotate: 0, position: [75, 25.17, -82], direction: "left", axle: '-z' },
    "W03_30": { fields: [3115, 3116, 3117, 3118], rotate: 0, position: [75, 25.17, -60.9], direction: "left", axle: '-z' },
    "W03_13": { fields: [3049, 3050, 3051, 3052], rotate: 180, position: [82, 25.17, -82], direction: "right", axle: '-z' },
    "W03_12": { fields: [3045, 3046, 3047, 3048], rotate: 180, position: [82, 25.17, -60.9], direction: "right", axle: '-z' },
    "W03_11": { fields: [3041, 3042, 3043, 3044], rotate: 180, position: [82, 25.17, -39.8], direction: "right", axle: '-z' }
  },
  "WBW03G06": {
    "W03_29": { fields: [3111, 3112, 3113, 3114], rotate: 0, position: [75, 25.17, 2.5], direction: "left", axle: '-z' },
    "W03_28": { fields: [3107, 3108, 3109, 3110], rotate: 0, position: [75, 25.17, 23.6], direction: "left", axle: '-z' },
    "W03_27": { fields: [3103, 3104, 3105, 3106], rotate: 0, position: [75, 25.17, 44.8], direction: "left", axle: '-z' },
    "W03_26": { fields: [3099, 3100, 3101, 3102], rotate: 0, position: [75, 25.17, 65.9], direction: "left", axle: '-z' },
    "W03_25": { fields: [3095, 3096, 3097, 3098], rotate: 0, position: [75, 25.17, 87], direction: "left", axle: '-z' },
    "W03_10": { fields: [3037, 3038, 3039, 3040], rotate: 180, position: [82, 25.17, 2.5], direction: "right", axle: '-z' },
    "W03_09": { fields: [3033, 3034, 3035, 3036], rotate: 180, position: [82, 25.17, 23.6], direction: "right", axle: '-z' },
    "W03_08": { fields: [3029, 3030, 3031, 3032], rotate: 180, position: [82, 25.17, 44.8], direction: "right", axle: '-z' },
    "W03_07": { fields: [3025, 3026, 3027, 3028], rotate: 180, position: [82, 25.17, 65.9], direction: "right", axle: '-z' },
    "W03_06": { fields: [3021, 3022, 3023, 3024], rotate: 180, position: [82, 25.17, 87], direction: "right", axle: '-z' }
  },
  "WBW03G04": {
    "W03_62": { fields: [3242, 3241, 3240, 3239], rotate: 0, position: [53, 25.17, 121], direction: "right", axle: 'z' },
    "W03_61": { fields: [3238, 3237, 3236, 3235], rotate: 0, position: [53, 25.17, 142], direction: "right", axle: 'z' },
    "W03_60": { fields: [3234, 3233, 3232, 3231], rotate: 0, position: [53, 25.17, 163], direction: "right", axle: 'z' },
    "W03_59": { fields: [3230, 3229, 3228, 3227], rotate: 0, position: [53, 25.17, 184], direction: "right", axle: 'z' },
    "W03_58": { fields: [3226, 3225, 3224, 3223], rotate: 0, position: [53, 25.17, 205], direction: "right", axle: 'z' },
    "W03_42": { fields: [3164, 3163, 3162, 3161], rotate: 180, position: [59.5, 25.17, 121], direction: "left", axle: 'z' },
    "W03_41": { fields: [3160, 3159, 3158, 3157], rotate: 180, position: [59.5, 25.17, 142], direction: "left", axle: 'z' },
    "W03_40": { fields: [3156, 3155, 3154, 3153], rotate: 180, position: [59.5, 25.17, 163], direction: "left", axle: 'z' },
    "W03_39": { fields: [3152, 3151, 3150, 3149], rotate: 180, position: [59.5, 25.17, 184], direction: "left", axle: 'z' },
    "W03_38": { fields: [3148, 3147, 3146, 3145], rotate: 180, position: [59.5, 25.17, 205], direction: "left", axle: 'z' }
  },
  "WBW03G05": {
    "W03_24": { fields: [3091, 3092, 3093, 3094], rotate: 0, position: [75, 25.17, 121], direction: "left", axle: '-z' },
    "W03_23": { fields: [3087, 3088, 3089, 3090], rotate: 0, position: [75, 25.17, 142], direction: "left", axle: '-z' },
    "W03_22": { fields: [3083, 3084, 3085, 3086], rotate: 0, position: [75, 25.17, 163], direction: "left", axle: '-z' },
    "W03_21": { fields: [3079, 3080, 3081, 3082], rotate: 0, position: [75, 25.17, 184], direction: "left", axle: '-z' },
    "W03_20": { fields: [3075, 3076, 3077, 3078], rotate: 0, position: [75, 25.17, 205], direction: "left", axle: '-z' },
    "W03_05": { fields: [3017, 3018, 3019, 3020], rotate: 180, position: [82, 25.17, 121], direction: "right", axle: '-z' },
    "W03_04": { fields: [3013, 3014, 3015, 3016], rotate: 180, position: [82, 25.17, 142], direction: "right", axle: '-z' },
    "W03_03": { fields: [3009, 3010, 3011, 3012], rotate: 180, position: [82, 25.17, 163], direction: "right", axle: '-z' },
    "W03_02": { fields: [3005, 3006, 3007, 3008], rotate: 180, position: [82, 25.17, 184], direction: "right", axle: '-z' },
    "W03_01": { fields: [3001, 3002, 3003, 3004], rotate: 180, position: [82, 25.17, 205], direction: "right", axle: '-z' }
  },
  "WBW04G02": {
    "W04-75": { fields: [4278, 4277, 4276, 4275], rotate: 0, position: [113, 25.17, -82], direction: "right", axle: 'z' },
    "W04-74": { fields: [4274, 4273, 4272, 4271], rotate: 0, position: [113, 25.17, -60.9], direction: "right", axle: 'z' },
    "W04-73": { fields: [4270, 4269, 4268, 4267], rotate: 0, position: [113, 25.17, -39.8], direction: "right", axle: 'z' },
    "W04-72": { fields: [4266, 4265], rotate: 0, position: [113, 25.17, -23], direction: "right", axle: 'z' },
    "W04-55": { fields: [4204, 4203, 4202, 4201], rotate: 180, position: [120, 25.17, -82], direction: "left", axle: 'z' },
    "W04-54": { fields: [4200, 4199, 4198, 4197], rotate: 180, position: [120, 25.17, -60.9], direction: "left", axle: 'z' },
    "W04-53": { fields: [4196, 4195], rotate: 180, position: [120, 25.17, -44.8], direction: "left", axle: 'z' }
  },
  "WBW04G03": {
    "W04-71": { fields: [4264, 4263, 4262, 4261], rotate: 0, position: [113, 25.17, 14], direction: "right", axle: 'z' },
    "W04-70": { fields: [4260, 4259, 4258, 4257], rotate: 0, position: [113, 25.17, 36], direction: "right", axle: 'z' },
    "W04-69": { fields: [4256, 4255, 4254, 4253], rotate: 0, position: [113, 25.17, 58], direction: "right", axle: 'z' },
    "W04-52": { fields: [4194, 4193, 4192, 4191], rotate: 180, position: [120, 25.17, 14], direction: "left", axle: 'z' },
    "W04-51": { fields: [4190, 4189, 4188, 4187], rotate: 180, position: [120, 25.17, 36], direction: "left", axle: 'z' },
    "W04-50": { fields: [4186, 4185, 4184, 4183], rotate: 180, position: [120, 25.17, 58], direction: "left", axle: 'z' }
  },
  "WBW04G04": {
    "W04-68": { fields: [4252, 4251, 4250, 4249], rotate: 0, position: [113, 25.17, 93], direction: "right", axle: 'z' },
    "W04-67": { fields: [4248, 4247, 4246, 4245], rotate: 0, position: [113, 25.17, 113.8], direction: "right", axle: 'z' },
    "W04-66": { fields: [4244, 4243, 4242, 4241], rotate: 0, position: [113, 25.17, 134.6], direction: "right", axle: 'z' },
    "W04-65": { fields: [4240, 4239, 4238, 4237], rotate: 0, position: [113, 25.17, 155.4], direction: "right", axle: 'z' },
    "W04-64": { fields: [4236, 4235, 4234, 4233], rotate: 0, position: [113, 25.17, 176.2], direction: "right", axle: 'z' },
    "W04-63": { fields: [4232, 4231, 4230, 4229], rotate: 0, position: [113, 25.17, 197], direction: "right", axle: 'z' },
    "W04-62": { fields: [4228, 4227], rotate: 0, position: [113, 25.17, 213], direction: "right", axle: 'z' },
    "W04-49": { fields: [4182, 4181, 4180, 4179], rotate: 180, position: [120, 25.17, 93], direction: "left", axle: 'z' },
    "W04-48": { fields: [4178, 4177, 4176, 4175], rotate: 180, position: [120, 25.17, 113.8], direction: "left", axle: 'z' },
    "W04-47": { fields: [4174, 4173, 4172, 4171], rotate: 180, position: [120, 25.17, 134.6], direction: "left", axle: 'z' },
    "W04-46": { fields: [4170, 4169, 4168, 4167], rotate: 180, position: [120, 25.17, 155.4], direction: "left", axle: 'z' },
    "W04-45": { fields: [4166, 4165, 4164, 4163], rotate: 180, position: [120, 25.17, 176.2], direction: "left", axle: 'z' },
    "W04-44": { fields: [4162, 4161, 4160, 4159], rotate: 180, position: [120, 25.17, 197], direction: "left", axle: 'z' },
    "W04-43": { fields: [4158, 4157], rotate: 180, position: [120, 25.17, 213], direction: "left", axle: 'z' }
  },
  "WBW04G05": {
    "W04-28": { fields: [4101, 4102, 4103, 4104], rotate: 0, position: [136, 25.17, 93], direction: "left", axle: '-z' },
    "W04-27": { fields: [4097, 4098, 4099, 4100], rotate: 0, position: [136, 25.17, 113.8], direction: "left", axle: '-z' },
    "W04-26": { fields: [4093, 4094, 4095, 4096], rotate: 0, position: [136, 25.17, 134.6], direction: "left", axle: '-z' },
    "W04-25": { fields: [4089, 4090, 4091, 4092], rotate: 0, position: [136, 25.17, 155.4], direction: "left", axle: '-z' },
    "W04-24": { fields: [4085, 4086, 4087, 4088], rotate: 0, position: [136, 25.17, 176.2], direction: "left", axle: '-z' },
    "W04-23": { fields: [4081, 4082, 4083, 4084], rotate: 0, position: [136, 25.17, 197], direction: "left", axle: '-z' },
    "W04-22": { fields: [4079, 4080], rotate: 0, position: [136, 25.17, 213], direction: "left", axle: '-z' },
    "W04-07": { fields: [4023, 4024, 4025, 4026], rotate: 180, position: [143, 25.17, 93], direction: "right", axle: '-z' },
    "W04-06": { fields: [4019, 4020, 4021, 4022], rotate: 180, position: [143, 25.17, 113.8], direction: "right", axle: '-z' },
    "W04-05": { fields: [4015, 4016, 4017, 4018], rotate: 180, position: [143, 25.17, 134.6], direction: "right", axle: '-z' },
    "W04-04": { fields: [4011, 4012, 4013, 4014], rotate: 180, position: [143, 25.17, 155.4], direction: "right", axle: '-z' },
    "W04-03": { fields: [4007, 4008, 4009, 4010], rotate: 180, position: [143, 25.17, 176.2], direction: "right", axle: '-z' },
    "W04-02": { fields: [4001, 4002, 4003, 4004], rotate: 180, position: [143, 25.17, 197], direction: "right", axle: '-z' },
    "W04-01": { fields: [4001, 4002], rotate: 180, position: [143, 25.17, 213], direction: "right", axle: '-z' }
  },
  "WBW04G06": {
    "W04-32": { fields: [4115, 4116, 4117, 4118], rotate: 0, position: [136, 25.17, 4], direction: "left", axle: '-z' },
    "W04-31": { fields: [4111, 4112, 4113, 4114], rotate: 0, position: [136, 25.17, 25.5], direction: "left", axle: '-z' },
    "W04-30": { fields: [4107, 4108, 4109, 4110], rotate: 0, position: [136, 25.17, 47], direction: "left", axle: '-z' },
    "W04-29": { fields: [4105, 4106], rotate: 0, position: [136, 25.17, 63.5], direction: "left", axle: '-z' },
    "W04-11": { fields: [4037, 4038, 4039, 4040], rotate: 180, position: [143, 25.17, 4], direction: "right", axle: '-z' },
    "W04-10": { fields: [4033, 4034, 4035, 4036], rotate: 180, position: [143, 25.17, 25.5], direction: "right", axle: '-z' },
    "W04-09": { fields: [4029, 4030, 4031, 4032], rotate: 180, position: [143, 25.17, 47], direction: "right", axle: '-z' },
    "W04-08": { fields: [4027, 4028], rotate: 180, position: [143, 25.17, 63.5], direction: "right", axle: '-z' }
  },
  "WBW04G07": {
    "W04-36": { fields: [4131, 4132, 4133, 4134], rotate: 0, position: [136, 25.17, -82], direction: "left", axle: '-z' },
    "W04-35": { fields: [4127, 4128, 4129, 4130], rotate: 0, position: [136, 25.17, -60.5], direction: "left", axle: '-z' },
    "W04-34": { fields: [4123, 4124, 4125, 4126], rotate: 0, position: [136, 25.17, -39], direction: "left", axle: '-z' },
    "W04-33": { fields: [4119, 4120, 4121, 4122], rotate: 0, position: [136, 25.17, -17.5], direction: "left", axle: '-z' },
    "W04-15": { fields: [4053, 4054, 4055, 4056], rotate: 180, position: [143, 25.17, -82], direction: "right", axle: '-z' },
    "W04-14": { fields: [4049, 4050, 4051, 4052], rotate: 180, position: [143, 25.17, -60.5], direction: "right", axle: '-z' },
    "W04-13": { fields: [4045, 4046, 4047, 4048], rotate: 180, position: [143, 25.17, -39], direction: "right", axle: '-z' },
    "W04-12": { fields: [4041, 4042, 4043, 4044], rotate: 180, position: [143, 25.17, -17.5], direction: "right", axle: '-z' }
  },
  "WBW05G04": {
    "W05-68": { fields: [5751, 5750, 5749, 5748], rotate: 0, position: [175, 25.17, 93], direction: "right", axle: 'z' },
    "W05-67": { fields: [5747, 5746, 5745, 5744], rotate: 0, position: [175, 25.17, 113.8], direction: "right", axle: 'z' },
    "W05-66": { fields: [5743, 5742, 5741, 5740], rotate: 0, position: [175, 25.17, 134.6], direction: "right", axle: 'z' },
    "W05-65": { fields: [5739, 5738, 5737, 5736], rotate: 0, position: [175, 25.17, 155.4], direction: "right", axle: 'z' },
    "W05-64": { fields: [5735, 5734, 5733, 5732], rotate: 0, position: [175, 25.17, 176.2], direction: "right", axle: 'z' },
    "W05-63": { fields: [5731, 5730, 5729, 5728], rotate: 0, position: [175, 25.17, 197], direction: "right", axle: 'z' },
    "W05-62": { fields: [5727, 5726], rotate: 0, position: [175, 25.17, 213], direction: "right", axle: 'z' },
    "W05-49": { fields: [5681, 5680, 5679, 5678], rotate: 180, position: [181, 25.17, 93], direction: "left", axle: 'z' },
    "W05-48": { fields: [5677, 5676, 5675, 5674], rotate: 180, position: [181, 25.17, 113.8], direction: "left", axle: 'z' },
    "W05-47": { fields: [5673, 5672, 5671, 5670], rotate: 180, position: [181, 25.17, 134.6], direction: "left", axle: 'z' },
    "W05-46": { fields: [5669, 5668, 5667, 5666], rotate: 180, position: [181, 25.17, 155.4], direction: "left", axle: 'z' },
    "W05-45": { fields: [5665, 5664, 5663, 5662], rotate: 180, position: [181, 25.17, 176.2], direction: "left", axle: 'z' },
    "W05-44": { fields: [5661, 5660, 5659, 5658], rotate: 180, position: [181, 25.17, 197], direction: "left", axle: 'z' },
    "W05-43": { fields: [5657, 5656], rotate: 180, position: [181, 25.17, 213], direction: "left", axle: 'z' }
  },
  "WBW05G05": {
    "W05-28": { fields: [5600, 5601, 5602, 5603], rotate: 0, position: [197, 25.17, 93], direction: "left", axle: '-z' },
    "W05-27": { fields: [5596, 5597, 5598, 5599], rotate: 0, position: [197, 25.17, 113.8], direction: "left", axle: '-z' },
    "W05-26": { fields: [5592, 5593, 5594, 5595], rotate: 0, position: [197, 25.17, 134.6], direction: "left", axle: '-z' },
    "W05-25": { fields: [5588, 5589, 5590, 5591], rotate: 0, position: [197, 25.17, 155.4], direction: "left", axle: '-z' },
    "W05-24": { fields: [5584, 5585, 5586, 5587], rotate: 0, position: [197, 25.17, 176.2], direction: "left", axle: '-z' },
    "W05-23": { fields: [5580, 5581, 5582, 5583], rotate: 0, position: [197, 25.17, 197], direction: "left", axle: '-z' },
    "W05-22": { fields: [5578, 5579], rotate: 0, position: [197, 25.17, 213], direction: "left", axle: '-z' },
    "W05-07": { fields: [5522, 5523, 5524, 5525], rotate: 180, position: [203, 25.17, 93], direction: "right", axle: '-z' },
    "W05-06": { fields: [5518, 5519, 5520, 5521], rotate: 180, position: [203, 25.17, 113.8], direction: "right", axle: '-z' },
    "W05-05": { fields: [5514, 5515, 5516, 5517], rotate: 180, position: [203, 25.17, 134.6], direction: "right", axle: '-z' },
    "W05-04": { fields: [5510, 5511, 5512, 5513], rotate: 180, position: [203, 25.17, 155.4], direction: "right", axle: '-z' },
    "W05-03": { fields: [5506, 5507, 5508, 5509], rotate: 180, position: [203, 25.17, 176.2], direction: "right", axle: '-z' },
    "W05-02": { fields: [5502, 5503, 5504, 5505], rotate: 180, position: [203, 25.17, 197], direction: "right", axle: '-z' },
    "W05-01": { fields: [5500, 5501], rotate: 180, position: [203, 25.17, 213], direction: "right", axle: '-z' }
  },
  "WBW05G02": {
    "W05-75": { fields: [5777, 5776, 5775, 5774], rotate: 0, position: [175, 25.17, -82], direction: "right", axle: 'z' },
    "W05-74": { fields: [5773, 5772, 5771, 5770], rotate: 0, position: [175, 25.17, -60.9], direction: "right", axle: 'z' },
    "W05-73": { fields: [5769, 5768, 5767, 5766], rotate: 0, position: [175, 25.17, -39.8], direction: "right", axle: 'z' },
    "W05-72": { fields: [5765, 5764], rotate: 0, position: [175, 25.17, -23], direction: "right", axle: 'z' },
    "W05-55": { fields: [5703, 5702, 5701, 5700], rotate: 180, position: [181, 25.17, -82], direction: "left", axle: 'z' },
    "W05-54": { fields: [5699, 5698, 5697, 5696], rotate: 180, position: [181, 25.17, -60.9], direction: "left", axle: 'z' },
    "W05-53": { fields: [5695, 5694], rotate: 180, position: [181, 25.17, -44.8], direction: "left", axle: 'z' }
  },
  "WBW05G03": {
    "W05-71": { fields: [5763, 5762, 5761, 5760], rotate: 0, position: [175, 25.17, 14], direction: "right", axle: 'z' },
    "W05-70": { fields: [5759, 5758, 5757, 5756], rotate: 0, position: [175, 25.17, 36], direction: "right", axle: 'z' },
    "W05-69": { fields: [5755, 5754, 5753, 5752], rotate: 0, position: [175, 25.17, 58], direction: "right", axle: 'z' },
    "W05-52": { fields: [5693, 5692, 5691, 5690], rotate: 180, position: [181, 25.17, 14], direction: "left", axle: 'z' },
    "W05-51": { fields: [5689, 5688, 5687, 5686], rotate: 180, position: [181, 25.17, 36], direction: "left", axle: 'z' },
    "W05-50": { fields: [5685, 5684, 5683, 5682], rotate: 180, position: [181, 25.17, 58], direction: "left", axle: 'z' }
  },
  "WBW05G06": {
    "W05-32": { fields: [5614, 5615, 5616, 5617], rotate: 0, position: [197, 25.17, 4], direction: "left", axle: '-z' },
    "W05-31": { fields: [5610, 5611, 5612, 5613], rotate: 0, position: [197, 25.17, 25.5], direction: "left", axle: '-z' },
    "W05-30": { fields: [5606, 5607, 5608, 5609], rotate: 0, position: [197, 25.17, 47], direction: "left", axle: '-z' },
    "W05-29": { fields: [5604, 5605], rotate: 0, position: [197, 25.17, 63.5], direction: "left", axle: '-z' },
    "W05-11": { fields: [5536, 5537, 5538, 5539], rotate: 180, position: [203, 25.17, 4], direction: "right", axle: '-z' },
    "W05-10": { fields: [5532, 5533, 5534, 5535], rotate: 180, position: [203, 25.17, 25.5], direction: "right", axle: '-z' },
    "W05-09": { fields: [5528, 5529, 5530, 5531], rotate: 180, position: [203, 25.17, 47], direction: "right", axle: '-z' },
    "W05-08": { fields: [5526, 5527], rotate: 180, position: [203, 25.17, 63.5], direction: "right", axle: '-z' }
  },
  "WBW05G07": {
    "W05-36": { fields: [5630, 5631, 5632, 5633], rotate: 0, position: [197, 25.17, -82], direction: "left", axle: '-z' },
    "W05-35": { fields: [5626, 5627, 5628, 5629], rotate: 0, position: [197, 25.17, -60.5], direction: "left", axle: '-z' },
    "W05-34": { fields: [5622, 5623, 5624, 5625], rotate: 0, position: [197, 25.17, -39], direction: "left", axle: '-z' },
    "W05-33": { fields: [5618, 5619, 5620, 5621], rotate: 0, position: [197, 25.17, -17.5], direction: "left", axle: '-z' },
    "W05-15": { fields: [5552, 5553, 5554, 5555], rotate: 180, position: [203, 25.17, -82], direction: "right", axle: '-z' },
    "W05-14": { fields: [5548, 5549, 5550, 5551], rotate: 180, position: [203, 25.17, -60.5], direction: "right", axle: '-z' },
    "W05-13": { fields: [5544, 5545, 5546, 5547], rotate: 180, position: [203, 25.17, -39], direction: "right", axle: '-z' },
    "W05-12": { fields: [5540, 5541, 5542, 5543], rotate: 180, position: [203, 25.17, -17.5], direction: "right", axle: '-z' }
  }
}


const deviceTypeMap = [
  { label: 'WSORA', modelName: 'WS0RA01' },
  { label: 'WMACB', modelName: 'WMACB03' },
  { label: 'WROMA', modelName: '2LPjitai(W01)' },
  { label: 'WHWSA', modelName: 'WHWSA01' },
  { label: 'WBS', modelName: 'WBS002' },
  { label: 'WWS', modelName: 'WSSP008' },
  { label: 'WWATA', modelName: 'WWATA02V' },
  { label: 'WTSTK', modelName: 'WTSTK01' },
  { label: 'WOLUS', modelName: 'OLUS' },
  { label: 'WSORB', modelName: 'WTSTK01' },
  { label: 'WWSPP', modelName: '' },
  { label: 'WWAPA', modelName: '' }
]

const pointCoordinateMap = window.pointCoordinateMap

export const DATA = {
  pointCoordinateMap,
  skyCarMap,
  skyCarStateColorMap,
  shelvesMap,
  deviceMap,
  deviceTypeMap,
  deviceMapArray
}
window.DATA = DATA