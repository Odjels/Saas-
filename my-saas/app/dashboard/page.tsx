"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { 
  TrendingUp, 
  FileText, 
  Clock, 
  AlertCircle, 
  DollarSign,
  Users,
  BarChart3
} from "lucide-react";

type Analytics = {
  summary: {
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
    totalClients: number;
    averageInvoiceValue: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    invoices: number;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    total: number;
    status: string;
    date: string;
  }>;
  topClients: Array<{
    email: string;
    name: string;
    revenue: number;
    count: number;
  }>;
};

// Separate component that uses useSearchParams
function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check for success/error from Paystack
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    
    if (success === "true") {
      alert("🎉 Payment successful! Welcome to Premium!");
      window.history.replaceState({}, "", "/dashboard");
      window.location.reload();
    }
    if (error) {
      alert(`Payment error: ${error}`);
      window.history.replaceState({}, "", "/dashboard");
    }

    // Fetch analytics
    if (session) {
      fetchAnalytics();
    }
  }, [status, router, searchParams, session]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }

      // Also get premium status
      const statusRes = await fetch("/api/invoice/status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setIsPremium(statusData.isPremium);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
      });
      
      if (res.ok) {
        const { authorization_url } = await res.json();
        window.location.href = authorization_url;
      } else {
        const data = await res.json();
        alert(data.error || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (!session) return null;

  const { summary, monthlyRevenue, recentInvoices, topClients } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {session.user?.name || session.user?.email}!
              </h1>
              <p className="text-gray-600 mt-2">
                {isPremium ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700">
                    ✨ Premium Member
                  </span>
                ) : (
                  <span className="text-gray-500">Free Account</span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/clients")}
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                Clients
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">₦{summary.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">{summary.paidInvoices} paid invoices</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Invoices</h3>
            <p className="text-3xl font-bold text-gray-900">{summary.totalInvoices}</p>
            <p className="text-sm text-gray-500 mt-2">₦{summary.averageInvoiceValue.toLocaleString()} avg</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending</h3>
            <p className="text-3xl font-bold text-gray-900">₦{summary.pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">{summary.pendingInvoices} invoices</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Overdue</h3>
            <p className="text-3xl font-bold text-gray-900">₦{summary.overdueAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">{summary.overdueInvoices} invoices</p>
          </div>
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Revenue Trend (Last 6 Months)
            </h2>
            <div className="space-y-3">
              {monthlyRevenue.map((month, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-gray-600">₦{month.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Top Clients
            </h2>
            <div className="space-y-3">
              {topClients.length > 0 ? (
                topClients.map((client, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-600">{client.count} invoices</p>
                    </div>
                    <p className="font-bold text-indigo-600">₦{client.revenue.toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No clients yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-bold mb-2">Create Invoice</h2>
            <p className="text-gray-600 mb-4">
              Generate professional invoices for your clients
            </p>
            <button
              onClick={() => router.push("/invoice")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition w-full"
            >
              Go to Invoice Generator
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-bold mb-2">Manage Clients</h2>
            <p className="text-gray-600 mb-4">
              {summary.totalClients} clients in your database
            </p>
            <button
              onClick={() => router.push("/clients")}
              className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-200 transition w-full"
            >
              View All Clients
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-bold mb-2">
              {isPremium ? "Premium Account" : "Upgrade to Premium"}
            </h2>
            <p className="text-gray-600 mb-4">
              {isPremium
                ? "You have access to all features"
                : "Unlock unlimited invoices"}
            </p>
            {!isPremium ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition w-full disabled:opacity-50"
              >
                {loading ? "Loading..." : "Upgrade Now - ₦5,000/month"}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                <p className="font-semibold">✓ All features unlocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
          {recentInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Invoice #</th>
                    <th className="text-left py-3 px-4 font-semibold">Client</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">{invoice.clientName}</td>
                      <td className="py-3 px-4 font-semibold">₦{invoice.total.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            invoice.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : invoice.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No invoices yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}