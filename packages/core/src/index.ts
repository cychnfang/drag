import { creatRect } from "../../rect/src/index";

// 是否是字符串
const isString = (str: any) => typeof str === "string";
// 是否是DOM节点
const isDomNode = (node: any) => node instanceof Element;

let drag: any;
export const createDrag = (options: any = {}) => {
  drag = {
    _rectMap: new Map(), // 物料存储区
  };

  init(drag, options);

  // 挂载节点
  mount(drag);

  //  返回一些api
  return drag;
};

// 初始化
function init<T extends Drag>(drag: T, options: any) {
  // 格式化wrap
  normalizeContainer(drag, options);
  if (!drag._container) return;
  // 格式化画布
  normalizeCanvas(drag);
  // 格式化网格
  normalizeGrid(drag, options);

  // 绑定事件
  bindEvent(drag._container.$el);
}

// 格式化容器
function normalizeContainer<T extends Drag>(drag: T, options: any) {
  let $el = null;

  const { el } = options;
  // pass id selector
  if (isString(el)) {
    $el = document.querySelector(options.el);
  }
  // pass DOM
  if (isDomNode(options.el)) $el = el;

  if (!$el) {
    console.warn("请传入dom节点，或者id选择器");
    return;
  }

  // init _container props
  const { width, height } = $el.getBoundingClientRect();
  drag._container = {
    $el,
    width,
    height,
  };
}

// 格式化画布
function normalizeCanvas<T extends Drag>(drag: T) {
  const { width, height } = drag._container;
  drag._canvas = {
    $el: document.createElement("div"),
    width,
    height,
  };
}

// 格式化网格
function normalizeGrid<T extends Drag>(drag: T, options: any) {
  const { showGrid = true } = options;
  drag.showGrid = showGrid;

  if (!showGrid) return; // 不需要grid
  const { gridHeight = 15, gridWidth = 15 } = options;
  const { width, height } = drag._canvas;
  const $el = document.createElement("canvas");
  drag._grid = {
    $el,
    $ctx: $el.getContext("2d") as CanvasRenderingContext2D,
    gridHeight,
    gridWidth,
    width,
    height,
    draw: drawGrid,
  };
}

// 绑定事件
function bindEvent(node: Element) {
  node.addEventListener("mousedown", (e: any) => handleMouseDown(e));
  node.addEventListener("mouseup", (e) => handleMouseUp);
  node.addEventListener("click", (e) => handleClick);
  node.addEventListener("mousemove", (e) => handleMouseMove);
}

// 点击事件 down -> up -> click
function handleClick(e: MouseEvent) {}

// 点击事件
function handleMouseDown(e: MouseEvent) {
  // 扫描是否有被点击到的组件
  const { offsetX, offsetY } = e;
  const { scrollTop, scrollLeft } = drag._container.$el;

  // 鼠标点击在画布的 offsetX + scrollLeft, offsetY + scrollY
  const x = offsetX + scrollLeft;
  const y = offsetY + scrollTop;

  const currentRect = [...drag._rectMap.values()].find((rect: Rect) => {
    const { left, top, width, height } = rect;
    return (left < x && left + width > x) || (top < y && top + height > y);
  });

  console.log(currentRect, "------");
}

// 点击事件
function handleMouseUp(e: MouseEvent) {}

// 鼠标移动
function handleMouseMove(e: MouseEvent) {}

// 挂载
function mount(drag: Drag) {
  setCss(drag._container.$el, {
    overflow: "auto",
  });
  setCss(drag._canvas.$el, {
    with: `${drag._canvas.width + 200}px`,
    height: `${drag._canvas.height + 200}px`,
    zIndex: 0,
    position: "relative",
  });

  setCss(drag._grid.$el, {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1,
  });

  drag._canvas.$el.appendChild(drag._grid.$el);
  drag._container.$el.appendChild(drag._canvas.$el);
  drag._grid.draw(drag._grid);
}

// 计算份额
const calcCount = (unitWidth: number, totalWidth: number): number =>
  Math.ceil(totalWidth / unitWidth);

// 绘制网格线
function drawGrid(grid: GridPros) {
  // @ts-ignore
  const { width, height, gridWidth, gridHeight, $ctx } = grid;
  const rows = calcCount(gridHeight, height);
  const columns = calcCount(gridWidth, width);

  grid.$el.width = width;
  grid.$el.height = height;
  grid.$el.style.backgroundColor = "#FFFFFF";

  [...Array(rows)].forEach((_, index) => {
    $ctx.beginPath();

    $ctx.strokeStyle = index % 4 === 0 ? "#e6e6e6" : "#f1f1f1";
    const y = index * gridHeight;
    $ctx.moveTo(0, y + 0.5); // +0.5处理canvas模糊问题
    $ctx.lineTo(width, y);
    $ctx.stroke();
    $ctx.closePath();
  });

  [...Array(columns)].forEach((_, index) => {
    $ctx.beginPath();
    $ctx.strokeStyle = index % 4 === 0 ? "#e6e6e6" : "#f1f1f1";
    const x = index * gridWidth;
    $ctx.moveTo(x + 0.5, 0); // +0.5处理canvas模糊问题
    $ctx.lineTo(x, height);
    $ctx.stroke();
    $ctx.closePath();
  });
}

// 设置样式
function setCss(node: Element, cssObj: any) {
  Object.keys(cssObj).forEach((key) => {
    // @ts-ignore
    node.style[key] = cssObj[key];
  });
}

// 创建方块
export const createShap = (options: any) => {
  const rect = creatRect(options);
  console.log(rect.id, "---");
  // const { id, $el } = rect;
  // drag._rectMap.set(id, rect);
  // drag._canvas.$el.appendChild($el);
};
