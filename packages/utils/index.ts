// 是否是字符串
export const isString = (str: any) => typeof str === 'string';
// 是否是DOM节点
export const isDomNode = (node: any) => node instanceof Element;
// 设置样式
export const setCss = (node: Element, cssObj = {}) => {
  Object.keys(cssObj).forEach((key) => {
    // @ts-ignore
    node.style[key] = cssObj[key];
  });
};
// 生成唯一id
export const getUniqueId = () => Math.random().toString(36) + Date.now().toString(36);
