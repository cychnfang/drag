interface GridPros {
  $el: HTMLCanvasElement;
  $ctx: CanvasRenderingContext2D
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  draw: <T extends GridPros>(grid: T) => void;
}

interface DragProps {
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

  _rectMap: Map;
  showGrid: boolean;
}
