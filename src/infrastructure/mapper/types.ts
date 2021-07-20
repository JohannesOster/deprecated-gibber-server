export interface Mapper<T, P, D> {
  toPersistence: (entity: T) => P;
  toDomain: (raw: P) => T;
  toDTO: (entity: T) => D;
}
