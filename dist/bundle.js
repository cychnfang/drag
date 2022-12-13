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
        border: '1px solid #ddd'
    });
}
// 设置组件遮罩
function setCover(rect) {
    const $cover = document.createElement('div');
    $cover.dataset.id = rect.id;
    console.log(rect.id);
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
const isString = (str) => typeof str === "string";
// 是否是DOM节点
const isDomNode = (node) => node instanceof Element;
// 定义rect 8个方向的误差范围
const SCOPE = 10;
var DIRECTIONS;
(function (DIRECTIONS) {
    DIRECTIONS["TOP"] = "top";
    DIRECTIONS["RIGHT_TOP"] = "right_top";
    DIRECTIONS["RIGHT"] = "right";
    DIRECTIONS["RIGHT_BOTTOM"] = "right_bottom";
    DIRECTIONS["BOTTOM"] = "bottom";
    DIRECTIONS["LEFT_BOTTOM"] = "left_bottom";
    DIRECTIONS["LEFT"] = "left";
    DIRECTIONS["LEFT_TOP"] = "left_top";
    DIRECTIONS["MIDDLE"] = "middle";
    DIRECTIONS["DEFAULT"] = "default";
})(DIRECTIONS || (DIRECTIONS = {}));
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
var ACTION_TYPE;
(function (ACTION_TYPE) {
    ACTION_TYPE["DRAG"] = "drag";
    ACTION_TYPE["RESIZE"] = "resize";
})(ACTION_TYPE || (ACTION_TYPE = {}));
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
let drag;
const createDrag = (options = {}) => {
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
function normalizeCanvas(drag) {
    const { width, height } = drag._container;
    drag._canvas = {
        $el: document.createElement("div"),
        width,
        height,
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
    const $el = document.createElement("canvas");
    drag._grid = {
        $el,
        $ctx: $el.getContext("2d"),
        gridHeight,
        gridWidth,
        width,
        height,
        draw: drawGrid,
    };
}
// 绑定事件
function bindEvent(node) {
    node.addEventListener("mousedown", (e) => handleMouseDown(e));
    node.addEventListener("mouseup", (e) => handleMouseUp(e));
    node.addEventListener("click", (e) => handleClick);
    node.addEventListener("mousemove", (e) => handleMouseMove(e));
}
// 点击事件 down -> up -> click
function handleClick(e) { }
// 点击事件
function handleMouseDown(e) {
    const matchedComponents = getMatchedComponentsById(e);
    // 点击未命中rect
    if (matchedComponents.length === 0)
        return;
    // 更新基准点信息(位置)
    updateRefPointLoc(e);
    // 更新操作方式
    updateActionType(matchedComponents[0], e);
    // 更新组件状态
    updateComponentsStatus(matchedComponents);
}
// 点击事件
function handleMouseUp(e) {
    // 置空点击位置
    updateRefPointLoc(e, "reset");
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
const calcCount = (unitWidth, totalWidth) => Math.ceil(totalWidth / unitWidth);
// 绘制网格线
function drawGrid(grid) {
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
    setCss($el, { zIndex: drag._rectMap.size + 1 });
    drag._rectMap.set(id, rect);
    drag._canvas.$el.appendChild($el);
};
// 更新参考点位置信息
function updateRefPointLoc(e, type) {
    if (type === "reset") {
        drag.refPointLoc = null;
        return;
    }
    drag.refPointLoc = { x: e.x, y: e.y };
}
// 更新组件的选中状态
function updateComponentsStatus(rects) {
    [...drag._rectMap.values()].forEach((rect) => (rect.checked = false));
    rects.forEach((rect) => (rect.checked = true));
}
// 更新操作类型
function updateActionType(rect, e) {
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
function updateComponentsLoc(e) {
    const checkedComponents = getCheckedComponents();
    if (checkedComponents.length === 0 || !drag.refPointLoc)
        return;
    switch (drag.actionInfo.type) {
        case ACTION_TYPE.DRAG:
            handleComponentsDrag(e, checkedComponents);
            break;
        case ACTION_TYPE.RESIZE:
            handleComponentsResize(e, checkedComponents);
            break;
    }
    // 更新refPointLoc
    updateRefPointLoc(e);
}
// 处理拖动
function handleComponentsDrag(e, rects) {
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
function handleComponentsResize(e, rects) {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                }
                else {
                    // top增大 height减小
                    const oHeight = rect.height;
                    rect.height = rect.height - changeY < 30 ? 30 : rect.height - changeY;
                    rect.top = rect.top + oHeight - rect.height;
                }
                break;
        }
    });
}
// 更新鼠标样式
function updatePointStyle(e) {
    const currentRect = getMatchedComponentsByLoc(e.x, e.y)[0] || null;
    const cursorStyle = CURSOR_STYLE_MAP[getDirection(currentRect, e)];
    setCss(drag._container.$el, {
        cursor: cursorStyle,
    });
}
// 获取位置的方向
function getDirection(rect, e) {
    if (!rect)
        return DIRECTIONS.DEFAULT;
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
    if (x >= rectX + halfWidth - SCOPE &&
        x <= rectX + halfWidth + SCOPE &&
        y >= rectY &&
        y <= rectY + SCOPE) {
        return DIRECTIONS.TOP;
    }
    // right-top
    if (x >= rectX + width - SCOPE &&
        x <= rectX + width &&
        y >= rectY &&
        y <= rectY + SCOPE) {
        return DIRECTIONS.RIGHT_TOP;
    }
    // right
    if (x >= rectX + width - SCOPE &&
        x <= rectX + width &&
        y >= rectY + halfHeight - SCOPE &&
        y < rectY + halfHeight + SCOPE) {
        console.log("right");
        return DIRECTIONS.RIGHT;
    }
    // right-bottom
    if (x >= rectX + width - SCOPE &&
        x <= rectX + width &&
        y >= rectY + height - SCOPE &&
        y <= rectY + height) {
        return DIRECTIONS.RIGHT_BOTTOM;
    }
    // bottom
    if (x >= rectX + halfWidth - SCOPE &&
        x <= rectX + halfWidth + SCOPE &&
        y >= rectY + height - SCOPE &&
        y <= rectY + height) {
        return DIRECTIONS.BOTTOM;
    }
    // left-bottom
    if (x >= rectX &&
        x <= rectX + SCOPE &&
        y > rectY + height - SCOPE &&
        y < rectY + height) {
        return DIRECTIONS.LEFT_BOTTOM;
    }
    // left
    if (x >= rectX &&
        x <= rectX + SCOPE &&
        y >= rectY + halfHeight - SCOPE &&
        y <= rectY + halfHeight + SCOPE) {
        console.log("right");
        return DIRECTIONS.LEFT;
    }
    // 中间
    if (x > rectX + SCOPE &&
        x < rectX + width - SCOPE &&
        y > rectY + SCOPE &&
        y < rectY + height - SCOPE) {
        return DIRECTIONS.MIDDLE;
    }
    return DIRECTIONS.DEFAULT;
}
// 获取命中的组件
function getMatchedComponentsByLoc(x, y) {
    return [...drag._rectMap.values()].filter((rect) => {
        const { width, height } = rect;
        const { x: rectX, y: rectY } = rect.$el.getBoundingClientRect();
        const inX = rectX < x && rectX + width > x;
        const inY = rectY < y && rectY + height > y;
        return inX && inY;
    });
}
// 获取命中组件by data-id
function getMatchedComponentsById(e) {
    var _a;
    const { id = null } = (_a = e.target) === null || _a === void 0 ? void 0 : _a.dataset;
    if (!id)
        return [];
    return [drag._rectMap.get(id)];
}

export { createDrag, createShap };
