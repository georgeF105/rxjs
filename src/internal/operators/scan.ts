import { Operation, Sink, FOType, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { operator } from '../util/operator';

export function scan<T, R>(reducer: (state: R, value: T, index: number) => R, initialState?: R): Operation<T, R> {
  let hasState = arguments.length >= 2;
  return operator((source: Observable<T>, type: FOType, dest: Sink<R>, subs: Subscription) => {
    let i = 0;
    let state = initialState;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const index = i++;
        if (hasState) {
          v = tryUserFunction(reducer, state, v, index);
          if (resultIsError(v)) {
            dest(FOType.ERROR, v.error, subs);
            subs.unsubscribe();
            return;
          }
        }
        state = v;
        if (!hasState) {
          hasState = true;
          return;
        }
      }
      dest(t, v, subs);
    }, subs);
  });
}
