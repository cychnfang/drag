function createRectInstance(options) {
    const instance = {
        $el: options.el,
        id: null,
        x: options.x || 0,
        y: options.y || 0,
        width: 0,
        height: 0
    };
    instance.$el = instance.$el;
    const { width, height } = instance.$el.getBoundingClientRect();
    setTimeout(() => {
        console.log(instance.$el.getBoundingClientRect(), '-----');
    });
    Promise.resolve().then(res => {
    });
    instance.width = width;
    instance.height = height;
    instance.$el.style.position = 'absolute';
    instance.$el.style.left = `${instance.x}px`;
    instance.$el.style.top = `${instance.y}px`;
    return instance;
}
// export function initProps(el, rawProps) {
//   const props = {};
//   const { x, y, el } = rawProps;
// }

function createDrag(options) {
    const drag = {};
    drag._rectMap = new Map();
    // 创建模块
    drag.createRect = (rect) => {
        createRect(drag, rect);
    };
    initOptions(drag, options);
    drag.$el.appendChild(drag._container.$el);
    return drag;
}
function initOptions(drag, options) {
    const { el, width = 3000, height = 1500 } = options;
    drag.$el = document.querySelector(`#${el}`);
    drag.$el.style.overflow = 'auto';
    createContainer(drag, width, height);
    createGrid(drag, width, height);
}
function createContainer(drag, width, height) {
    const _container = {};
    drag._container = _container;
    _container.$el = document.createElement('div');
    _container.$el.style.width = `${width}px`;
    _container.$el.style.height = `${height}px`;
    _container.$el.style.position = 'relative';
    _container.$el.style.zIndex = 0;
    // 绑定鼠标事件
    bindEvent(drag._container.$el);
}
function createGrid(drag, width, height) {
    const _grid = {};
    drag._grid = _grid;
    _grid.gridWidth = 15;
    _grid.gridHeight = 15;
    _grid.rows = Math.floor((width * 0.7) / _grid.gridWidth);
    _grid.colums = Math.floor((height * 0.6) / _grid.gridHeight);
    _grid.$el = document.createElement('canvas');
    _grid.width = width * 0.7;
    _grid.height = height * 0.6;
    _grid.$el.width = _grid.width;
    _grid.$el.height = _grid.height;
    _grid.$el.style.background = '#FFFFFF';
    drawLine(drag);
    // 绘制线
    drag._container.$el.appendChild(drag._grid.$el);
}
function drawLine(drag) {
    const { gridWidth, gridHeight, width, height } = drag._grid;
    // 计算出当前行列数
    const rows = Math.floor(height / gridWidth);
    const colmuns = Math.floor(width / gridHeight);
    const ctx = drag._grid.$el.getContext('2d');
    [...Array(rows + 1)].forEach((item, index) => {
        ctx.beginPath();
        const y = index * gridHeight + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = index % 4 === 0 ? '#e6e6e6' : '#f1f1f1';
        ctx.stroke();
        ctx.closePath();
    });
    [...Array(colmuns + 1)].forEach((item, index) => {
        const x = index * gridWidth + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = index % 4 === 0 ? '#e6e6e6' : '#f1f1f1';
        ctx.stroke();
        ctx.closePath();
    });
}
function bindEvent($el) {
    $el.addEventListener('mousedown', (e) => {
        console.log(e);
    });
    $el.addEventListener('mouseup', (e) => {
        console.log('mouseup');
    });
    // $el.addEventListener('mousemove', (e) => {
    //   console.log('mousemove')
    // })
    $el.addEventListener('click', (e) => {
        console.log('click');
    });
}
// 创建模块
function createRect(drag, list = []) {
    list.forEach((item) => {
        const rect = createRectInstance(item);
        drag._container.$el.appendChild(rect.$el);
        drag._rectMap.set(1, rect);
    });
}

export { createDrag, initOptions };
