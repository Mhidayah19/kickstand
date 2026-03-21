import type { StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand';

type LogMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name: string,
) => StateCreator<T, Mps, Mcs>;

function logChanged<T>(name: string, prev: T, next: T): void {
  if (!__DEV__) return;

  const changed = Object.entries(next as Record<string, unknown>)
    .filter(
      ([key, val]) =>
        (prev as Record<string, unknown>)[key] !== val &&
        typeof val !== 'function',
    )
    .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
    .join(', ');

  if (changed) {
    console.log(`[${name}] ${changed}`);
  }
}

const logImpl: LogMiddleware = (f, name) => (set, get, api) => {
  type S = ReturnType<typeof get>;
  type SetState = StoreApi<S>['setState'];

  const origSetState: SetState = (api as StoreApi<S>).setState;

  (api as StoreApi<S>).setState = ((...args: Parameters<SetState>) => {
    const prev = get();
    origSetState(...args);
    logChanged(name, prev, get());
  }) as SetState;

  return f(
    (api as StoreApi<S>).setState as typeof set,
    get,
    api,
  );
};

export const log = logImpl;
