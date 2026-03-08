export interface CartItemResponse {
  cartItemId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartResponse {
  cartId: string;
  userId: string;
  eventId: string;
  items: CartItemResponse[];
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedPromoCode?: string;
}

export interface AddToCartRequest {
  ticketTypeId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

