import { z } from 'zod';

export const checkoutFormSchema = z
  .object({
    firstName: z.string().min(2, { message: 'Имя должно содержать не менее 2-х символов' }),
    lastName: z.string().min(2, { message: 'Фамилия должна содержать не менее 2-х символов' }),
    email: z.string().email({ message: 'Введите корректную почту' }),
    phone: z.string().min(10, { message: 'Введите корректный номер телефона' }),
    address: z.string().optional(),
    comment: z.string().optional(),
    deliveryType: z.enum(['DELIVERY', 'PICKUP']),
    pickupPoint: z.string().optional(),
    scheduledFor: z.string().optional(),
    promoCode: z.string().optional(),
    bonusToSpend: z.coerce.number().min(0).optional().default(0),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === 'DELIVERY') {
      const a = data.address?.trim() ?? '';
      if (a.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Введите корректный адрес',
          path: ['address'],
        });
      }
    }

    if (data.deliveryType === 'PICKUP') {
      const p = data.pickupPoint?.trim() ?? '';
      if (p.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Выберите точку самовывоза',
          path: ['pickupPoint'],
        });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
