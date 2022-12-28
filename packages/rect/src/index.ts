import { isDomNode, setCss, getUniqueId } from '../../utils/index';

const DEFAULT_HEIGHT = 120 // 默认高度
const DEFAULT_WIDTH = 120 // 默认宽度

export const creatRect = (options: any = {}) => {
  const rect: any = {
    id: getUniqueId(),
    checked: false
  };
  normalizeProps(rect, options);
  // 设置遮罩
  setCover(rect);

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
  const { el = null, top = 0, left = 0, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, layout = 0, sort, backgroundColor } = options;
  const initial: any = {
    $el: document.createElement('div'),
    width,
    height,
    top,
    left,
    layout,
    sort
  };
  if (isDomNode(el)) {
    const { width, height } = el.getBoundingClientRect();
    const $component = el;
    initial.$component = $component;
    initial.width = width;
    initial.height = height;
    initial.$el.appendChild($component);
    setCss($component, {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: -1,
      disabled: true
    });
  }

  setCss(initial.$el, {
    position: 'absolute',
    width: `${initial.width}px`,
    height: `${initial.height}px`,
    top: `${initial.top}px`,
    left: `${initial.left}px`,
    border: '1px solid #ddd',
    backgroundColor,
    opcity: 1,
    overflow: 'hidden'
  });

  Object.assign(rect, initial);

}

// 设置组件遮罩
function setCover(rect: Rect) {
  const $cover = document.createElement('div');
  $cover.dataset.id = rect.id;
  setCss($cover, {
    position: 'absolute',
    zIndex: 999,
    width: '100%',
    height: '100%',
    opcity: 0,
    top: 0,
    left: 0
  });

  rect.$el.appendChild($cover);
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
    case 'layout':
      setCss(target.$el, {
        border: `1px solid ${value ? 'skyblue' : '#ddd'}`,
        zIndex: target.checked ? target.layout + 999 + target.sort : target.layout + target.sort,
        opacity: target.checked ? .8 : 1
      });
      break;
  }
}
