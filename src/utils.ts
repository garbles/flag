export function isObject(obj: any): obj is Object {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export const noDefaultsSymbol = Symbol("@@FLAG_NO_DEFAULTS");
