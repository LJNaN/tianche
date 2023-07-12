import dayjs from 'dayjs'

export function get15Day() {
    const today = dayjs(); // 获取当前时间
    const days = []; // 用于存储14天的日期
    const yesterday = dayjs().subtract(1, 'day').format('MM-DD');
    days.push(yesterday)
    for (let i = 0; i < 14; i++) {
        const date = today.add(i, 'day'); // 获取当前时间加上i天后的日期
        days.push(date.format('MM-DD')); // 将日期格式化为字符串，并添加到数组中
    }
    return days
}