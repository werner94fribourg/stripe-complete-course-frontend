export type IdempotencyType = 'order' | 'sub';

export function generateIdempotencyKey(type: IdempotencyType): string {
  return `idem_${type}_${crypto.randomUUID()}`;
}
