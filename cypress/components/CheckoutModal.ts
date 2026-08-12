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

  // --- Locators -----------------------------------------------------------
  private get nameInput() {
    return cy.get('#name');
  }

  private get countryInput() {
    return cy.get('#country');
  }

  private get cityInput() {
    return cy.get('#city');
  }

  private get creditCardInput() {
    return cy.get('#card');
  }

  private get monthInput() {
    return cy.get('#month');
  }

  private get yearInput() {
    return cy.get('#year');
  }

  private get purchaseButton() {
    return this.root.contains('button', 'Purchase');
  }

  private get confirmationDialog() {
    return cy.get('.sweet-alert');
  }

  private get confirmationOkButton() {
    return cy.get('.confirm');
  }

  // --- Actions ------------------------------------------------------------
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
    // sweetalert only wires up its confirm-click handler once the container
    // carries the "visible" class, which is added slightly after the
    // "showSweetAlert" animation class — clicking before that closes the
    // dialog visually but silently skips the confirm callback (no
    // navigation). Wait for it explicitly, the same lesson as
    // BaseModal.waitUntilReady for Bootstrap modals.
    this.confirmationDialog.should('have.class', 'visible');
    this.confirmationOkButton.click();
  }

  // --- State readers ------------------------------------------------------
  getConfirmationDialog(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.confirmationDialog;
  }
}

export default new CheckoutModal();
