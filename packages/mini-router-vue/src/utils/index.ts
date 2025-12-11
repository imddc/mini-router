/**
 * 浅拷贝对象
 */
const assign = Object.assign;

/**
 * 用于判断一个对象是否为 Promise
 * @param obj 要判断的对象
 * @returns 如果是 Promise 则返回 true，否则返回 false
 */
function isPromise(obj: any) {
    return obj && typeof obj.then === 'function';
}

export { assign, isPromise };
