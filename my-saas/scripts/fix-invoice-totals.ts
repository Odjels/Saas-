// scripts/fix-invoice-totals.ts
// Run this once to fix existing invoices that have 0 total

// import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

//const prisma = new PrismaClient();


async function fixInvoiceTotals() {
  console.log('Starting to fix invoice totals...');

  try {
    // Get all invoices
    const invoices = await prisma.invoice.findMany();
    
    let fixed = 0;
    let skipped = 0;

    for (const invoice of invoices) {
      try {
        // Parse items
        const items = JSON.parse(invoice.items);
        
        // Calculate total
        const total = items.reduce(
          (sum: number, item: { quantity: number; price: number }) =>
            sum + item.quantity * item.price,
          0
        );

        // Update if total is different
        if (invoice.total !== total) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { total },
          });
          
          console.log(`✓ Fixed invoice ${invoice.invoiceNumber}: ₦${total}`);
          fixed++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`✗ Error fixing invoice ${invoice.id}:`, error);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total invoices: ${invoices.length}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Skipped (already correct): ${skipped}`);
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixInvoiceTotals();

// To run this script:
// 1. Save as scripts/fix-invoice-totals.ts
// 2. Run: npx ts-node scripts/fix-invoice-totals.ts
// Or add to package.json:
// "scripts": {
//   "fix-invoices": "ts-node scripts/fix-invoice-totals.ts"
// }
// Then run: npm run fix-invoices