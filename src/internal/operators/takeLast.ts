import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";
import { operator } from '../util/operator';

export function takeLast<T>(count: number = 1): Operation<T, T> {
  count = Math.max(count, 0);
  return operator((source: Observable<T>, type: FOType, dest: Sink<T>, subs: Subscription) => {
    const buffer: T[] = [];
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          buffer.push(v);
          while (buffer.length > count) buffer.shift();
          break;
        case FOType.COMPLETE:
          while (buffer.length > 0) {
            dest(FOType.NEXT, buffer.shift(), subs);
          }
          dest(FOType.COMPLETE, undefined, subs);
          break;
        default:
          dest(t, v, subs);
          break;
      }
    }, subs);
  });
}
