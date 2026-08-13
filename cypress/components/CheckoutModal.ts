import BaseModal from './BaseModal';
import type { CheckoutInfo } from '../types/models';

/**
 * "Place order" checkout modal on the cart page: customer/payment form,
 * purchase button, and the resulting sweet-alert confirmation.
 */
class CheckoutModal extends BaseModal {
  constructor() {
    super('#orderModal');
  }

  // Form fields are scoped to the modal root: their ids (#name, #city, ...)
  // are generic enough to collide with other page elements.
  private get nameInput() {
    return this.root.find('#name');
  }

  private get countryInput() {
    return this.root.find('#country');
  }

  private get cityInput() {
    return this.root.find('#city');
  }

  private get creditCardInput() {
    return this.root.find('#card');
  }

  // Populated by cart.js when the cart page loads (not when the modal
  // opens), from the same total shown in CartPage.getTotalPrice().
  private get totalLabel() {
    return this.root.find('#totalm');
  }

  private get monthInput() {
    return this.root.find('#month');
  }

  private get yearInput() {
    return this.root.find('#year');
  }

  private get purchaseButton() {
    return this.root.contains('button', 'Purchase');
  }

  private get confirmationDialog() {
    return cy.get('.sweet-alert');
  }

  private get confirmationOkButton() {
    return cy.get('.sweet-alert button.confirm');
  }

  fillOrderForm(info: CheckoutInfo): void {
    this.waitUntilReady();
    this.nameInput.type(info.name);
    this.countryInput.type(info.country);
    this.cityInput.type(info.city);
    this.creditCardInput.type(info.creditCard);
    this.monthInput.type(info.month);
    this.yearInput.type(info.year);
  }

  purchase(): void {
    this.purchaseButton.click();
  }

  confirmPurchase(): void {
    // Clicking before sweetalert adds "visible" skips its confirm callback silently.
    this.confirmationDialog.should('have.class', 'visible');
    this.confirmationOkButton.click();
  }

  getConfirmationDialog(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.confirmationDialog;
  }

  getTotal(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.totalLabel;
  }

  getCreditCardInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.creditCardInput;
  }
}

export default new CheckoutModal();
