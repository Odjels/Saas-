"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subStatus, setSubStatus] = useState<"Free" | "Premium">("Free");

  // 🚀 Fetch transactions when logged in
  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/payments/history");
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);

          // Optionally detect premium status from transaction history
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

  // 🚀 Check session state
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

  // 🚀 Handle upgrade
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium", amount: 5000 }), // ₦5000 test fee
      });

      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl; // redirect to Paystack
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6">
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

        <div className="flex justify-between items-center">
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

        <div>
          <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
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
