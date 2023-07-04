
// 坐标和轨道映射
const pointCoordinateMap = [
  { name: '14_13', direction: 'x', startPoint: 14, endPoint: 13, startCoordinate: 171829, endCoordinate: 174100 },
  { name: '14_15', direction: '-z', startPoint: 14, endPoint: 15, startCoordinate: 171600, endCoordinate: 171828 },
  { name: '16_17', direction: 'z', startPoint: 16, endPoint: 17, startCoordinate: 180000, endCoordinate: 180900 },
  { name: '18_17', direction: '-x', startPoint: 18, endPoint: 17, startCoordinate: 274340, endCoordinate: 276160 },
  { name: '18_19', direction: '-z', startPoint: 18, endPoint: 19, startCoordinate: 273381, endCoordinate: 274240 },
  { name: '13_21', direction: 'z', startPoint: 13, endPoint: 21, startCoordinate: 79001, endCoordinate: 90020 },
  { name: '21_22', direction: 'x', startPoint: 21, endPoint: 22, startCoordinate: 174926, endCoordinate: 177268 },
  { name: '22_14', direction: '-z', startPoint: 22, endPoint: 14, startCoordinate: 159621, endCoordinate: 170660 },
  { name: '17_23', direction: 'z', startPoint: 17, endPoint: 23, startCoordinate: 180901, endCoordinate: 192980 },
  { name: '23_24', direction: 'x', startPoint: 23, endPoint: 24, startCoordinate: 277000, endCoordinate: 278840 },
  { name: '24_18', direction: '-z', startPoint: 24, endPoint: 18, startCoordinate: 261301, endCoordinate: 273380 },
  { name: '21_25', direction: 'z', startPoint: 21, endPoint: 25, startCoordinate: 90021, endCoordinate: 112140 },
  { name: '26_22', direction: '-z', startPoint: 26, endPoint: 22, startCoordinate: 137560, endCoordinate: 159620 },
  { name: '26_25', direction: '-x', startPoint: 26, endPoint: 25, startCoordinate: 177269, endCoordinate: 179200 },
  { name: '25_29', direction: 'z', startPoint: 25, endPoint: 29, startCoordinate: 112141, endCoordinate: 118100 },
  { name: '29_30', direction: 'z', startPoint: 29, endPoint: 30, startCoordinate: 118200, endCoordinate: 119100 },
  { name: '30_31', direction: 'z', startPoint: 30, endPoint: 31, startCoordinate: 119200, endCoordinate: 122280 },
  { name: '31_34', direction: 'x', startPoint: 31, endPoint: 34, startCoordinate: 123360, endCoordinate: 125642 },
  { name: '34_26', direction: '-z', startPoint: 34, endPoint: 26, startCoordinate: 126661, endCoordinate: 136550 },
  { name: '31_32', direction: 'z', startPoint: 31, endPoint: 32, startCoordinate: 122281, endCoordinate: 123280 },
  { name: '33_34', direction: '-z', startPoint: 33, endPoint: 34, startCoordinate: 125700, endCoordinate: 126660 },
  { name: '33_32', direction: '-x', startPoint: 33, endPoint: 32, startCoordinate: 399320, endCoordinate: 401660 },
  { name: '23_27', direction: 'z', startPoint: 23, endPoint: 27, startCoordinate: 192981, endCoordinate: 213320 },
  { name: '28_27', direction: '-x', startPoint: 28, endPoint: 27, startCoordinate: 279000, endCoordinate: 280820 },
  { name: '28_24', direction: '-z', startPoint: 28, endPoint: 24, startCoordinate: 240961, endCoordinate: 261300 },
  { name: '27_35', direction: 'z', startPoint: 27, endPoint: 35, startCoordinate: 213321, endCoordinate: 225140 },
  { name: '35_38', direction: 'x', startPoint: 35, endPoint: 38, startCoordinate: 226200, endCoordinate: 228040 },
  { name: '38_28', direction: '-z', startPoint: 38, endPoint: 28, startCoordinate: 229101, endCoordinate: 240960 },
  { name: '35_36', direction: 'z', startPoint: 35, endPoint: 36, startCoordinate: 225141, endCoordinate: 226120 },
  { name: '37_38', direction: '-z', startPoint: 37, endPoint: 38, startCoordinate: 228140, endCoordinate: 229100 },
  { name: '37_36', direction: '-x', startPoint: 37, endPoint: 36, startCoordinate: 391600, endCoordinate: 393540 },
  { name: '36_33', direction: '-x', startPoint: 36, endPoint: 33, startCoordinate: 393640, endCoordinate: 399220 },
  { name: '32_39', direction: '-x', startPoint: 32, endPoint: 39, startCoordinate: 401740, endCoordinate: 402680 },
  { name: '39_40', direction: 'z', startPoint: 39, endPoint: 40, startCoordinate: 402681, endCoordinate: 404880 },
  { name: '40_43', direction: 'x', startPoint: 40, endPoint: 43, startCoordinate: 404881, endCoordinate: 406140 },
  { name: '43_44', direction: 'x', startPoint: 43, endPoint: 44, startCoordinate: 406220, endCoordinate: 409820 },
  { name: '44_47', direction: 'x', startPoint: 44, endPoint: 47, startCoordinate: 409960, endCoordinate: 416120 },
  { name: '47_48', direction: 'x', startPoint: 47, endPoint: 48, startCoordinate: 416220, endCoordinate: 420020 },
  { name: '48_49', direction: 'x', startPoint: 48, endPoint: 49, startCoordinate: 420100, endCoordinate: 424340 },
  { name: '49_50', direction: '-z', startPoint: 49, endPoint: 50, startCoordinate: 841000, endCoordinate: 841580 },
  { name: '50_37', direction: '', startPoint: 50, endPoint: 37, startCoordinate: 384000, endCoordinate: 391520 },
  { name: '41_42', direction: 'x', startPoint: 41, endPoint: 42, startCoordinate: 829000, endCoordinate: 834720 },
  { name: '45_46', direction: 'x', startPoint: 45, endPoint: 46, startCoordinate: 834900, endCoordinate: 840820 },
  { name: '29_51', direction: '-x', startPoint: 29, endPoint: 51, startCoordinate: 281000, endCoordinate: 287060 },
  { name: '51_54', direction: '-z', startPoint: 51, endPoint: 54, startCoordinate: 287061, endCoordinate: 289880 },
  { name: '54_56', direction: '-z', startPoint: 54, endPoint: 56, startCoordinate: 289881, endCoordinate: 316800 },
  { name: '56_55', direction: '-x', startPoint: 56, endPoint: 55, startCoordinate: 381000, endCoordinate: 381960 },
  { name: '55_73', direction: 'z', startPoint: 55, endPoint: 73, startCoordinate: 343000, endCoordinate: 346780 },
  { name: '73_74', direction: 'z', startPoint: 73, endPoint: 74, startCoordinate: 346880, endCoordinate: 348640 },
  { name: '74_72', direction: 'z', startPoint: 74, endPoint: 72, startCoordinate: 348740, endCoordinate: 353500 },
  { name: '72_71', direction: 'z', startPoint: 72, endPoint: 71, startCoordinate: 353600, endCoordinate: 354900 },
  { name: '71_53', direction: 'z', startPoint: 71, endPoint: 53, startCoordinate: 355000, endCoordinate: 368200 },
  { name: '53_54', direction: 'x', startPoint: 53, endPoint: 54, startCoordinate: 382100, endCoordinate: 383060 },
  { name: '53_52', direction: 'z', startPoint: 53, endPoint: 52, startCoordinate: 368201, endCoordinate: 371700 },
  { name: '52_30', direction: 'x', startPoint: 52, endPoint: 30, startCoordinate: 371701, endCoordinate: 380220 },
  { name: '72_66', direction: '-x', startPoint: 72, endPoint: 66, startCoordinate: 19000, endCoordinate: 19980 },
  { name: '66_67', direction: '-x', startPoint: 66, endPoint: 67, startCoordinate: 19981, endCoordinate: 30800 },
  { name: '67_68', direction: 'z', startPoint: 67, endPoint: 68, startCoordinate: 30801, endCoordinate: 34600 },
  { name: '68_69', direction: 'x', startPoint: 68, endPoint: 69, startCoordinate: 34601, endCoordinate: 37400 },
  { name: '69_70', direction: '-x', startPoint: 69, endPoint: 70, startCoordinate: 37401, endCoordinate: 39020 },
  { name: '70_64', direction: 'x', startPoint: 70, endPoint: 64, startCoordinate: 39021, endCoordinate: 42360 },
  { name: '64_63', direction: 'x', startPoint: 64, endPoint: 63, startCoordinate: 42440, endCoordinate: 43420 },
  { name: '63_65', direction: 'x', startPoint: 63, endPoint: 65, startCoordinate: 43540, endCoordinate: 45060 },
  { name: '1_4', direction: '-x', startPoint: 1, endPoint: 4, startCoordinate: 854000, endCoordinate: 869240 },
  { name: '4_5', direction: '-x', startPoint: 4, endPoint: 5, startCoordinate: 869440, endCoordinate: 872740 },
  { name: '5_8', direction: '-x', startPoint: 5, endPoint: 8, startCoordinate: 872880, endCoordinate: 877680 },
  { name: '8_9', direction: '-x', startPoint: 8, endPoint: 9, startCoordinate: 877820, endCoordinate: 881400 },
  { name: '9_10', direction: '-x', startPoint: 9, endPoint: 10, startCoordinate: 881540, endCoordinate: 885100 },
  { name: '10_11', direction: 'z', startPoint: 10, endPoint: 11, startCoordinate: 852000, endCoordinate: 852580 },
  { name: '11_12', direction: 'x', startPoint: 11, endPoint: 12, startCoordinate: 917000, endCoordinate: 921120 },
  { name: '12_15', direction: 'x', startPoint: 12, endPoint: 15, startCoordinate: 921121, endCoordinate: 924080 },
  { name: '15_16', direction: 'x', startPoint: 15, endPoint: 16, startCoordinate: 924180, endCoordinate: 929300 },
  { name: '16_19', direction: 'x', startPoint: 16, endPoint: 19, startCoordinate: 929301, endCoordinate: 931800 },
  { name: '19_20', direction: '', startPoint: 19, endPoint: 20, startCoordinate: 931900, endCoordinate: 945540 },
  { name: '20_1', direction: '-z', startPoint: 20, endPoint: 1, startCoordinate: 852700, endCoordinate: 853280 },
  { name: '2_3', direction: '-x', startPoint: 2, endPoint: 3, startCoordinate: 842000, endCoordinate: 846640 },
  { name: '6_7', direction: '-x', startPoint: 6, endPoint: 7, startCoordinate: 846800, endCoordinate: 851720 },
  { name: '12_13', direction: 'z', startPoint: 12, endPoint: 13, startCoordinate: 78000, endCoordinate: 79000 },
  { name: '65_66', direction: '-x', startPoint: 65, endPoint: 66, startCoordinate: 46140, endCoordinate: 47340 },
  { name: '65_71', direction: 'x', startPoint: 65, endPoint: 71, startCoordinate: 45061, endCoordinate: 46060 },
  { name: '73_75', direction: '-x', startPoint: 73, endPoint: 75, startCoordinate: 48000, endCoordinate: 48160 },
  { name: '75_76', direction: '-x', startPoint: 75, endPoint: 76, startCoordinate: 48161, endCoordinate: 49680 },
  { name: '76_77', direction: '-x', startPoint: 76, endPoint: 77, startCoordinate: 49681, endCoordinate: 51040 },
  { name: '77_78', direction: '-x', startPoint: 77, endPoint: 78, startCoordinate: 51041, endCoordinate: 59920 },
  { name: '78_79', direction: 'z', startPoint: 78, endPoint: 79, startCoordinate: 59921, endCoordinate: 63700 },
  { name: '79_80', direction: 'x', startPoint: 79, endPoint: 80, startCoordinate: 63701, endCoordinate: 75200 },
  { name: '80_75', direction: '-z', startPoint: 80, endPoint: 75, startCoordinate: 75520, endCoordinate: 77180 },
  { name: '80_74', direction: 'x', startPoint: 80, endPoint: 74, startCoordinate: 75201, endCoordinate: 75420 },
  { name: '4_2', direction: '-x', startPoint: 4, endPoint: 2, startCoordinate: 0, endCoordinate: 0 },
  { name: '46_48', direction: '-z', startPoint: 46, endPoint: 48, startCoordinate: 0, endCoordinate: 0 },
  { name: '3_5', direction: 'z', startPoint: 3, endPoint: 5, startCoordinate: 0, endCoordinate: 0 },
  { name: '8_6', direction: '-x', startPoint: 8, endPoint: 6, startCoordinate: 0, endCoordinate: 0 },
  { name: '7_9', direction: '-x', startPoint: 7, endPoint: 9, startCoordinate: 0, endCoordinate: 0 },
  { name: '43_41', direction: 'z', startPoint: 43, endPoint: 41, startCoordinate: 0, endCoordinate: 0 },
  { name: '42_44', direction: '-z', startPoint: 42, endPoint: 44, startCoordinate: 0, endCoordinate: 0 },
  { name: '47_45', direction: 'z', startPoint: 47, endPoint: 45, startCoordinate: 0, endCoordinate: 0 },

  { name: '115_114', direction: '-x', startPoint: 115, endPoint: 114, startCoordinate: 386300, endCoordinate: 388280 },
  { name: '118_115', direction: '-x', startPoint: 118, endPoint: 115, startCoordinate: 822200, endCoordinate: 825320 },
  { name: '88_85', direction: '-z', startPoint: 88, endPoint: 85, startCoordinate: 1557291, endCoordinate: 1567160 },
  { name: '93_94', direction: 'z', startPoint: 93, endPoint: 94, startCoordinate: 1570000, endCoordinate: 1578640 },
  { name: '105_109', direction: 'z', startPoint: 105, endPoint: 109, startCoordinate: 1353761, endCoordinate: 1370700 },
  { name: '113_116', direction: 'x', startPoint: 113, endPoint: 116, startCoordinate: 1386200, endCoordinate: 1388040 },
  { name: '115_116', direction: '-z', startPoint: 115, endPoint: 116, startCoordinate: 1388140, endCoordinate: 1388280 },
  { name: '112_108', direction: '-z', startPoint: 112, endPoint: 108, startCoordinate: 1506421, endCoordinate: 1523360 },
  { name: '120_112', direction: '-z', startPoint: 120, endPoint: 112, startCoordinate: 1491141, endCoordinate: 1506420 },
  { name: '58_59', direction: '-z', startPoint: 58, endPoint: 59, startCoordinate: 8461, endCoordinate: 11240 },
  { name: '95_93', direction: '-x', startPoint: 95, endPoint: 93, startCoordinate: 0, endCoordinate: 0 },
  { name: '94_96', direction: 'x', startPoint: 94, endPoint: 96, startCoordinate: 0, endCoordinate: 0 },
  { name: '119_118', direction: '-x', startPoint: 119, endPoint: 118, startCoordinate: 820100, endCoordinate: 822040 },
  { name: '86_89', direction: 'x', startPoint: 86, endPoint: 89, startCoordinate: 902000, endCoordinate: 905640 },
  { name: '56_91', direction: '-z', startPoint: 56, endPoint: 91, startCoordinate: 317601, endCoordinate: 327260 },
  { name: '101_104', direction: 'x', startPoint: 101, endPoint: 104, startCoordinate: 940380, endCoordinate: 942320 },
  { name: '104_20', direction: 'x', startPoint: 104, endPoint: 20, startCoordinate: 942420, endCoordinate: 945540 },
  { name: '62_57', direction: 'z', startPoint: 62, endPoint: 57, startCoordinate: 17851, endCoordinate: 17900 },
  { name: '99_100', direction: '-z', startPoint: 99, endPoint: 100, startCoordinate: 1433741, endCoordinate: 1433960 },
  { name: '64_61', direction: 'z', startPoint: 64, endPoint: 61, startCoordinate: 17500, endCoordinate: 17820 },
  { name: '57_58', direction: 'x', startPoint: 57, endPoint: 58, startCoordinate: 2200, endCoordinate: 8460 },
  { name: '96_55', direction: 'z', startPoint: 96, endPoint: 55, startCoordinate: 341980, endCoordinate: 342140 },
  { name: '91_90', direction: '-x', startPoint: 91, endPoint: 90, startCoordinate: 329000, endCoordinate: 329960 },
  { name: '98_105', direction: 'z', startPoint: 98, endPoint: 105, startCoordinate: 1340141, endCoordinate: 1353760 },
  { name: '114_37', direction: '-x', startPoint: 114, endPoint: 37, startCoordinate: 388380, endCoordinate: 391520 },
  { name: '83_86', direction: 'x', startPoint: 83, endPoint: 86, startCoordinate: 901000, endCoordinate: 901700 },
  { name: '89_92', direction: 'x', startPoint: 89, endPoint: 92, startCoordinate: 906000, endCoordinate: 907060 },
  { name: '87_88', direction: 'x', startPoint: 87, endPoint: 88, startCoordinate: 1555141, endCoordinate: 1557290 },
  { name: '90_95', direction: 'z', startPoint: 90, endPoint: 95, startCoordinate: 330261, endCoordinate: 332880 },
  { name: '91_92', direction: '-z', startPoint: 91, endPoint: 92, startCoordinate: 327261, endCoordinate: 327640 },
  { name: '97_100', direction: 'x', startPoint: 97, endPoint: 100, startCoordinate: 935120, endCoordinate: 937060 },
  { name: '100_101', direction: 'x', startPoint: 100, endPoint: 101, startCoordinate: 937160, endCoordinate: 940280 },
  { name: '113_114', direction: 'z', startPoint: 113, endPoint: 114, startCoordinate: 1385641, endCoordinate: 1385820 },
  { name: '103_104', direction: '-z', startPoint: 103, endPoint: 104, startCoordinate: 1536611, endCoordinate: 1536820 },
  { name: '61_62', direction: '-x', startPoint: 61, endPoint: 62, startCoordinate: 17821, endCoordinate: 17850 },
  { name: '10_81', direction: '-x', startPoint: 10, endPoint: 81, startCoordinate: 885101, endCoordinate: 895580 },
  { name: '81_82', direction: 'z', startPoint: 81, endPoint: 82, startCoordinate: 895581, endCoordinate: 897720 },
  { name: '84_87', direction: 'z', startPoint: 84, endPoint: 87, startCoordinate: 1545261, endCoordinate: 1555140 },
  { name: '89_90', direction: 'z', startPoint: 89, endPoint: 90, startCoordinate: 330000, endCoordinate: 330260 },
  { name: '97_98', direction: 'z', startPoint: 97, endPoint: 98, startCoordinate: 1340000, endCoordinate: 1340140 },
  { name: '60_63', direction: '-z', startPoint: 60, endPoint: 63, startCoordinate: 1700, endCoordinate: 17320 },
  { name: '99_98', direction: '-x', startPoint: 99, endPoint: 98, startCoordinate: 1435000, endCoordinate: 1436840 },
  { name: '110_109', direction: '-x', startPoint: 110, endPoint: 109, startCoordinate: 1439000, endCoordinate: 1440840 },
  { name: '101_102', direction: 'z', startPoint: 101, endPoint: 102, startCoordinate: 1442000, endCoordinate: 1442150 },
  { name: '108_103', direction: '-z', startPoint: 108, endPoint: 103, startCoordinate: 1523361, endCoordinate: 1536610 },
  { name: '117_120', direction: 'x', startPoint: 117, endPoint: 120, startCoordinate: 1489000, endCoordinate: 1490840 },
  { name: '119_120', direction: '-z', startPoint: 119, endPoint: 120, startCoordinate: 1491000, endCoordinate: 1491140 },
  { name: '50_119', direction: '-x', startPoint: 50, endPoint: 119, startCoordinate: 817000, endCoordinate: 819960 },
  { name: '82_83', direction: 'x', startPoint: 82, endPoint: 83, startCoordinate: 897721, endCoordinate: 899980 },
  { name: '92_11', direction: 'x', startPoint: 92, endPoint: 11, startCoordinate: 915440, endCoordinate: 916999 },
  { name: '83_84', direction: 'z', startPoint: 83, endPoint: 84, startCoordinate: 1545000, endCoordinate: 1545260 },
  { name: '85_84', direction: '-x', startPoint: 85, endPoint: 84, startCoordinate: 1569000, endCoordinate: 1569600 },
  { name: '95_96', direction: 'z', startPoint: 95, endPoint: 96, startCoordinate: 333000, endCoordinate: 338780 },
  { name: '19_97', direction: 'x', startPoint: 19, endPoint: 97, startCoordinate: 931900, endCoordinate: 935020 },
  { name: '106_99', direction: '-z', startPoint: 106, endPoint: 99, startCoordinate: 1420371, endCoordinate: 1433740 },
  { name: '110_106', direction: '-z', startPoint: 110, endPoint: 106, startCoordinate: 1403401, endCoordinate: 1420370 },
  { name: '109_113', direction: 'z', startPoint: 109, endPoint: 113, startCoordinate: 1370701, endCoordinate: 1385640 },
  { name: '103_102', direction: '-x', startPoint: 103, endPoint: 102, startCoordinate: 1538000, endCoordinate: 1539820 },
  { name: '107_111', direction: 'z', startPoint: 107, endPoint: 111, startCoordinate: 1455691, endCoordinate: 1472890 },
  { name: '112_111', direction: '-x', startPoint: 112, endPoint: 111, startCoordinate: 1542000, endCoordinate: 1543840 },
  { name: '117_118', direction: 'z', startPoint: 117, endPoint: 118, startCoordinate: 1487831, endCoordinate: 1487980 },
  { name: '85_86', direction: '-z', startPoint: 85, endPoint: 86, startCoordinate: 1567161, endCoordinate: 1567480 },
  { name: '116_110', direction: '-z', startPoint: 116, endPoint: 110, startCoordinate: 1388281, endCoordinate: 1403400 },
  { name: '102_107', direction: 'z', startPoint: 102, endPoint: 107, startCoordinate: 1442151, endCoordinate: 1456910 },
  { name: '107_108', direction: 'x', startPoint: 107, endPoint: 108, startCoordinate: 1540000, endCoordinate: 1541840 },
  { name: '111_117', direction: 'z', startPoint: 111, endPoint: 117, startCoordinate: 1472891, endCoordinate: 1487830 },
  { name: '60_61', direction: '-x', startPoint: 60, endPoint: 61, startCoordinate: 12780, endCoordinate: 13780 },
  { name: '105_106', direction: 'x', startPoint: 105, endPoint: 106, startCoordinate: 1437000, endCoordinate: 1438840 },
  { name: '59_60', direction: '-x', startPoint: 59, endPoint: 60, startCoordinate: 11241, endCoordinate: 12700 }
]

// 暂时摆一下设备位置
const deviceMap = {
  'WWATA02V': [
    { rotate: 0, position: [82, 0, -215] },
    { rotate: 0, position: [82, 0, -133] },
    { rotate: 0, position: [82, 0, -92] },
    { rotate: 0, position: [82, 0, -51] },
    { rotate: 0, position: [82, 0, -10] },
    { rotate: 0, position: [82, 0, 31] },
    { rotate: 0, position: [82, 0, 72] },
  ],
  'WWATA03V': [
    { rotate: 0, position: [82, 0, -174] }
  ],
  // 对应 cad 图上应该是 WWSP008
  'WSSP008': [
    // 从左到右依次排列。空行为分割
    { rotate: 0, position: [60, 0, 92] },
    { rotate: 0, position: [60, 0, 40] },
    { rotate: 0, position: [60, 0, -11] },
    { rotate: 0, position: [60, 0, -62] },
    { rotate: 0, position: [60, 0, -113] },
    { rotate: 0, position: [60, 0, -164] },
    { rotate: 0, position: [60, 0, -215] },


    { rotate: 0, position: [117, 0, -217] },
    { rotate: 0, position: [117, 0, -169.7] },
    { rotate: 0, position: [117, 0, -122] },
    { rotate: 0, position: [117, 0, -75.1] },
    { rotate: 0, position: [117, 0, -27] },
    { rotate: 0, position: [117, 0, 19.5] },
    { rotate: 0, position: [117, 0, 66.8] },
    { rotate: 0, position: [117, 0, 114.1] },
    { rotate: 0, position: [117, 0, 161] },
    { rotate: 0, position: [117, 0, 208.7] },


    { rotate: 180, position: [137, 0, -116] },
    { rotate: 180, position: [137, 0, -167] },
    { rotate: 180, position: [137, 0, -217] },
    { rotate: 180, position: [137, 0, 180] },
    { rotate: 180, position: [137, 0, 133] },
    { rotate: 180, position: [137, 0, 86] },
    { rotate: 180, position: [137, 0, 40] },
    { rotate: 180, position: [137, 0, -7] },
    { rotate: 180, position: [137, 0, -53] },


    { rotate: 0, position: [175, 0, -116] },
    { rotate: 0, position: [175, 0, -167] },
    { rotate: 0, position: [175, 0, -217] },
    { rotate: 0, position: [175, 0, 180] },
    { rotate: 0, position: [175, 0, 133] },
    { rotate: 0, position: [175, 0, 86] },
    { rotate: 0, position: [175, 0, 40] },
    { rotate: 0, position: [175, 0, -7] },
    { rotate: 0, position: [175, 0, -53] },


    { rotate: 270, position: [202, 0, 165] },
    { rotate: 270, position: [202, 0, 122] },
    { rotate: 270, position: [202, 0, 79] },
    { rotate: 270, position: [202, 0, 36] },
    { rotate: 270, position: [202, 0, -7] },
    { rotate: 270, position: [202, 0, -49] },
    { rotate: 270, position: [202, 0, -92] },
    { rotate: 270, position: [202, 0, -135] },
    { rotate: 270, position: [202, 0, -178] },
    { rotate: 270, position: [202, 0, -220] },
  ],
  'WBS002': [
    { rotate: 90, position: [-40, 0, 74] },
    { rotate: 90, position: [-40, 0, 15] },
    { rotate: 90, position: [-40, 0, -44] },
    { rotate: 90, position: [-40, 0, -103] },
    { rotate: 90, position: [-40, 0, -162] },
    { rotate: 90, position: [-40, 0, -220] }
  ],
  'WHWSA01': [
    { rotate: 90, position: [-197, 0, -176] }
  ],
  // 对应 cad 图上应该 WOLUS
  'OLUS': [
    { rotate: 0, position: [-139, 0, -60] },
    { rotate: 0, position: [-141, 0, -60] }
  ],
  'WMACB03': [
    { rotate: 180, position: [-228, 0, -62] },
    { rotate: 180, position: [-194, 0, -62] },
    { rotate: 0, position: [-226, 0, -7] },
    { rotate: 0, position: [-194, 0, -7] }
  ],
  '2LPjitai(W01)': [
    { rotate: 180, position: [-158, 0, -62] }
  ]
}

// 模拟天车位置
const skyCarMap = [{
  id: JSON.stringify(Math.ceil(Math.random() * 100)).padStart(3, '0'),
  coordinate: 82500
  // }, {
  //   id: JSON.stringify(Math.ceil(Math.random()*100)).padStart(3, '0'),
  //   coordinate: 822200
  // }, {
  //   id: JSON.stringify(Math.ceil(Math.random()*100)).padStart(3, '0'),
  //   coordinate: 180000
  // }, {
  //   id: JSON.stringify(Math.ceil(Math.random()*100)).padStart(3, '0'),
  //   coordinate: 78000
  // }, {
  //   id: JSON.stringify(Math.ceil(Math.random()*100)).padStart(3, '0'),
  //   coordinate: 226200
  // }, {
  //   id: JSON.stringify(Math.ceil(Math.random()*100)).padStart(3, '0'),
  //   coordinate: 1353761
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

export const DATA = {
  pointCoordinateMap,
  skyCarMap,
  skyCarStateColorMap,
  deviceMap
}