export interface Mapper<T, P> {
  toPersistence: (entity: T) => P;
  toDomain: (raw: P) => T;
}
