/**
 * Barrel export so specs can do:
 *   import { HomePage, LoginModal, CartPage } from '../../../pages';
 */

// Pages
export { default as HomePage } from './HomePage';
export { default as ProductPage } from './ProductPage';
export { default as CartPage } from './CartPage';

// Shared components
export { default as NavBar } from '../components/NavBar';
export { default as SignUpModal } from '../components/SignUpModal';
export { default as LoginModal } from '../components/LoginModal';
export { default as CheckoutModal } from '../components/CheckoutModal';
