import { Operation, FOType, Sink, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from '../Subscription';
import { operator } from '../util/operator';

export function take<T>(count: number): Operation<T, T> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<T>, subs: Subscription) => {
    if (count <= 0) {
      dest(FOType.COMPLETE, undefined, subs);
      subs.unsubscribe();
      return;
    }
    let counter = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          counter++;
          dest(FOType.NEXT, v, subs);
          if (counter >= count) {
            dest(FOType.COMPLETE, undefined, subs);
            subs.unsubscribe();
          }
          break;
        case FOType.ERROR:
        case FOType.COMPLETE:
        default:
          dest(t, v, subs);
          break;
      }
    }, subs);
  });
}
