// 是否是字符串
// 是否是DOM节点
const isDomNode$1 = (node) => node instanceof Element;
// 生成唯一id
const getUniqueId = () => Math.random().toString(36) + Date.now().toString(36);
const creatRect = (options = {}) => {
    const rect = {};
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
function normalizeProps(rect, options) {
    const { el = null, top = 0, left = 0, width = 150, height = 30 } = options;
    const initial = {
        id: getUniqueId(),
        $el: document.createElement('div'),
        checked: false,
        width,
        height,
        top,
        left
    };
    if (isDomNode$1(el)) {
        const { width, height } = el.getBoundingClientRect();
        const $component = el.cloneNode(true);
        initial.$component = $component;
        initial.width = width;
        initial.height = height;
        setCss$1($component, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: -1,
            disabled: true
        });
        initial.$el.appendChild($component);
        Object.assign(rect, initial);
    }
    setCss$1(initial.$el, {
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
function setCover(rect) {
    const $cover = document.createElement('div');
    setCss$1($cover, {
        position: 'absolute',
        zIndex: 999,
        width: '100%',
        height: '100%',
        opcity: 0
    });
    rect.$el.appendChild($cover);
}
// 初始化样式
function setCss$1(node, cssObj) {
    Object.keys(cssObj).forEach((key) => {
        // @ts-ignore
        node.style[key] = cssObj[key];
    });
}
// proxy handler
function updateStyle(target, prop, value) {
    switch (prop) {
        case 'width':
        case 'height':
        case 'left':
        case 'top':
            setCss$1(target.$el, {
                [prop]: `${value}px`
            });
            break;
        case 'checked':
            setCss$1(target.$el, {
                border: `1px solid ${value ? 'skyblue' : '#ddd'}`
            });
    }
}

// 是否是字符串
const isString = (str) => typeof str === 'string';
// 是否是DOM节点
const isDomNode = (node) => node instanceof Element;
// 定义rect 8个方向的误差范围
const SCOPE = 10;
var CURSOR_DIRECTIONS;
(function (CURSOR_DIRECTIONS) {
    CURSOR_DIRECTIONS["TOP"] = "top";
    CURSOR_DIRECTIONS["RIGHT_TOP"] = "right_top";
    CURSOR_DIRECTIONS["RIGHT"] = "right";
    CURSOR_DIRECTIONS["RIGHT_BOTTOM"] = "right_bottom";
    CURSOR_DIRECTIONS["BOTTOM"] = "bottom";
    CURSOR_DIRECTIONS["LEFT_BOTTOM"] = "left_bottom";
    CURSOR_DIRECTIONS["LEFT"] = "left";
    CURSOR_DIRECTIONS["LEFT_TOP"] = "left_top";
    CURSOR_DIRECTIONS["MIDDLE"] = "middle";
    CURSOR_DIRECTIONS["DEFAULT"] = "default";
})(CURSOR_DIRECTIONS || (CURSOR_DIRECTIONS = {}));
const CURSOR_STYLE_MAP = {
    [CURSOR_DIRECTIONS.TOP]: 'ns-resize',
    [CURSOR_DIRECTIONS.RIGHT_TOP]: 'nesw-resize',
    [CURSOR_DIRECTIONS.RIGHT]: 'ew-resize',
    [CURSOR_DIRECTIONS.RIGHT_BOTTOM]: 'nwse-resize',
    [CURSOR_DIRECTIONS.BOTTOM]: 'ns-resize',
    [CURSOR_DIRECTIONS.LEFT_BOTTOM]: 'nesw-resize',
    [CURSOR_DIRECTIONS.LEFT]: 'ew-resize',
    [CURSOR_DIRECTIONS.LEFT_TOP]: 'nwse-resize',
    [CURSOR_DIRECTIONS.DEFAULT]: 'default',
    [CURSOR_DIRECTIONS.MIDDLE]: 'move'
};
let drag;
const createDrag = (options = {}) => {
    drag = {
        _rectMap: new Map() // 物料存储区
    };
    init(drag, options);
    // 挂载节点
    mount(drag);
    //  返回一些api
    return drag;
};
// 初始化
function init(drag, options) {
    // 格式化wrap
    normalizeContainer(drag, options);
    if (!drag._container)
        return;
    // 格式化画布
    normalizeCanvas(drag);
    // 格式化网格
    normalizeGrid(drag, options);
    // 绑定事件
    bindEvent(drag._container.$el);
}
// 格式化容器
function normalizeContainer(drag, options) {
    let $el = null;
    const { el } = options;
    // pass id selector
    if (isString(el)) {
        $el = document.querySelector(options.el);
    }
    // pass DOM
    if (isDomNode(options.el))
        $el = el;
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
function normalizeCanvas(drag) {
    const { width, height } = drag._container;
    drag._canvas = {
        $el: document.createElement('div'),
        width,
        height
    };
}
// 格式化网格
function normalizeGrid(drag, options) {
    const { showGrid = true } = options;
    drag.showGrid = showGrid;
    if (!showGrid)
        return; // 不需要grid
    const { gridHeight = 15, gridWidth = 15 } = options;
    const { width, height } = drag._canvas;
    const $el = document.createElement('canvas');
    drag._grid = {
        $el,
        $ctx: $el.getContext('2d'),
        gridHeight,
        gridWidth,
        width,
        height,
        draw: drawGrid
    };
}
// 绑定事件
function bindEvent(node) {
    node.addEventListener('mousedown', (e) => handleMouseDown(e));
    node.addEventListener('mouseup', (e) => handleMouseUp(e));
    node.addEventListener('click', (e) => handleClick);
    node.addEventListener('mousemove', (e) => handleMouseMove(e));
}
// 点击事件 down -> up -> click
function handleClick(e) { }
// 点击事件
function handleMouseDown(e) {
    // 更新鼠标样式
    updatePointStyle(e);
    // 更新基准点位置
    updateRefPointLoc(e);
    // 更新组件选中状态
    updateComponentsStatus(e);
}
// 点击事件
function handleMouseUp(e) {
    // 置空点击位置
    updateRefPointLoc(e, 'reset');
}
// 鼠标移动
function handleMouseMove(e) {
    // 更新鼠标样式
    updatePointStyle(e);
    // 更新位置
    updateComponentsLoc(e);
}
// 挂载
function mount(drag) {
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
const calcCount = (unitWidth, totalWidth) => Math.ceil(totalWidth / unitWidth);
// 绘制网格线
function drawGrid(grid) {
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
// 设置样式
function setCss(node, cssObj) {
    Object.keys(cssObj).forEach((key) => {
        // @ts-ignore
        node.style[key] = cssObj[key];
    });
}
// 创建方块
const createShap = (options) => {
    const rect = creatRect(options);
    const { id, $el } = rect;
    drag._rectMap.set(id, rect);
    drag._canvas.$el.appendChild($el);
};
// 更新参考点位置
function updateRefPointLoc(e, type) {
    if (type === 'reset') {
        drag.refPointLoc = null;
        return;
    }
    drag.refPointLoc = { x: e.x, y: e.y };
}
// 更新组件的选中状态
function updateComponentsStatus(e) {
    [...drag._rectMap.values()].forEach((rect) => (rect.checked = false));
    getMatchedComponents(e.x, e.y).forEach((rect) => (rect.checked = true));
}
// 获取选中的组件
function getCheckedComponents() {
    return [...drag._rectMap.values()].filter((rect) => rect.checked);
}
// 更新位置
function updateComponentsLoc(e) {
    const checkedComponents = getCheckedComponents();
    if (checkedComponents.length === 0 || !drag.refPointLoc)
        return;
    // 计算x, y 变化值
    const { x: startX, y: startY } = drag.refPointLoc;
    const { x: endX, y: endY } = e;
    const changeX = endX - startX;
    const changeY = endY - startY;
    checkedComponents.forEach((rect) => {
        const left = rect.left + changeX;
        const top = rect.top + changeY;
        // 不能超出边界 暂时定左边界和上边界
        rect.left = left > 0 ? left : 0;
        rect.top = top > 0 ? top : 0;
    });
    // 更新refPointLoc
    updateRefPointLoc(e);
}
// 更新鼠标样式
function updatePointStyle(e) {
    // 0. 未悬停在rect上 defalut
    // 1. 鼠标悬浮在rect各个位置(8个方向)不同鼠标样式
    const currentRect = getMatchedComponents(e.x, e.y)[0];
    let cursorStyle = '';
    if (currentRect) {
        const direction = getDirection(currentRect, e);
        cursorStyle = direction ? CURSOR_STYLE_MAP[direction] : CURSOR_STYLE_MAP.default;
    }
    // 移动中(基准点在，说明在移动中)
    cursorStyle = !!drag.refPointLoc ? CURSOR_DIRECTIONS.MIDDLE : cursorStyle;
    setCss(drag._container.$el, {
        cursor: cursorStyle
    });
}
// 获取位置
function getDirection(rect, e) {
    const { width, height } = rect;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const { x, y } = e;
    const { x: rectX, y: rectY } = rect.$el.getBoundingClientRect();
    // left-top
    if (x >= rectX && x <= rectX + SCOPE && y >= rectY && y <= rectY + SCOPE) {
        return CURSOR_DIRECTIONS.LEFT_TOP;
    }
    // top
    if (x >= rectX + halfWidth - SCOPE && x <= rectX + rectX + halfWidth + SCOPE && y >= rectY && y <= rectY + SCOPE) {
        return CURSOR_DIRECTIONS.TOP;
    }
    // right-top
    if (x >= rectX + width - SCOPE && x <= rectX + width && y >= rectY && y <= rectY + SCOPE) {
        console.log(21231321);
        return CURSOR_DIRECTIONS.RIGHT_TOP;
    }
    // right
    if (x >= rectX + width - SCOPE &&
        x <= rectX + width &&
        y >= rectY + halfHeight - SCOPE &&
        y < rectY + halfHeight + SCOPE) {
        return CURSOR_DIRECTIONS.RIGHT;
    }
    // right-bottom
    if (x >= rectX + width - SCOPE && x <= rectX + width && y >= rectY + height - SCOPE && y <= rectY + height) {
        return CURSOR_DIRECTIONS.RIGHT_BOTTOM;
    }
    // bottom
    if (x >= rectX + halfWidth - SCOPE &&
        x <= rectX + halfWidth + SCOPE &&
        y >= rectY + height - SCOPE &&
        y <= rectY + height) {
        return CURSOR_DIRECTIONS.BOTTOM;
    }
    // left-bottom
    if (x >= rectX && x <= rectX + SCOPE && y > rectY + height - SCOPE && y < rectY + height) {
        return CURSOR_DIRECTIONS.LEFT_BOTTOM;
    }
    // left
    if (x >= rectX && x <= rectX + SCOPE && y >= rectY + halfHeight - SCOPE && y <= rectY + halfHeight - SCOPE) {
        return CURSOR_DIRECTIONS.LEFT;
    }
    // 中间
    if (x > rectX + SCOPE && x < rectX + width - SCOPE && y > rectY + SCOPE && y < rectY + height - SCOPE) {
        return CURSOR_DIRECTIONS.MIDDLE;
    }
}
// 获取命中的组件
function getMatchedComponents(x, y) {
    return [...drag._rectMap.values()].filter((rect) => {
        const { width, height } = rect;
        const { x: rectX, y: rectY } = rect.$el.getBoundingClientRect();
        const inX = rectX < x && rectX + width > x;
        const inY = rectY < y && rectY + height > y;
        return inX && inY;
    });
}

export { createDrag, createShap };
