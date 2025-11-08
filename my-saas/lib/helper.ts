// export function calculateTotal(items: InvoiceItem[]): number {
//   return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
// }

// export function generateInvoiceNumber(): string {
//   const prefix = "INV";
//   const date = new Date();
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
//   return `${prefix}-${year}${month}-${random}`;
// }