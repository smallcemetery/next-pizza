import { CartDTO } from '../services/dto/cart.dto';
import { calcCartItemTotalPrice } from './calc-cart-item-total-price';

export type CartStateItem = {
  id: number;
  quantity: number;
  name: string;
  imageUrl: string;
  price: number;
  disabled?: boolean;
  pizzaSize?: number | null;
  pizzaType?: number | null;
  ingredients: Array<{ name: string; price: number }>;
};

interface ReturnProps {
  items: CartStateItem[];
  totalAmount: number;
}

export const getCartDetails = (data: CartDTO): ReturnProps => {
  const items = data.items.map((item) => {
    const shortage = item.productItem.product.ingredients?.some((i) => i.isOutOfStock);
    return {
      id: item.id,
      quantity: item.quantity,
      name: item.productItem.product.name,
      imageUrl: item.productItem.product.imageUrl,
      price: calcCartItemTotalPrice(item),
      pizzaSize: item.productItem.size,
      pizzaType: item.productItem.pizzaType,
      disabled: Boolean(item.productItem.product.disabled || shortage),
      ingredients: item.ingredients.map((ingredient) => ({
        name: ingredient.name,
        price: ingredient.price,
      })),
    };
  }) as CartStateItem[];

  return {
    items,
    totalAmount: data.totalAmount,
  };
};
