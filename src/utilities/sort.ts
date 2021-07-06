type Rule = {path: string; asc: boolean};

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
