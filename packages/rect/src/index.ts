// 是否是字符串
const isString = (str: any) => typeof str === 'string';
// 是否是DOM节点
const isDomNode = (node: any) => node instanceof Element;
// 生成唯一id
const getUniqueId = () => Math.random().toString(36) + Date.now().toString(36);

export const creatRect = (options: any = {}) => {
  const rect: any = {};
  normalizeProps(rect, options);
  // 设置遮罩
  setCover(rect);

  // 挂载
  rect.$el.appendChild(rect.$component);

  const proxy = new Proxy(rect, {
    set(target, prop, value, receiver) {
      target[prop] = value;
      updateStyle(target, prop, value);
      return receiver;
    },

    get(target, prop) {
      return target[prop];
    }
  });

  return proxy;
};

// 初始化参数
function normalizeProps<T extends Rect>(rect: T, options: any) {
  const { el = null, top = 0, left = 0, width = 150, height = 30 } = options;

  const initial: any = {
    id: getUniqueId(),
    $el: document.createElement('div'),
    checked: false,
    width,
    height,
    top,
    left
  };

  if (isDomNode(el)) {
    const { width, height } = el.getBoundingClientRect();
    const $component = el.cloneNode(true);
    initial.$component = $component;
    initial.width = width;
    initial.height = height;
    setCss($component, {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: -1,
      disabled: true
    });
    initial.$el.appendChild($component);

    Object.assign(rect, initial);
  }

  setCss(initial.$el, {
    position: 'absolute',
    width: `${initial.width}px`,
    height: `${initial.height}px`,
    top: `${initial.top}px`,
    left: `${initial.left}px`,
    zIndex: 1,
    border: '1px solid #ddd'
  });
}

// 设置组件遮罩
function setCover(rect: Rect) {
  const $cover = document.createElement('div');
  setCss($cover, {
    position: 'absolute',
    zIndex: 999,
    width: '100%',
    height: '100%',
    opcity: 0
  });

  rect.$el.appendChild($cover);
}

// 初始化样式
function setCss(node: Element, cssObj: any) {
  Object.keys(cssObj).forEach((key) => {
    // @ts-ignore
    node.style[key] = cssObj[key];
  });
}

// proxy handler
function updateStyle(target: any, prop: string | symbol, value: number) {
  switch (prop) {
    case 'width':
    case 'height':
    case 'left':
    case 'top':
      setCss(target.$el, {
        [prop]: `${value}px`
      });
      break;
    case 'checked':
      setCss(target.$el, {
        border: `1px solid ${value ? 'skyblue' : '#ddd'}`
      });
  }
}
