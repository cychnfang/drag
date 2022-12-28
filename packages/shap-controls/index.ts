export function createShapControls(drag: Drag) {
  drag._shapControls = {
    drag
  };

  // 初始化容器
  normalizeContainer(drag._shapControls);
  // 初始化缩放按钮
  normalizeControls(drag._shapControls);
}

// 初始化容器
function normalizeContainer(shapControls: any) {
  const _container = {
    $el: document.createElement('div'),
    with: 100,
    height: 100,
    left: 0,
    top: 0
  };

  shapControls._container = new Proxy(_container, getShapContainerhandler());
}

function getShapContainerhandler() {
  return {
    set(target: any, prop: string | symbol, value: any, receiver: any): boolean {
      updateControlsLoc();
      return receiver;
    },
    get(target: any, prop: string | symbol) {
      return target[prop];
    }
  };
}

function shapControlSet(target: any, prop: string | symbol, value: any, receiver: any): boolean {
  updateControlsLoc();
  return receiver;
}

function gethandler(target: any, prop: string | symbol) {
  return target[prop];
}

// 初始化缩放控制器
function normalizeControls(shapControls: any) {
  const _controls: any = {};
  ['n', 'en', 'e', 'es', 's', 'ws', 'w', 'wn'].forEach((direction) => {
    const $el = document.createElement('div');
    shapControls._container.$el.appendChild($el);
    $el.classList.add(...['shape_controller', direction]);
    _controls[direction] = {
      $el,
      width: 6,
      height: 6,
      left: 0,
      top: 0
    };
  });

  shapControls._controls = new Proxy(_controls, {});
  shapControls._container._controls = shapControls._controls;
}

// 更新controls位置
function updateControlsLoc() {}
