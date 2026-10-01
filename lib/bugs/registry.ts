/**
 * Registro central dos bugs intencionais. Cada bug só se manifesta com o
 * Modo Bugs ligado. O gabarito completo está em BUGS.md.
 */
export const BUGS = {
  "login-locked-remember": "B01",
  "logout-keeps-session": "B02",
  "form-email-tld": "B03",
  "form-cpf-digits": "B04",
  "form-password-confirm": "B05",
  "form-phone-label": "B06",
  "crud-negative-price": "B07",
  "crud-edit-wrong-item": "B08",
  "table-sort-lexical": "B09",
  "table-last-page": "B10",
  "table-search-case": "B11",
  "cart-total-qty": "B12",
  "cart-coupon-twice": "B13",
  "checkout-free-shipping-boundary": "B14",
  "dynamic-button-late": "B15",
  "dnd-saved-order": "B16",
  "upload-size-kb": "B17",
  "api-create-status": "B18",
  "api-not-found": "B19",
  "crud-save-click": "B20",
} as const;

export type BugKey = keyof typeof BUGS;
