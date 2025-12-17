// // app/api/analytics/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Get all invoices for the user
//     const invoices = await prisma.invoice.findMany({
//       where: { userId: user.id },
//       orderBy: { date: "desc" },
//     });

//     // Calculate analytics
//     const totalInvoices = invoices.length;
//     const paidInvoices = invoices.filter((inv) => inv.status === "PAID").length;
//     const pendingInvoices = invoices.filter(
//       (inv) => inv.status === "PENDING"
//     ).length;
//     const overdueInvoices = invoices.filter((inv) => {
//       if (inv.status === "OVERDUE") return true;
//       if (inv.status === "PENDING" && new Date(inv.dueDate) < new Date())
//         return true;
//       return false;
//     }).length;

//     const totalRevenue = invoices
//       .filter((inv) => inv.status === "PAID")
//       .reduce((sum, inv) => sum + inv.total, 0);

//     const pendingAmount = invoices
//       .filter((inv) => inv.status === "PENDING")
//       .reduce((sum, inv) => sum + inv.total, 0);

//     const overdueAmount = invoices
//       .filter(
//         (inv) =>
//           inv.status === "OVERDUE" ||
//           (inv.status === "PENDING" && new Date(inv.dueDate) < new Date())
//       )
//       .reduce((sum, inv) => sum + inv.total, 0);

//     // Monthly revenue (last 6 months)
//     const monthlyRevenue = [];
//     const now = new Date();
//     for (let i = 5; i >= 0; i--) {
//       const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

//       const monthInvoices = invoices.filter((inv) => {
//         const invDate = new Date(inv.date);
//         return (
//           invDate >= monthStart && invDate <= monthEnd && inv.status === "PAID"
//         );
//       });

//       const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

//       monthlyRevenue.push({
//         month: monthStart.toLocaleDateString("en-US", {
//           month: "short",
//           year: "numeric",
//         }),
//         revenue,
//         invoices: monthInvoices.length,
//       });
//     }

//     // Recent invoices (last 5)
//     const recentInvoices = invoices.slice(0, 5).map((inv) => ({
//       id: inv.id,
//       invoiceNumber: inv.invoiceNumber,
//       clientName: inv.clientName,
//       total: inv.total,
//       status: inv.status,
//       date: inv.date,
//       dueDate: inv.dueDate,
//     }));

//     // Top clients by revenue
//     const clientRevenue = new Map<
//       string,
//       { name: string; revenue: number; count: number }
//     >();

//     invoices.forEach((inv) => {
//       if (inv.status === "PAID") {
//         const existing = clientRevenue.get(inv.clientEmail) || {
//           name: inv.clientName,
//           revenue: 0,
//           count: 0,
//         };
//         clientRevenue.set(inv.clientEmail, {
//           name: inv.clientName,
//           revenue: existing.revenue + inv.total,
//           count: existing.count + 1,
//         });
//       }
//     });

//     const topClients = Array.from(clientRevenue.entries())
//       .map(([email, data]) => ({ email, ...data }))
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, 5);

//     // Get total clients
//     const totalClients = await prisma.client.count({
//       where: { userId: user.id },
//     });

//     return NextResponse.json({
//       summary: {
//         totalInvoices: totalInvoices || 0,
//         paidInvoices: paidInvoices || 0,
//         pendingInvoices: pendingInvoices || 0,
//         overdueInvoices: overdueInvoices || 0,
//         totalRevenue: totalRevenue || 0,
//         pendingAmount: pendingAmount || 0,
//         overdueAmount: overdueAmount || 0,
//         totalClients: totalClients || 0,
//         //averageInvoiceValue: totalInvoices > 0 ? totalRevenue / paidInvoices : 0,
//         averageInvoiceValue: paidInvoices > 0 ? totalRevenue / paidInvoices : 0,
//       },
//       monthlyRevenue,
//       recentInvoices,
//       topClients,
//     });
//   } catch (error) {
//     console.error("Analytics error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch analytics" },
//       { status: 500 }
//     );
//   }
// }

// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all invoices for the user
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    // Calculate analytics - ONLY use the stored status, don't auto-mark as overdue
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.status === "PAID").length;
    const pendingInvoices = invoices.filter((inv) => inv.status === "PENDING").length;
    const overdueInvoices = invoices.filter((inv) => inv.status === "OVERDUE").length;

    const totalRevenue = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.total, 0);

    const pendingAmount = invoices
      .filter((inv) => inv.status === "PENDING")
      .reduce((sum, inv) => sum + inv.total, 0);

    const overdueAmount = invoices
      .filter((inv) => inv.status === "OVERDUE")
      .reduce((sum, inv) => sum + inv.total, 0);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.date);
        return invDate >= monthStart && invDate <= monthEnd && inv.status === "PAID";
      });
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue,
        invoices: monthInvoices.length,
      });
    }

    // Recent invoices (last 5)
    const recentInvoices = invoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      total: inv.total,
      status: inv.status,
      date: inv.date,
      dueDate: inv.dueDate,
    }));

    // Top clients by revenue
    const clientRevenue = new Map<string, { name: string; revenue: number; count: number }>();
    
    invoices.forEach((inv) => {
      if (inv.status === "PAID") {
        const existing = clientRevenue.get(inv.clientEmail) || { 
          name: inv.clientName, 
          revenue: 0, 
          count: 0 
        };
        clientRevenue.set(inv.clientEmail, {
          name: inv.clientName,
          revenue: existing.revenue + inv.total,
          count: existing.count + 1,
        });
      }
    });

    const topClients = Array.from(clientRevenue.entries())
      .map(([email, data]) => ({ email, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get total clients
    const totalClients = await prisma.client.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      summary: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalRevenue,
        pendingAmount,
        overdueAmount,
        totalClients,
        averageInvoiceValue: paidInvoices > 0 ? totalRevenue / paidInvoices : 0,
      },
      monthlyRevenue,
      recentInvoices,
      topClients,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
