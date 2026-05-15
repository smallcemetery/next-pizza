import { CartItemDTO } from '../services/dto/cart.dto';

export const calcCartItemTotalPrice = (item: CartItemDTO): number => {
  const ingredientsPrice = item.ingredients.reduce((acc, ingredient) => acc + ingredient.price, 0);

  let builderExtra = 0;
  const raw = item.builderPayload;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const tops = (raw as { toppings?: unknown }).toppings;
    if (Array.isArray(tops)) {
      builderExtra = tops.length * 25;
    }
  }

  return (ingredientsPrice + item.productItem.price + builderExtra) * item.quantity;
};
