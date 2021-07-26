export type Repository<T> = {
  save: (entity: T) => Promise<T>;
};
