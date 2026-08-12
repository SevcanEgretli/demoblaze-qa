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
