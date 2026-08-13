/** Shared data models used by fixtures, page objects, and specs. */

export interface UserCredentials {
  username: string;
  password: string;
}

export interface CheckoutInfo {
  name: string;
  country: string;
  city: string;
  creditCard: string;
  month: string;
  year: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
}

/**
 * A stored cart entry as returned by /viewcart. The "cookie" field holds the
 * plain username, not the auth token (see clearCartByApi in commands.ts).
 */
export interface CartItem {
  id: string;
  cookie: string;
  prod_id: number;
}
