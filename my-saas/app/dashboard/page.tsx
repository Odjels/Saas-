"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  id: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subStatus, setSubStatus] = useState<"Free" | "Premium">("Free");

  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/payments/history");
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);

          if (data.some((t: Transaction) => t.status === "success")) {
            setSubStatus("Premium");
          }
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    fetchData();
  }, [session]);

  if (authStatus === "loading") return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p>You are not signed in.</p>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign in
        </button>
        <a href="/register" className="text-blue-600 underline">
          Register
        </a>
      </div>
    );
  }

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium", amount: 5000 }),
      });

      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              Welcome, {session.user?.name ?? session.user?.email}
            </h1>
            <button
              onClick={() => signOut()}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Sign out
            </button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p>
              Subscription Status:{" "}
              <span
                className={`font-semibold ${
                  subStatus === "Premium" ? "text-green-600" : "text-red-600"
                }`}
              >
                {subStatus}
              </span>
            </p>
            {subStatus === "Free" && (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Redirecting..." : "Upgrade to Premium"}
              </button>
            )}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Generator Card */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => router.push("/invoice")}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Invoice Generator</h2>
                <p className="text-blue-100">Create professional invoices instantly</p>
              </div>
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-2 text-sm">
              <p>✓ {subStatus === "Premium" ? "Unlimited" : "5"} invoices per month</p>
              <p>✓ Professional templates</p>
              <p>✓ PDF export {subStatus === "Free" && "(with watermark)"}</p>
              {subStatus === "Premium" && <p>✓ Custom branding</p>}
            </div>
            <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-50 w-full">
              Open Invoice Generator →
            </button>
          </div>

          {/* Billing Card */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/billing")}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Billing</h2>
                <p className="text-gray-600">Manage your subscription</p>
              </div>
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• View payment history</p>
              <p>• Manage subscription</p>
              <p>• Download receipts</p>
            </div>
            <button className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-200 w-full">
              View Billing →
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left">Reference</th>
                  <th className="border p-2">Amount (₦)</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="border p-2">{t.reference}</td>
                    <td className="border p-2">{t.amount / 100}</td>
                    <td
                      className={`border p-2 ${
                        t.status === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {t.status}
                    </td>
                    <td className="border p-2">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}