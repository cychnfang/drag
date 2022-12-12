// 是否是字符串
const isString = (str: any) => typeof str === "string";
// 是否是DOM节点
const isDomNode = (node: any) => node instanceof Element;
// 生成唯一id
const getUniqueId = () => Math.random().toString(36) + Date.now().toString(36);

export const creatRect = (options: any = {}) => {
  // 格式化参数
  // 创建容器
  // 绑定容器事件
  const rect: any = {};
  normalizeProps(rect, options);

  console.log(rect, "---");

  const proxy = new Proxy(rect, {
    set(target, prop, value, receiver) {
      target[prop] = value;

      patch(target, prop, value);
      return receiver;
    },

    get(target, prop) {
      console.log(1231)
      return target[prop];
    },
  });

  return proxy;
};

// 初始化参数
function normalizeProps<T extends Rect>(rect: T, options: any) {
  const { el = null, top = 0, left = 0, width = 150, height = 30 } = options;

  const initial: any = {
    id: getUniqueId(),
    $el: document.createElement("div"),
    width,
    height,
    top,
    left,
  };

  if (isDomNode(el)) {
    // const { width, height, left, top } = el.getBoundingClientRect();
    // const $component = el.cloneNode(true);
    // initial.$component = $component;
    // initial.width = width;
    // initial.height = height;
    // initial.left = left;
    // initial.top = top;
    // setCss($component, {
    //   position: 'absolute',
    //   width: '100%',
    //   height: '100%',
    //   zIndex: -1,
    //   disabled: true
    // })
    // initial.$el.appendChild($component)

    Object.assign(rect, initial)
  }

  setCss(initial.$el, {
    width: `${initial.width}px`,
    height: `${initial.height}px`,
    position: "absolute",
    zIndex: 1,
    border: "1px solid #ddd",
    background: "pink",
  });
}

// 初始化样式
function setCss(node: Element, cssObj: any) {
  Object.keys(cssObj).forEach((key) => {
    // @ts-ignore
    node.style[key] = cssObj[key];
  });
}

// proxy handler
function patch(target: any, prop: string | symbol, value: number) {
  console.log(target, prop, value);
}
