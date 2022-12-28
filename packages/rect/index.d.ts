interface Rect {
  id: string;
  $el: Element;
  $component: Element | null;
  left: number;
  top: number;
  width: number;
  height: number;
  checked: boolean;
  layout: number;
  sort: number;
}

interface Component {
  id: string;
  $el: Element;
  $component: Element | null;
  left: number;
  top: number;
  width: number;
  height: number;
  checked: boolean;
  layout: number;
  sort: number;
}
