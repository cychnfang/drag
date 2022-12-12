import { creatRect } from "../../rect/src/index";

// 是否是字符串
const isString = (str: any) => typeof str === "string";
// 是否是DOM节点
const isDomNode = (node: any) => node instanceof Element;

// 定义rect 8个方向的误差范围
const SCOPE = 10;

enum DIRECTIONS {
  TOP = "top",
  RIGHT_TOP = "right_top",
  RIGHT = "right",
  RIGHT_BOTTOM = "right_bottom",
  BOTTOM = "bottom",
  LEFT_BOTTOM = "left_bottom",
  LEFT = "left",
  LEFT_TOP = "left_top",
  MIDDLE = "middle",
  DEFAULT = "default",
}

const CURSOR_STYLE_MAP = {
  [DIRECTIONS.TOP]: "ns-resize",
  [DIRECTIONS.RIGHT_TOP]: "nesw-resize",
  [DIRECTIONS.RIGHT]: "ew-resize",
  [DIRECTIONS.RIGHT_BOTTOM]: "nwse-resize",
  [DIRECTIONS.BOTTOM]: "ns-resize",
  [DIRECTIONS.LEFT_BOTTOM]: "nesw-resize",
  [DIRECTIONS.LEFT]: "ew-resize",
  [DIRECTIONS.LEFT_TOP]: "nwse-resize",
  [DIRECTIONS.DEFAULT]: "default",
  [DIRECTIONS.MIDDLE]: "move",
};

enum ACTION_TYPE {
  DRAG = "drag",
  RESIZE = "resize",
}

const ACTION_TYPE_MAP = {
  [DIRECTIONS.TOP]: "resize",
  [DIRECTIONS.RIGHT_TOP]: "resize",
  [DIRECTIONS.RIGHT]: "resize",
  [DIRECTIONS.RIGHT_BOTTOM]: "resize",
  [DIRECTIONS.BOTTOM]: "resize",
  [DIRECTIONS.LEFT_BOTTOM]: "resize",
  [DIRECTIONS.LEFT]: "resize",
  [DIRECTIONS.LEFT_TOP]: "resize",
  [DIRECTIONS.DEFAULT]: "drag",
  [DIRECTIONS.MIDDLE]: "drag",
};

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
  node.addEventListener("mouseup", (e: any) => handleMouseUp(e));
  node.addEventListener("click", (e) => handleClick);
  node.addEventListener("mousemove", (e: any) => handleMouseMove(e));
}

// 点击事件 down -> up -> click
function handleClick(e: MouseEvent) {}

// 点击事件
function handleMouseDown(e: MouseEvent) {
  const matchedComponents = getMatchedComponentsById(e);
  // 点击未命中rect
  if (matchedComponents.length === 0) return;

  // 更新基准点信息(位置)
  updateRefPointLoc(e);
  // 更新操作方式
  updateActionType(matchedComponents[0], e);
  // 更新组件状态
  updateComponentsStatus(matchedComponents);
}

// 点击事件
function handleMouseUp(e: MouseEvent) {
  // 置空点击位置
  updateRefPointLoc(e, "reset");
}

// 鼠标移动
function handleMouseMove(e: MouseEvent) {
  // 更新鼠标样式
  updatePointStyle(e);
  // 更新位置
  updateComponentsLoc(e);
}

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
  const { id, $el } = rect;
  setCss($el, { zIndex: drag._rectMap.size + 1 });
  drag._rectMap.set(id, rect);
  drag._canvas.$el.appendChild($el);
};

// 更新参考点位置信息
function updateRefPointLoc(e: MouseEvent, type?: string) {
  if (type === "reset") {
    drag.refPointLoc = null;
    return;
  }
  drag.refPointLoc = { x: e.x, y: e.y };
}

// 更新组件的选中状态
function updateComponentsStatus(rects: Rect[]) {
  [...drag._rectMap.values()].forEach((rect) => (rect.checked = false));
  rects.forEach((rect) => (rect.checked = true));
}

// 更新操作类型
function updateActionType(rect: Rect, e: MouseEvent) {
  const direction = getDirection(rect, e);
  drag.actionInfo = {
    direction,
    type: ACTION_TYPE_MAP[direction],
  };
}

// 获取选中的组件
function getCheckedComponents() {
  return [...drag._rectMap.values()].filter((rect) => rect.checked);
}

// 更新位置
function updateComponentsLoc(e: MouseEvent) {
  const checkedComponents = getCheckedComponents();
  if (checkedComponents.length === 0 || !drag.refPointLoc) return;

  switch (drag.actionInfo.type) {
    case ACTION_TYPE.DRAG:
      handleComponentsDrag(e, checkedComponents);
      break;
    case ACTION_TYPE.RESIZE:
      handleComponentsResize(e, checkedComponents);
      break;
    default:
  }
  // 更新refPointLoc
  updateRefPointLoc(e);
}

// 处理拖动
function handleComponentsDrag(e: MouseEvent, rects: Rect[]) {
  // 计算x, y 变化值
  const { x: startX, y: startY } = drag.refPointLoc;
  const { x: endX, y: endY } = e;
  const changeX = endX - startX;
  const changeY = endY - startY;
  rects.forEach((rect) => {
    const left = rect.left + changeX;
    const top = rect.top + changeY;
    // 不能超出边界 暂时定左边界和上边界
    rect.left = left > 0 ? left : 0;
    rect.top = top > 0 ? top : 0;
  });
}

// 处理缩放
function handleComponentsResize(e: MouseEvent, rects: Rect[]) {
  rects.forEach((rect) => {
    const { x: startX, y: startY } = drag.refPointLoc;
    const { x: endX, y: endY } = e;
    const changeX = endX - startX;
    const changeY = endY - startY;
    switch (drag.actionInfo.direction) {
      case DIRECTIONS.RIGHT:
        rect.width = rect.width + changeX < 30 ? 30 : rect.width + changeX;
        break;
      case DIRECTIONS.BOTTOM:
        rect.height = rect.height + changeY < 30 ? 30 : rect.height + changeY;
        break;
      case DIRECTIONS.RIGHT_BOTTOM:
        rect.width = rect.width + changeX < 30 ? 30 : rect.width + changeX;
        rect.height = rect.height + changeY < 30 ? 30 : rect.height + changeY;
        break;
      case DIRECTIONS.RIGHT_TOP:
        rect.width = rect.width + changeX < 30 ? 30 : rect.width + changeX;
        rect.height = rect.height - changeY < 30 ? 30 : rect.height - changeY;
        if (rect.height > 30) {
          rect.top = rect.top + changeY < 0 ? 0 : rect.top + changeY;
        }
      case DIRECTIONS.TOP:
        if (rect.height > 30) {
          rect.height = rect.height - changeY < 30 ? 30 : rect.height - changeY;
          rect.top = rect.top + changeY < 0 ? 0 : rect.top + changeY;
        }
        break;
      case DIRECTIONS.LEFT:
        if (rect.width > 30 || rect.width <= 30 && changeX < 0) {
          rect.width = rect.width - changeX < 30 ? 30 : rect.width - changeX;
          rect.left = rect.left + changeX < 0 ? 0 : rect.left + changeX;
        }

      default:
    }
  });
}

// 更新鼠标样式
function updatePointStyle(e: MouseEvent) {
  const currentRect = getMatchedComponentsByLoc(e.x, e.y)[0] || null;
  const cursorStyle = CURSOR_STYLE_MAP[getDirection(currentRect, e)];
  setCss(drag._container.$el, {
    cursor: cursorStyle,
  });
}

// 获取位置的方向
function getDirection(rect: Rect | null, e: MouseEvent) {
  if (!rect) return DIRECTIONS.DEFAULT;

  const { width, height } = rect;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const { x, y } = e;
  const { x: rectX, y: rectY } = rect.$el.getBoundingClientRect();
  // left-top
  if (x >= rectX && x <= rectX + SCOPE && y >= rectY && y <= rectY + SCOPE) {
    return DIRECTIONS.LEFT_TOP;
  }
  // top
  if (
    x >= rectX + halfWidth - SCOPE &&
    x <= rectX + halfWidth + SCOPE &&
    y >= rectY &&
    y <= rectY + SCOPE
  ) {
    return DIRECTIONS.TOP;
  }

  // right-top
  if (
    x >= rectX + width - SCOPE &&
    x <= rectX + width &&
    y >= rectY &&
    y <= rectY + SCOPE
  ) {
    return DIRECTIONS.RIGHT_TOP;
  }

  // right
  if (
    x >= rectX + width - SCOPE &&
    x <= rectX + width &&
    y >= rectY + halfHeight - SCOPE &&
    y < rectY + halfHeight + SCOPE
  ) {
    console.log("right");
    return DIRECTIONS.RIGHT;
  }

  // right-bottom
  if (
    x >= rectX + width - SCOPE &&
    x <= rectX + width &&
    y >= rectY + height - SCOPE &&
    y <= rectY + height
  ) {
    return DIRECTIONS.RIGHT_BOTTOM;
  }

  // bottom
  if (
    x >= rectX + halfWidth - SCOPE &&
    x <= rectX + halfWidth + SCOPE &&
    y >= rectY + height - SCOPE &&
    y <= rectY + height
  ) {
    return DIRECTIONS.BOTTOM;
  }

  // left-bottom
  if (
    x >= rectX &&
    x <= rectX + SCOPE &&
    y > rectY + height - SCOPE &&
    y < rectY + height
  ) {
    return DIRECTIONS.LEFT_BOTTOM;
  }

  // left
  if (
    x >= rectX &&
    x <= rectX + SCOPE &&
    y >= rectY + halfHeight - SCOPE &&
    y <= rectY + halfHeight + SCOPE
  ) {
    console.log("right");
    return DIRECTIONS.LEFT;
  }

  // 中间

  if (
    x > rectX + SCOPE &&
    x < rectX + width - SCOPE &&
    y > rectY + SCOPE &&
    y < rectY + height - SCOPE
  ) {
    return DIRECTIONS.MIDDLE;
  }

  return DIRECTIONS.DEFAULT;
}

// 获取命中的组件
function getMatchedComponentsByLoc(x: number, y: number) {
  return [...drag._rectMap.values()].filter((rect: Rect) => {
    const { width, height } = rect;
    const { x: rectX, y: rectY } = rect.$el.getBoundingClientRect();
    const inX = rectX < x && rectX + width > x;
    const inY = rectY < y && rectY + height > y;
    return inX && inY;
  });
}

// 获取命中组件by data-id
function getMatchedComponentsById(e: MouseEvent): Rect[] {
  const { id = null } = (e.target as HTMLButtonElement)?.dataset;
  if (!id) return [];
  return [drag._rectMap.get(id)];
}
