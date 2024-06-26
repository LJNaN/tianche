// 坐标和轨道映射
const pointCoordinateMap = [
  { name: '14-13', direction: '-x', startPoint: 14, endPoint: 13, startCoordinate: 171828, endCoordinate: 174100, status: "1" },
  { name: '14-15', direction: '-z', startPoint: 14, endPoint: 15, startCoordinate: 170660, endCoordinate: 171600, status: "1" },
  { name: '16-17', direction: 'z', startPoint: 16, endPoint: 17, startCoordinate: 180000, endCoordinate: 180900, status: "1" },
  { name: '18-17', direction: '-x', startPoint: 18, endPoint: 17, startCoordinate: 274340, endCoordinate: 276160, status: "1" },
  { name: '18-19', direction: '-z', startPoint: 18, endPoint: 19, startCoordinate: 273380, endCoordinate: 274240, status: "1" },
  { name: '13-21', direction: 'z', startPoint: 13, endPoint: 21, startCoordinate: 78000, endCoordinate: 90020, status: "1" },
  { name: '21-22', direction: 'x', startPoint: 21, endPoint: 22, startCoordinate: 174926, endCoordinate: 177268, status: "1" },
  { name: '22-14', direction: '-z', startPoint: 22, endPoint: 14, startCoordinate: 159620, endCoordinate: 170660, status: "1" },
  { name: '17-23', direction: 'z', startPoint: 17, endPoint: 23, startCoordinate: 180900, endCoordinate: 192980, status: "1" },
  { name: '23-24', direction: 'x', startPoint: 23, endPoint: 24, startCoordinate: 277000, endCoordinate: 278840, status: "1" },
  { name: '24-18', direction: '-z', startPoint: 24, endPoint: 18, startCoordinate: 261300, endCoordinate: 273380, status: "1" },
  { name: '21-25', direction: 'z', startPoint: 21, endPoint: 25, startCoordinate: 90020, endCoordinate: 112140, status: "1" },
  { name: '26-22', direction: '-z', startPoint: 26, endPoint: 22, startCoordinate: 137560, endCoordinate: 159620, status: "1" },
  { name: '26-25', direction: '-x', startPoint: 26, endPoint: 25, startCoordinate: 177000, endCoordinate: 179200, status: "1" },
  { name: '25-29', direction: 'z', startPoint: 25, endPoint: 29, startCoordinate: 112140, endCoordinate: 118100, status: "1" },
  { name: '29-30', direction: 'z', startPoint: 29, endPoint: 30, startCoordinate: 118200, endCoordinate: 119100, status: "1" },
  { name: '30-31', direction: 'z', startPoint: 30, endPoint: 31, startCoordinate: 119200, endCoordinate: 122280, status: "1" },
  { name: '31-34', direction: 'x', startPoint: 31, endPoint: 34, startCoordinate: 123360, endCoordinate: 125642, status: "1" },
  { name: '34-26', direction: '-z', startPoint: 34, endPoint: 26, startCoordinate: 126660, endCoordinate: 136550, status: "1" },
  { name: '31-32', direction: 'z', startPoint: 31, endPoint: 32, startCoordinate: 122280, endCoordinate: 123280, status: "1" },
  { name: '33-34', direction: '-z', startPoint: 33, endPoint: 34, startCoordinate: 125700, endCoordinate: 126660, status: "1" },
  { name: '33-32', direction: '-x', startPoint: 33, endPoint: 32, startCoordinate: 399320, endCoordinate: 401660, status: "1" },
  { name: '23-27', direction: 'z', startPoint: 23, endPoint: 27, startCoordinate: 192980, endCoordinate: 213320, status: "1" },
  { name: '28-27', direction: '-x', startPoint: 28, endPoint: 27, startCoordinate: 279000, endCoordinate: 280820, status: "1" },
  { name: '28-24', direction: '-z', startPoint: 28, endPoint: 24, startCoordinate: 240960, endCoordinate: 261300, status: "1" },
  { name: '27-35', direction: 'z', startPoint: 27, endPoint: 35, startCoordinate: 213320, endCoordinate: 225140, status: "1" },
  { name: '35-38', direction: 'x', startPoint: 35, endPoint: 38, startCoordinate: 226200, endCoordinate: 228040, status: "1" },
  { name: '38-28', direction: '-z', startPoint: 38, endPoint: 28, startCoordinate: 229100, endCoordinate: 240960, status: "1" },
  { name: '35-36', direction: 'z', startPoint: 35, endPoint: 36, startCoordinate: 225140, endCoordinate: 226120, status: "1" },
  { name: '37-38', direction: '-z', startPoint: 37, endPoint: 38, startCoordinate: 228120, endCoordinate: 229100, status: "1" },
  { name: '37-36', direction: '-x', startPoint: 37, endPoint: 36, startCoordinate: 391600, endCoordinate: 393540, status: "1" },
  { name: '36-33', direction: '-x', startPoint: 36, endPoint: 33, startCoordinate: 393640, endCoordinate: 399220, status: "1" },
  { name: '32-39', direction: '-x', startPoint: 32, endPoint: 39, startCoordinate: 401740, endCoordinate: 402680, status: "1" },
  { name: '39-40', direction: 'z', startPoint: 39, endPoint: 40, startCoordinate: 402680, endCoordinate: 404880, status: "1" },
  { name: '40-43', direction: 'x', startPoint: 40, endPoint: 43, startCoordinate: 404880, endCoordinate: 406140, status: "1" },
  { name: '43-44', direction: 'x', startPoint: 43, endPoint: 44, startCoordinate: 406220, endCoordinate: 409860, status: "1" },
  { name: '44-47', direction: 'x', startPoint: 44, endPoint: 47, startCoordinate: 409960, endCoordinate: 416120, status: "1" },
  { name: '47-48', direction: 'x', startPoint: 47, endPoint: 48, startCoordinate: 416220, endCoordinate: 420020, status: "1" },
  { name: '48-49', direction: 'x', startPoint: 48, endPoint: 49, startCoordinate: 420100, endCoordinate: 431300, status: "1" },
  { name: '49-50', direction: '-z', startPoint: 49, endPoint: 50, startCoordinate: 841000, endCoordinate: 841600, status: "1" },
  { name: '41-42', direction: 'x', startPoint: 41, endPoint: 42, startCoordinate: 829000, endCoordinate: 834720, status: "1" },
  { name: '45-46', direction: 'x', startPoint: 45, endPoint: 46, startCoordinate: 834900, endCoordinate: 840820, status: "1" },
  { name: '29-51', direction: '-x', startPoint: 29, endPoint: 51, startCoordinate: 281000, endCoordinate: 287060, status: "1" },
  { name: '51-54', direction: '-z', startPoint: 51, endPoint: 54, startCoordinate: 287061, endCoordinate: 289880, status: "1" },
  { name: '54-56', direction: '-z', startPoint: 54, endPoint: 56, startCoordinate: 289881, endCoordinate: 317600, status: "1" },
  { name: '56-55', direction: '-x', startPoint: 56, endPoint: 55, startCoordinate: 381000, endCoordinate: 381960, status: "1" },
  { name: '55-73', direction: 'z', startPoint: 55, endPoint: 73, startCoordinate: 342141, endCoordinate: 346780, status: "1" },
  { name: '73-74', direction: 'z', startPoint: 73, endPoint: 74, startCoordinate: 346880, endCoordinate: 348640, status: "1" },
  { name: '74-72', direction: 'z', startPoint: 74, endPoint: 72, startCoordinate: 348740, endCoordinate: 353500, status: "1" },
  { name: '72-71', direction: 'z', startPoint: 72, endPoint: 71, startCoordinate: 353600, endCoordinate: 354900, status: "1" },
  { name: '71-53', direction: 'z', startPoint: 71, endPoint: 53, startCoordinate: 355000, endCoordinate: 368200, status: "1" },
  { name: '53-54', direction: 'x', startPoint: 53, endPoint: 54, startCoordinate: 382100, endCoordinate: 383060, status: "1" },
  { name: '53-52', direction: 'z', startPoint: 53, endPoint: 52, startCoordinate: 368200, endCoordinate: 371700, status: "1" },
  { name: '52-30', direction: 'x', startPoint: 52, endPoint: 30, startCoordinate: 371701, endCoordinate: 380220, status: "1" },
  { name: '72-66', direction: '-x', startPoint: 72, endPoint: 66, startCoordinate: 19000, endCoordinate: 19980, status: "1" },
  { name: '66-67', direction: '-x', startPoint: 66, endPoint: 67, startCoordinate: 19981, endCoordinate: 30800, status: "1" },
  { name: '67-68', direction: 'z', startPoint: 67, endPoint: 68, startCoordinate: 30801, endCoordinate: 34600, status: "1" },
  { name: '68-69', direction: 'x', startPoint: 68, endPoint: 69, startCoordinate: 34601, endCoordinate: 37400, status: "1" },
  { name: '69-70', direction: '-z', startPoint: 69, endPoint: 70, startCoordinate: 37401, endCoordinate: 39020, status: "1" },
  { name: '70-64', direction: 'x', startPoint: 70, endPoint: 64, startCoordinate: 39021, endCoordinate: 42360, status: "1" },
  { name: '64-63', direction: 'x', startPoint: 64, endPoint: 63, startCoordinate: 42440, endCoordinate: 43420, status: "1" },
  { name: '63-65', direction: 'x', startPoint: 63, endPoint: 65, startCoordinate: 43540, endCoordinate: 45060, status: "1" },
  { name: '1-4', direction: '-x', startPoint: 1, endPoint: 4, startCoordinate: 854000, endCoordinate: 869240, status: "1" },
  { name: '4-5', direction: '-x', startPoint: 4, endPoint: 5, startCoordinate: 869440, endCoordinate: 872740, status: "1" },
  { name: '5-8', direction: '-x', startPoint: 5, endPoint: 8, startCoordinate: 872880, endCoordinate: 877680, status: "1" },
  { name: '8-9', direction: '-x', startPoint: 8, endPoint: 9, startCoordinate: 877820, endCoordinate: 881400, status: "1" },
  { name: '9-10', direction: '-x', startPoint: 9, endPoint: 10, startCoordinate: 881540, endCoordinate: 885100, status: "1" },
  { name: '10-11', direction: 'z', startPoint: 10, endPoint: 11, startCoordinate: 852000, endCoordinate: 852600, status: "1" },
  { name: '11-12', direction: 'x', startPoint: 11, endPoint: 12, startCoordinate: 917000, endCoordinate: 921120, status: "1" },
  { name: '12-15', direction: 'x', startPoint: 12, endPoint: 15, startCoordinate: 921120, endCoordinate: 924080, status: "1" },
  { name: '15-16', direction: 'x', startPoint: 15, endPoint: 16, startCoordinate: 924180, endCoordinate: 929300, status: "1" },
  { name: '16-19', direction: 'x', startPoint: 16, endPoint: 19, startCoordinate: 929300, endCoordinate: 931800, status: "1" },
  { name: '20-1', direction: '-z', startPoint: 20, endPoint: 1, startCoordinate: 852700, endCoordinate: 853280, status: "1" },
  { name: '2-3', direction: '-x', startPoint: 2, endPoint: 3, startCoordinate: 842000, endCoordinate: 846640, status: "1" },
  { name: '6-7', direction: '-x', startPoint: 6, endPoint: 7, startCoordinate: 846800, endCoordinate: 851720, status: "1" },
  { name: '12-13', direction: 'z', startPoint: 12, endPoint: 13, startCoordinate: 78000, endCoordinate: 79000, status: "1" },
  { name: '65-66', direction: '-z', startPoint: 65, endPoint: 66, startCoordinate: 46140, endCoordinate: 47340, status: "1" },
  { name: '65-71', direction: 'x', startPoint: 65, endPoint: 71, startCoordinate: 45060, endCoordinate: 46060, status: "1" },
  { name: '73-75', direction: '-x', startPoint: 73, endPoint: 75, startCoordinate: 48000, endCoordinate: 48160, status: "1" },
  { name: '75-76', direction: '-x', startPoint: 75, endPoint: 76, startCoordinate: 48161, endCoordinate: 49680, status: "1" },
  { name: '76-77', direction: '-x', startPoint: 76, endPoint: 77, startCoordinate: 49680, endCoordinate: 51040, status: "1" },
  { name: '77-78', direction: '-x', startPoint: 77, endPoint: 78, startCoordinate: 51040, endCoordinate: 59920, status: "1" },
  { name: '78-79', direction: 'z', startPoint: 78, endPoint: 79, startCoordinate: 59921, endCoordinate: 63700, status: "1" },
  { name: '79-80', direction: 'x', startPoint: 79, endPoint: 80, startCoordinate: 63701, endCoordinate: 75200, status: "1" },
  { name: '80-75', direction: '-z', startPoint: 80, endPoint: 75, startCoordinate: 75520, endCoordinate: 77180, status: "1" },
  { name: '80-74', direction: 'x', startPoint: 80, endPoint: 74, startCoordinate: 75201, endCoordinate: 75420, status: "1" },
  { name: '4-2', direction: '-z', startPoint: 4, endPoint: 2, startCoordinate: 842000, endCoordinate: 842000, status: "1" },
  { name: '46-48', direction: '-z', startPoint: 46, endPoint: 48, startCoordinate: 840680, endCoordinate: 840680, status: "1" },
  { name: '3-5', direction: 'z', startPoint: 3, endPoint: 5, startCoordinate: 846640, endCoordinate: 846640, status: "1" },
  { name: '8-6', direction: '-x', startPoint: 8, endPoint: 6, startCoordinate: 846800, endCoordinate: 846800, status: "1" },
  { name: '7-9', direction: '-x', startPoint: 7, endPoint: 9, startCoordinate: 851720, endCoordinate: 851720, status: "1" },
  { name: '43-41', direction: 'z', startPoint: 43, endPoint: 41, startCoordinate: 829000, endCoordinate: 829000, status: "1" },
  { name: '42-44', direction: '-z', startPoint: 42, endPoint: 44, startCoordinate: 850000, endCoordinate: 850000, status: "1" },
  { name: '47-45', direction: 'z', startPoint: 47, endPoint: 45, startCoordinate: 834900, endCoordinate: 834900, status: "1" },
  { name: '115-114', direction: '-x', startPoint: 115, endPoint: 114, startCoordinate: 386300, endCoordinate: 388280, status: "1" },
  { name: '118-115', direction: '-x', startPoint: 118, endPoint: 115, startCoordinate: 822200, endCoordinate: 825320, status: "1" },
  { name: '88-85', direction: '-z', startPoint: 88, endPoint: 85, startCoordinate: 1557291, endCoordinate: 1567160, status: "1" },
  { name: '93-94', direction: 'z', startPoint: 93, endPoint: 94, startCoordinate: 1570000, endCoordinate: 1578640, status: "1" },
  { name: '105-109', direction: 'z', startPoint: 105, endPoint: 109, startCoordinate: 1353761, endCoordinate: 1370700, status: "1" },
  { name: '113-116', direction: 'x', startPoint: 113, endPoint: 116, startCoordinate: 1386200, endCoordinate: 1388040, status: "1" },
  { name: '115-116', direction: '-z', startPoint: 115, endPoint: 116, startCoordinate: 1388140, endCoordinate: 1388280, status: "1" },
  { name: '112-108', direction: '-z', startPoint: 112, endPoint: 108, startCoordinate: 1506421, endCoordinate: 1523360, status: "1" },
  { name: '120-112', direction: '-z', startPoint: 120, endPoint: 112, startCoordinate: 1491141, endCoordinate: 1506420, status: "1" },
  { name: '58-59', direction: '-z', startPoint: 58, endPoint: 59, startCoordinate: 8461, endCoordinate: 11240, status: "1" },
  { name: '95-93', direction: '-x', startPoint: 95, endPoint: 93, startCoordinate: 1570000, endCoordinate: 1570000, status: "1" },
  { name: '94-96', direction: 'x', startPoint: 94, endPoint: 96, startCoordinate: 0, endCoordinate: 0, status: "1" },
  { name: '119-118', direction: '-x', startPoint: 119, endPoint: 118, startCoordinate: 820100, endCoordinate: 822040, status: "1" },
  { name: '86-89', direction: 'x', startPoint: 86, endPoint: 89, startCoordinate: 902000, endCoordinate: 905640, status: "1" },
  { name: '56-91', direction: '-z', startPoint: 56, endPoint: 91, startCoordinate: 317601, endCoordinate: 327260, status: "1" },
  { name: '101-104', direction: 'x', startPoint: 101, endPoint: 104, startCoordinate: 940380, endCoordinate: 942320, status: "1" },
  { name: '104-20', direction: 'x', startPoint: 104, endPoint: 20, startCoordinate: 942420, endCoordinate: 945540, status: "1" },
  { name: '62-57', direction: 'z', startPoint: 62, endPoint: 57, startCoordinate: 17851, endCoordinate: 17900, status: "1" },
  { name: '99-100', direction: '-z', startPoint: 99, endPoint: 100, startCoordinate: 1433741, endCoordinate: 1433960, status: "1" },
  { name: '64-61', direction: 'z', startPoint: 64, endPoint: 61, startCoordinate: 17500, endCoordinate: 17820, status: "1" },
  { name: '57-58', direction: 'x', startPoint: 57, endPoint: 58, startCoordinate: 2200, endCoordinate: 8460, status: "1" },
  { name: '96-55', direction: 'z', startPoint: 96, endPoint: 55, startCoordinate: 341980, endCoordinate: 342140, status: "1" },
  { name: '91-90', direction: '-x', startPoint: 91, endPoint: 90, startCoordinate: 329000, endCoordinate: 329960, status: "1" },
  { name: '98-105', direction: 'z', startPoint: 98, endPoint: 105, startCoordinate: 1340141, endCoordinate: 1353760, status: "1" },
  { name: '114-37', direction: '-x', startPoint: 114, endPoint: 37, startCoordinate: 388380, endCoordinate: 391520, status: "1" },
  { name: '83-86', direction: 'x', startPoint: 83, endPoint: 86, startCoordinate: 901000, endCoordinate: 901700, status: "1" },
  { name: '89-92', direction: 'x', startPoint: 89, endPoint: 92, startCoordinate: 906000, endCoordinate: 907060, status: "1" },
  { name: '87-88', direction: 'x', startPoint: 87, endPoint: 88, startCoordinate: 1555141, endCoordinate: 1557290, status: "1" },
  { name: '90-95', direction: 'z', startPoint: 90, endPoint: 95, startCoordinate: 330261, endCoordinate: 332880, status: "1" },
  { name: '91-92', direction: '-z', startPoint: 91, endPoint: 92, startCoordinate: 327261, endCoordinate: 327640, status: "1" },
  { name: '97-100', direction: 'x', startPoint: 97, endPoint: 100, startCoordinate: 935120, endCoordinate: 937060, status: "1" },
  { name: '100-101', direction: 'x', startPoint: 100, endPoint: 101, startCoordinate: 937160, endCoordinate: 940280, status: "1" },
  { name: '113-114', direction: 'z', startPoint: 113, endPoint: 114, startCoordinate: 1385641, endCoordinate: 1385820, status: "1" },
  { name: '103-104', direction: '-z', startPoint: 103, endPoint: 104, startCoordinate: 1536611, endCoordinate: 1536820, status: "1" },
  { name: '61-62', direction: '-x', startPoint: 61, endPoint: 62, startCoordinate: 17821, endCoordinate: 17850, status: "1" },
  { name: '10-81', direction: '-x', startPoint: 10, endPoint: 81, startCoordinate: 885101, endCoordinate: 895580, status: "1" },
  { name: '81-82', direction: 'z', startPoint: 81, endPoint: 82, startCoordinate: 895581, endCoordinate: 897720, status: "1" },
  { name: '84-87', direction: 'z', startPoint: 84, endPoint: 87, startCoordinate: 1545261, endCoordinate: 1555140, status: "1" },
  { name: '89-90', direction: 'z', startPoint: 89, endPoint: 90, startCoordinate: 330000, endCoordinate: 330260, status: "1" },
  { name: '97-98', direction: 'z', startPoint: 97, endPoint: 98, startCoordinate: 1340000, endCoordinate: 1340140, status: "1" },
  { name: '60-63', direction: '-z', startPoint: 60, endPoint: 63, startCoordinate: 1700, endCoordinate: 17320, status: "1" },
  { name: '99-98', direction: '-x', startPoint: 99, endPoint: 98, startCoordinate: 1435000, endCoordinate: 1436840, status: "1" },
  { name: '110-109', direction: '-x', startPoint: 110, endPoint: 109, startCoordinate: 1439000, endCoordinate: 1440840, status: "1" },
  { name: '101-102', direction: 'z', startPoint: 101, endPoint: 102, startCoordinate: 1442000, endCoordinate: 1442150, status: "1" },
  { name: '108-103', direction: '-z', startPoint: 108, endPoint: 103, startCoordinate: 1523361, endCoordinate: 1536610, status: "1" },
  { name: '117-120', direction: 'x', startPoint: 117, endPoint: 120, startCoordinate: 1489000, endCoordinate: 1490840, status: "1" },
  { name: '119-120', direction: '-z', startPoint: 119, endPoint: 120, startCoordinate: 1491000, endCoordinate: 1491140, status: "1" },
  { name: '50-119', direction: '-x', startPoint: 50, endPoint: 119, startCoordinate: 817000, endCoordinate: 819960, status: "1" },
  { name: '82-83', direction: 'x', startPoint: 82, endPoint: 83, startCoordinate: 897721, endCoordinate: 899980, status: "1" },
  { name: '92-11', direction: 'x', startPoint: 92, endPoint: 11, startCoordinate: 915440, endCoordinate: 916999, status: "1" },
  { name: '83-84', direction: 'z', startPoint: 83, endPoint: 84, startCoordinate: 1545000, endCoordinate: 1545260, status: "1" },
  { name: '85-84', direction: '-x', startPoint: 85, endPoint: 84, startCoordinate: 1569000, endCoordinate: 1569600, status: "1" },
  { name: '95-96', direction: 'z', startPoint: 95, endPoint: 96, startCoordinate: 333000, endCoordinate: 338780, status: "1" },
  { name: '19-97', direction: 'x', startPoint: 19, endPoint: 97, startCoordinate: 931900, endCoordinate: 935020, status: "1" },
  { name: '106-99', direction: '-z', startPoint: 106, endPoint: 99, startCoordinate: 1420371, endCoordinate: 1433740, status: "1" },
  { name: '110-106', direction: '-z', startPoint: 110, endPoint: 106, startCoordinate: 1403401, endCoordinate: 1420370, status: "1" },
  { name: '109-113', direction: 'z', startPoint: 109, endPoint: 113, startCoordinate: 1370701, endCoordinate: 1385240, status: "1" },
  { name: '103-102', direction: '-x', startPoint: 103, endPoint: 102, startCoordinate: 1538000, endCoordinate: 1539820, status: "1" },
  { name: '107-111', direction: 'z', startPoint: 107, endPoint: 111, startCoordinate: 1455691, endCoordinate: 1472890, status: "1" },
  { name: '112-111', direction: '-x', startPoint: 112, endPoint: 111, startCoordinate: 1542000, endCoordinate: 1543840, status: "1" },
  { name: '117-118', direction: 'z', startPoint: 117, endPoint: 118, startCoordinate: 1487831, endCoordinate: 1487980, status: "1" },
  { name: '85-86', direction: '-z', startPoint: 85, endPoint: 86, startCoordinate: 1567161, endCoordinate: 1567480, status: "1" },
  { name: '116-110', direction: '-z', startPoint: 116, endPoint: 110, startCoordinate: 1388281, endCoordinate: 1403400, status: "1" },
  { name: '102-107', direction: 'z', startPoint: 102, endPoint: 107, startCoordinate: 1442151, endCoordinate: 1456910, status: "1" },
  { name: '107-108', direction: 'x', startPoint: 107, endPoint: 108, startCoordinate: 1540000, endCoordinate: 1541840, status: "1" },
  { name: '111-117', direction: 'z', startPoint: 111, endPoint: 117, startCoordinate: 1472891, endCoordinate: 1487830, status: "1" },
  { name: '60-61', direction: '-x', startPoint: 60, endPoint: 61, startCoordinate: 12780, endCoordinate: 13780, status: "1" },
  { name: '105-106', direction: 'x', startPoint: 105, endPoint: 106, startCoordinate: 1437000, endCoordinate: 1438840, status: "1" },
  { name: '59-60', direction: '-x', startPoint: 59, endPoint: 60, startCoordinate: 11241, endCoordinate: 12700, status: "1" }
]

window.pointCoordinateMap = pointCoordinateMap
