import type { CartItemDTO } from '@/shared/services/dto/cart.dto';

export function parseOrderItems(raw: unknown): CartItemDTO[] {
  if (Array.isArray(raw)) {
    return raw as CartItemDTO[];
  }
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown;
      return Array.isArray(p) ? (p as CartItemDTO[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}
