import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type LogImpl = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name: string,
) => StateCreator<T, Mps, Mcs>;

const logImpl: LogImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const prev = get();
    (set as Function)(...args);
    const next = get();

    if (__DEV__) {
      const changed = Object.entries(next as Record<string, unknown>)
        .filter(([key, val]) => (prev as Record<string, unknown>)[key] !== val && typeof val !== 'function')
        .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
        .join(', ');

      if (changed) {
        console.log(`[${name}] ${changed}`);
      }
    }
  };

  return f(loggedSet, get, store);
};

export const log = logImpl as unknown as <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name: string,
) => StateCreator<T, Mps, Mcs>;
