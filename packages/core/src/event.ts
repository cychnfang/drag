export class EventCenter {
  eventMap: Map<string, Function[]> = new Map();

  on(type: string, cb: Function) {
    const queue = this.eventMap.get(type);
    queue || this.eventMap.set(type, [cb]);
    queue && queue.push(cb);
  }

  off(type: string, cb?: Function) {
    const queueas: Function[] = this.eventMap.get(type) || [];
    cb || this.eventMap.set(type, []);
    cb &&
      this.eventMap.set(
        type,
        queueas.filter((item) => item === cb)
      );
  }

  emit(type: string, data?: any) {
    // @ts-ignore
    (this.eventMap.get(type) || []).forEach((cb: Function) => cb(data));
  }
}
