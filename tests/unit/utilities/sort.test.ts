import {sortBy} from 'utilities';

describe('sortBy', () => {
  it('sorts with one rule', () => {
    const values = [{a: 1}, {a: 0}, {a: 2}];
    sortBy(values, [{path: 'a', asc: true}]);

    expect(values).toStrictEqual([{a: 0}, {a: 1}, {a: 2}]);
  });

  it('sorts descending', () => {
    const values = [{a: 1}, {a: 0}, {a: 2}];
    sortBy(values, [{path: 'a', asc: false}]);

    expect(values).toStrictEqual([{a: 2}, {a: 1}, {a: 0}]);
  });

  it('sorts with one rule if second is not needed', () => {
    const values = [
      {a: 1, b: 2},
      {a: 0, b: 1},
      {a: 2, b: 0},
    ];
    sortBy(values, [
      {path: 'a', asc: true},
      {path: 'b', asc: true},
    ]);

    expect(values).toStrictEqual([
      {a: 0, b: 1},
      {a: 1, b: 2},
      {a: 2, b: 0},
    ]);
  });

  it('sorts with more than one rule in case of equality', () => {
    const values = [
      {a: 1, b: 2},
      {a: 1, b: 1},
      {a: 2, b: 0},
    ];
    sortBy(values, [
      {path: 'a', asc: true},
      {path: 'b', asc: true},
    ]);

    expect(values).toStrictEqual([
      {a: 1, b: 1},
      {a: 1, b: 2},
      {a: 2, b: 0},
    ]);
  });
});
