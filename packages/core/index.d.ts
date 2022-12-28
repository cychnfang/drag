// drag props
interface Drag {
  // 容器
  _container: {
    $el: Element;
    width: number;
    height: number;
  };

  _canvas: {
    $el: Element;
    width: number;
    height: number;
  };

  // 网格
  _grid: GridPros;

  _componentsMap: Map;
  showGrid: boolean;
  refPointLoc: null | { x: number; y: number };
  actionInfo: { type: string; direction: string };
  layouts: number[] // 层级
  _underControl: boolean
  _canMove: boolean

  // 缩放控制器
  _shapControls: any

  // function
  on: (type: string, cb: Function) => void;
  off: (type: string, cb: Function) => void;
  emit: <T>(type: string, data: T) => void;
}

interface GridPros {
  $el: HTMLCanvasElement;
  $ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  draw: <T extends GridPros>(grid: T) => void;
}

interface RectOptions {}
