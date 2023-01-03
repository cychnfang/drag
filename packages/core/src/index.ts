import { creatRect } from '../../rect/src/index';
import { EventCenter } from './event';
import { isString, isDomNode, setCss } from '../../utils/index';
import { createShapControls } from '../../shap-controls/index'

// 定义rect 8个方向的误差范围
const SCOPE = 10;

enum DIRECTIONS {
  TOP = 'top',
  RIGHT_TOP = 'right_top',
  RIGHT = 'right',
  RIGHT_BOTTOM = 'right_bottom',
  BOTTOM = 'bottom',
  LEFT_BOTTOM = 'left_bottom',
  LEFT = 'left',
  LEFT_TOP = 'left_top',
  MIDDLE = 'middle',
  DEFAULT = 'default'
}

const CURSOR_STYLE_MAP = {
  [DIRECTIONS.TOP]: 'ns-resize',
  [DIRECTIONS.RIGHT_TOP]: 'nesw-resize',
  [DIRECTIONS.RIGHT]: 'ew-resize',
  [DIRECTIONS.RIGHT_BOTTOM]: 'nwse-resize',
  [DIRECTIONS.BOTTOM]: 'ns-resize',
  [DIRECTIONS.LEFT_BOTTOM]: 'nesw-resize',
  [DIRECTIONS.LEFT]: 'ew-resize',
  [DIRECTIONS.LEFT_TOP]: 'nwse-resize',
  [DIRECTIONS.DEFAULT]: 'default',
  [DIRECTIONS.MIDDLE]: 'move'
};

enum ACTION_TYPE {
  DRAG = 'drag',
  RESIZE = 'resize'
}

const ACTION_TYPE_MAP = {
  [DIRECTIONS.TOP]: 'resize',
  [DIRECTIONS.RIGHT_TOP]: 'resize',
  [DIRECTIONS.RIGHT]: 'resize',
  [DIRECTIONS.RIGHT_BOTTOM]: 'resize',
  [DIRECTIONS.BOTTOM]: 'resize',
  [DIRECTIONS.LEFT_BOTTOM]: 'resize',
  [DIRECTIONS.LEFT]: 'resize',
  [DIRECTIONS.LEFT_TOP]: 'resize',
  [DIRECTIONS.DEFAULT]: 'drag',
  [DIRECTIONS.MIDDLE]: 'drag'
};

let drag: any;
export const createDrag = (options: any = {}) => {
  drag = {
    _componentsMap: new Map(), // 物料存储区
    layout: [1]
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

  // 绑定DOM事件
  bindEvent(drag._container.$el);

  // 绑定事件中心
  bindEventCenter(drag);
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
    console.warn('请传入dom节点，或者id选择器');
    return;
  }

  // init _container props
  const { width, height } = $el.getBoundingClientRect();
  drag._container = {
    $el,
    width,
    height
  };
}

// 格式化画布
function normalizeCanvas<T extends Drag>(drag: T) {
  const { width, height } = drag._container;
  drag._canvas = {
    $el: document.createElement('div'),
    width,
    height
  };
}

// 格式化网格
function normalizeGrid<T extends Drag>(drag: T, options: any) {
  const { showGrid = true } = options;
  drag.showGrid = showGrid;

  if (!showGrid) return; // 不需要grid
  const { gridHeight = 15, gridWidth = 15 } = options;
  const { width, height } = drag._canvas;
  const $el = document.createElement('canvas');
  drag._grid = {
    $el,
    $ctx: $el.getContext('2d') as CanvasRenderingContext2D,
    gridHeight,
    gridWidth,
    width,
    height,
    draw: drawGrid
  };
}

// 绑定事件
function bindEvent(node: Element) {
  node.addEventListener('mousedown', (e: any) => handleMouseDown(e));
  node.addEventListener('mouseup', (e: any) => handleMouseUp(e));
  node.addEventListener('click', (e: any) => handleClick(e));
  node.addEventListener('mousemove', (e: any) => handleMouseMove(e));
  node.addEventListener('contextmenu', (e: any) => e.preventDefault());
  document.addEventListener('keydown', (e: any) => handleKeyDown(e));
  document.addEventListener('keyup', (e: any) => handleKeyUp(e));
}

// 点击事件 down -> up -> click
function handleClick(e: MouseEvent) {
  console.log('handleClick');

  // 置空点击位置
  updateRefPointLoc(e, 'reset');
}

// 点击事件
function handleMouseDown(e: MouseEvent) {
  const matchedComponent = getMatchedComponentsById(e);
  drag._canMove = !!matchedComponent;
  // 点击未命中rect
  if (!matchedComponent) {
    updateComponentsStatus();
    return;
  }

  // 更新基准点信息(位置)
  updateRefPointLoc(e);
  // 更新操作方式
  updateActionType(matchedComponent, e);
  // 更新组件状态
  updateComponentsStatus([matchedComponent], true);
  // emit 组件信息
  const { left, top, width, height } = matchedComponent;
  drag.emit('click', { left, top, width, height, type: 'input' });
}

// 点击事件
function handleMouseUp(e: MouseEvent) {
  console.log('handleMouseUp');
  drag._canMove = false;
}

// 鼠标移动
function handleMouseMove(e: MouseEvent) {
  // 更新鼠标样式
  updatePointStyle(e);
  // 更新位置
  updateComponentsLoc(e);
}

// 键盘点击
function handleKeyDown(e: KeyboardEvent) {
  drag._underControl = e.key === 'Control';
}

// 键盘松开事件
function handleKeyUp(e: KeyboardEvent) {
  drag._underControl = false;
}

// 挂载
function mount(drag: Drag) {
  setCss(drag._container.$el, {
    overflow: 'auto'
  });
  setCss(drag._canvas.$el, {
    with: `${drag._canvas.width + 200}px`,
    height: `${drag._canvas.height + 200}px`,
    zIndex: 0,
    position: 'relative'
  });

  setCss(drag._grid.$el, {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1
  });

  drag._canvas.$el.appendChild(drag._grid.$el);
  drag._container.$el.appendChild(drag._canvas.$el);
  drag._grid.draw(drag._grid);
}

// 计算份额
const calcCount = (unitWidth: number, totalWidth: number): number => Math.ceil(totalWidth / unitWidth);

// 绘制网格线
function drawGrid(grid: GridPros) {
  // @ts-ignore
  const { width, height, gridWidth, gridHeight, $ctx } = grid;
  const rows = calcCount(gridHeight, height);
  const columns = calcCount(gridWidth, width);

  grid.$el.width = width;
  grid.$el.height = height;
  grid.$el.style.backgroundColor = '#FFFFFF';

  [...Array(rows)].forEach((_, index) => {
    $ctx.beginPath();

    $ctx.strokeStyle = index % 4 === 0 ? '#e6e6e6' : '#f1f1f1';
    const y = index * gridHeight;
    $ctx.moveTo(0, y + 0.5); // +0.5处理canvas模糊问题
    $ctx.lineTo(width, y);
    $ctx.stroke();
    $ctx.closePath();
  });

  [...Array(columns)].forEach((_, index) => {
    $ctx.beginPath();
    $ctx.strokeStyle = index % 4 === 0 ? '#e6e6e6' : '#f1f1f1';
    const x = index * gridWidth;
    $ctx.moveTo(x + 0.5, 0); // +0.5处理canvas模糊问题
    $ctx.lineTo(x, height);
    $ctx.stroke();
    $ctx.closePath();
  });
}

// 更新参考点位置信息
function updateRefPointLoc(e: MouseEvent, type?: string) {
  if (type === 'reset') {
    drag.refPointLoc = null;
    return;
  }
  drag.refPointLoc = { x: e.x, y: e.y };
}

// 更新组件的选中状态
function updateComponentsStatus(rects: Rect[] = [], checked = false) {
  const $components = [...drag._componentsMap.values()];

  const isIncludes =  rects.length > 0 ? !!$components.filter(c => c.checked).find(c => c.id === rects[0].id) : false;
  if ((!drag._underControl && !isIncludes)) {
    $components.forEach((c) => (c.checked = false));
  }

  rects.forEach((rect) => (rect.checked = checked));
}

// 更新操作类型
function updateActionType(rect: Rect, e: MouseEvent) {
  const direction = getDirection(rect, e);
  drag.actionInfo = {
    direction,
    type: ACTION_TYPE_MAP[direction]
  };
}

// 根据checked状态获取选中的组件
function getComponentsByStatus(checked: boolean = true) {
  return [...drag._componentsMap.values()].filter((rect) => rect.checked === checked);
}

// 更新位置
function updateComponentsLoc(e: MouseEvent) {
  if (!drag._canMove) return;
  const checkedComponents = getComponentsByStatus(true);
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
      case DIRECTIONS.TOP:
        if (changeY <= 0) {
          // top减小 height 增大
          const oTop = rect.top;
          rect.top = rect.top + changeY < 0 ? 0 : rect.top + changeY;
          rect.height = rect.height + oTop - rect.top;
        } else {
          // top增大 height减小
          const oHeight = rect.height;
          rect.height = rect.height - changeY < 30 ? 30 : rect.height - changeY;
          rect.top = rect.top + oHeight - rect.height;
        }
        break;
      case DIRECTIONS.RIGHT_TOP:
        rect.width = rect.width + changeX < 30 ? 30 : rect.width + changeX;
        if (changeY <= 0) {
          // top减小 height 增大
          const oTop = rect.top;
          rect.top = rect.top + changeY < 0 ? 0 : rect.top + changeY;
          rect.height = rect.height + oTop - rect.top;
        } else {
          // top增大 height减小
          const oHeight = rect.height;
          rect.height = rect.height - changeY < 30 ? 30 : rect.height - changeY;
          rect.top = rect.top + oHeight - rect.height;
        }
        break;
      case DIRECTIONS.RIGHT:
        rect.width = rect.width + changeX < 30 ? 30 : rect.width + changeX;
        break;
      case DIRECTIONS.RIGHT_BOTTOM:
        rect.width = rect.width + changeX < 30 ? 30 : rect.width + changeX;
        rect.height = rect.height + changeY < 30 ? 30 : rect.height + changeY;
        break;
      case DIRECTIONS.BOTTOM:
        rect.height = rect.height + changeY < 30 ? 30 : rect.height + changeY;
        break;
      case DIRECTIONS.LEFT_BOTTOM:
        rect.height = rect.height + changeY < 30 ? 30 : rect.height + changeY;
        if (changeX < 0) {
          // left 减小 width增大
          const oLeft = rect.left;
          rect.left = rect.left + changeX < 0 ? 0 : rect.left + changeX;
          rect.width = rect.width + oLeft - rect.left;
        } else {
          // left 增大 width减小
          const oWidth = rect.width;
          rect.width = rect.width - changeX < 30 ? 30 : rect.width - changeX;
          rect.left = rect.left + oWidth - rect.width;
        }
        break;

      case DIRECTIONS.LEFT:
        if (changeX < 0) {
          // left 减小 width增大
          const oLeft = rect.left;
          rect.left = rect.left + changeX < 0 ? 0 : rect.left + changeX;
          rect.width = rect.width + oLeft - rect.left;
        } else {
          // left 增大 width减小
          const oWidth = rect.width;
          rect.width = rect.width - changeX < 30 ? 30 : rect.width - changeX;
          rect.left = rect.left + oWidth - rect.width;
        }
        break;
      case DIRECTIONS.LEFT_TOP:
        if (changeX < 0) {
          // left 减小 width增大
          const oLeft = rect.left;
          rect.left = rect.left + changeX < 0 ? 0 : rect.left + changeX;
          rect.width = rect.width + oLeft - rect.left;
        } else {
          // left 增大 width减小
          const oWidth = rect.width;
          rect.width = rect.width - changeX < 30 ? 30 : rect.width - changeX;
          rect.left = rect.left + oWidth - rect.width;
        }
        if (changeY < 0) {
          // top减小 height 增大
          const oTop = rect.top;
          rect.top = rect.top + changeY < 0 ? 0 : rect.top + changeY;
          rect.height = rect.height + oTop - rect.top;
        } else {
          // top增大 height减小
          const oHeight = rect.height;
          rect.height = rect.height - changeY < 30 ? 30 : rect.height - changeY;
          rect.top = rect.top + oHeight - rect.height;
        }
        break;
      default:
    }
  });
}

// 更新鼠标样式
function updatePointStyle(e: MouseEvent) {
  if (drag.refPointLoc) return;
  const currentRect = getMatchedComponentsByLoc(e.x, e.y)[0] || null;
  const cursorStyle = CURSOR_STYLE_MAP[getDirection(currentRect, e)];
  setCss(drag._container.$el, {
    cursor: cursorStyle
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
  if (x >= rectX + halfWidth - SCOPE && x <= rectX + halfWidth + SCOPE && y >= rectY && y <= rectY + SCOPE) {
    return DIRECTIONS.TOP;
  }

  // right-top
  if (x >= rectX + width - SCOPE && x <= rectX + width && y >= rectY && y <= rectY + SCOPE) {
    return DIRECTIONS.RIGHT_TOP;
  }

  // right
  if (
    x >= rectX + width - SCOPE &&
    x <= rectX + width &&
    y >= rectY + halfHeight - SCOPE &&
    y < rectY + halfHeight + SCOPE
  ) {
    console.log('right');
    return DIRECTIONS.RIGHT;
  }

  // right-bottom
  if (x >= rectX + width - SCOPE && x <= rectX + width && y >= rectY + height - SCOPE && y <= rectY + height) {
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
  if (x >= rectX && x <= rectX + SCOPE && y > rectY + height - SCOPE && y < rectY + height) {
    return DIRECTIONS.LEFT_BOTTOM;
  }

  // left
  if (x >= rectX && x <= rectX + SCOPE && y >= rectY + halfHeight - SCOPE && y <= rectY + halfHeight + SCOPE) {
    console.log('right');
    return DIRECTIONS.LEFT;
  }

  // 中间

  if (x > rectX + SCOPE && x < rectX + width - SCOPE && y > rectY + SCOPE && y < rectY + height - SCOPE) {
    return DIRECTIONS.MIDDLE;
  }

  return DIRECTIONS.DEFAULT;
}

// 获取命中的组件
function getMatchedComponentsByLoc(x: number, y: number) {
  return [...drag._componentsMap.values()].filter((rect: Rect) => {
    const { width, height } = rect;
    const { x: rectX, y: rectY } = rect.$el.getBoundingClientRect();
    const inX = rectX < x && rectX + width > x;
    const inY = rectY < y && rectY + height > y;
    return inX && inY;
  });
}

// 获取命中组件by data-id
function getMatchedComponentsById(e: MouseEvent): Rect | null {
  const { id = null } = (e.target as HTMLButtonElement)?.dataset;
  if (!id) return null;
  return drag._componentsMap.get(id);
}

// 绑定事件
function bindEventCenter(drag: Drag) {
  const eventCenter = new EventCenter();
  drag.on = (type, cb) => eventCenter.on(type, cb);
  drag.off = (type, cb) => eventCenter.off(type, cb);
  drag.emit = (type, data) => eventCenter.emit(type, data);
}

// 碰撞判断
function getCollidingComponents(target: Rect): Rect[] {
  const $components = [...drag._componentsMap.values()].sort((a, b) => a.layout - b.layout);
  return $components.filter((source) => isColliding(source, target));
}

// 是否碰撞
function isColliding(source: Rect, target: Rect): boolean {
  const { width: sWidth, height: sHeight, left: sLeft, top: sTop } = source;
  const { width: tWidth, height: tHeight, left: tLeft, top: tTop } = target;
  return !(sTop + sHeight < tTop || sTop > tTop + tHeight || sLeft + sWidth < tLeft || sLeft > tLeft + tWidth);
}

// 创建方块
export const createShap = (options: any = {}) => {
  const sort = options.sort || drag._componentsMap.size + 1;
  const rect = creatRect({ ...options, sort });
  const $components = getCollidingComponents(rect).sort((a, b) => a.layout - b.layout);
  if ($components.length > 0) {
    rect.layout = ($components.pop() as Rect).layout + 1;
  } else {
    rect.layout = 1;
  }
  const { id, $el } = rect;
  drag._componentsMap.set(id, rect);
  drag._canvas.$el.appendChild($el);
};

// 创建底部方框
function updateShapControls() {
  if(drag.shapControls) {
    
  }
}
