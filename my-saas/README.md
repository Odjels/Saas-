My SaaS Invoicing App

A modern SaaS web application for managing invoices, clients, and payments, built with Next.js, TypeScript, and Tailwind CSS. This project showcases full-stack development skills, including authentication, API development, database modeling, and third-party integrations.

Features

User Authentication & Management

Sign up, login, and session management with NextAuth.js.

Role-based features (Free vs Premium users).

Client Management

Add, update, and view client details.

Track invoices per client and display top clients.

Invoice Management

Create, edit, and delete invoices.

PDF invoice generation with multiple templates.

Track invoice statuses: PAID, PENDING, OVERDUE.

Payment Integration

Premium subscription via Paystack.

Handles success, cancellation, and error notifications.

Analytics Dashboard

Total revenue, pending/overdue amounts, and average invoice value.

Monthly revenue trends and recent invoices.

Interactive charts and statistics for business insights.

Responsive UI

Mobile-first design with Tailwind CSS.

Modern UI components and interactive elements.

Tech Stack
Layer	Technology
Frontend	Next.js (App Router), TypeScript, Tailwind CSS, Lucide React Icons
Backend	Next.js API Routes, Prisma ORM, PostgreSQL
Authentication	NextAuth.js
Payments	Paystack API
PDF Generation	jsPDF / Custom Templates
Deployment	Vercel
Getting Started

Clone the repository

git clone https://github.com/Odjels/my-saas.git
cd my-saas


Install dependencies

npm install


Set up environment variables

Create a .env.local file:

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key


Run Prisma migrations

npx prisma migrate dev


Start the development server

npm run dev


Open http://localhost:3000
 to view the app.

Build for Production
npm run build
npm run start

Key Learnings & Skills Demonstrated

Building a full-stack SaaS application with modern frameworks.

Implementing secure authentication and session management.

Integrating payment gateways and handling subscription logic.

Using Prisma for database modeling and querying.

Building dynamic dashboards and interactive charts.

Generating PDF invoices with multiple templates programmatically.

Writing clean, maintainable TypeScript code and modular React components.

Deployment

Deployed easily on Vercel
 for production-ready hosting.

License

MIT License © 2025 [Your Name]
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
