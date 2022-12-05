// 是否是字符串
const isString = (str: any) => typeof str === 'string';
// 是否是DOM节点
const isDomNode = (node: any) => node instanceof Element;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
}

export const createDrag = (options: any) => {
  const drag: any = {
    _rectMap: new Map() // 物料存储区
  };

  init(drag, options);

  //
  mount(drag);

  //  返回一些api
  return drag;
};

// 初始化
function init<T extends DragProps>(drag: T, options: any) {
  // 格式化wrap
  normalizeContainer(drag, options);
  if (!drag._container) return;
  // 格式化画布
  normalizeCanvas(drag);
  // 格式化网格
  normalizeGrid(drag, options);
}

// 格式化容器
function normalizeContainer<T extends DragProps>(drag: T, options: any) {
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
function normalizeCanvas<T extends DragProps>(drag: T) {
  const { width, height } = drag._container;
  drag._canvas = {
    $el: document.createElement('div'),
    width,
    height
  };
}

// 格式化网格
function normalizeGrid<T extends DragProps>(drag: T, options: any) {
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

// 挂载
function mount(drag: DragProps) {
  // 挂载画布

  // @ts-ignore
  drag._canvas.$el.style.css({
    with: `${drag._canvas.width}px`,
    height: `${drag._canvas.height}px`,
    zIndex: 0,
    position: 'relative'
  });

  drag._container.$el.appendChild(drag._canvas.$el);
  drag._grid.draw(drag._grid);

  //
  drag._container.$el.appendChild(drag._grid.$el);
}

// 计算份儿
const calcCount = (unitWidth: number, totalWidth: number): number => Math.ceil(totalWidth / unitWidth);

// 绘制网格线
function drawGrid(grid: GridPros) {
  // @ts-ignore
  console.log(grid);
  const { width, height, gridWidth, gridHeight, $ctx } = grid;
  const rows = calcCount(gridHeight, height);
  const columns = calcCount(gridWidth, width);

  grid.$el.width = width;
  grid.$el.height = height;
  grid.$el.style.backgroundColor = '#FFFFFF';

  [...Array(rows)].forEach((_, index) => {
    $ctx.beginPath();

    $ctx.strokeStyle = index % 4 === 0 ? '#cccccc' : '#e6e6e6';
    const y = index * gridHeight;
    $ctx.moveTo(0, y + 0.5); // +0.5处理canvas模糊问题
    $ctx.lineTo(width, y);
    $ctx.stroke();
    $ctx.closePath();
  });

  [...Array(columns)].forEach((_, index) => {
    $ctx.beginPath();
    $ctx.strokeStyle = index % 4 === 0 ? '#cccccc' : '#e6e6e6';
    const x = index * gridWidth;
    $ctx.moveTo(x + 0.5, 0); // +0.5处理canvas模糊问题
    $ctx.lineTo(x, height);
    $ctx.stroke();
    $ctx.closePath();
  });
}
