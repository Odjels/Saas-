import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type ClientWithInvoices = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  createdAt: Date;
  _count: {
    invoices: number;
  };
  invoices: Array<{
    total: number;
    status: string;
  }>;
};

// GET all clients
export async function GET() {
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

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { invoices: true },
        },
        invoices: {
          select: {
            total: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals for each client
    const clientsWithStats = clients.map((client: ClientWithInvoices) => {
      const totalRevenue = client.invoices.reduce((sum: number, inv: { total: number; status: string }) => sum + inv.total, 0);
      const paidInvoices = client.invoices.filter((inv: { total: number; status: string }) => inv.status === "PAID").length;
      
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        company: client.company,
        notes: client.notes,
        createdAt: client.createdAt.toISOString(),
        totalRevenue,
        paidInvoices,
        invoiceCount: client._count.invoices,
      };
    });

    return NextResponse.json(clientsWithStats);
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST create new client
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, email, phone, address, company, notes } = body;

    // Check if client already exists
    const existingClient = await prisma.client.findFirst({
      where: {
        userId: user.id,
        email: email,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name,
        email,
        phone: phone || null,
        address: address || null,
        company: company || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}