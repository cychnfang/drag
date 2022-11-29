export interface RectRows {
  $el: HTMLDivElement;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createRectInstance(options: any) {
  const instance = {};

  instance.options = initProps(options);

  instance.$el = instance.$el;
  const { width, height } = instance.$el.getBoundingClientRect();

  instance.width = width;
  instance.height = height;
  instance.$el.style.position = 'absolute';
  instance.$el.style.left = `${instance.x}px`;
  instance.$el.style.top = `${instance.y}px`;
  return instance;
}

// 格式化参数
export function initProps<T extends any>(rawProps: T): RectRows {

  const props = {
    $el: document.createElement('div'),
    id: 1,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  



  Object.keys(props).forEach(k => {
    rawProps[k] && (props[k] = rawProps[k])
  })
  const { $el, width, height, x, y } = rawProps;

  // 创建一个包裹外壳
  const $rectWrap = document.createElement('div');

  if (rawProps.el) {
  }

  return;
}

export function getUniqueId() {}
