/** A comparison rule */
type Rule = {
  /** The path of the value which should be used to compared two objects */
  path: string;
  /** If true the values are sorted ascending else descending */
  asc: boolean;
};

/**
 *
 * @param values An array of objects
 * @param rules An array of comparison rules
 * @returns A reference to the sorted array. NOTE: The original array is modified
 */
export const sortBy = (values: any[], rules: Rule[]) => {
  const _compare = (a: any, b: any, rules: Rule[]): -1 | 1 => {
    const rule = rules.shift();
    if (!rule) return -1;

    if (a[rule.path] < b[rule.path]) return rule.asc ? -1 : 1;
    if (a[rule.path] > b[rule.path]) return rule.asc ? 1 : -1;

    return _compare(a, b, rules);
  };

  return values.sort((a, b) => _compare(a, b, [...rules]));
};
