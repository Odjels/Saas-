// app/billing/page.tsx
"use client";

import { useEffect, useState } from "react";

type BillingInfo = {
  subscription: "Free" | "Premium";
  lastPayment: {
    reference: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
};

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const fetchBilling = async () => {
      const res = await fetch("/api/billing");
      if (res.ok) {
        const data = await res.json();
        setBilling(data);
      }
      setLoading(false);
    };
    fetchBilling();
  }, []);

  const handleCancel = async () => {
    setCanceling(true);
    const res = await fetch("/api/billing", { method: "POST" });
    if (res.ok) {
      setBilling((prev) =>
        prev ? { ...prev, subscription: "Free" } : prev
      );
    }
    setCanceling(false);
  };

  if (loading) return <p className="p-6">Loading billing info...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-bold">Billing</h1>

        <div className="space-y-2">
          <p>
            Current Subscription:{" "}
            <span
              className={`font-semibold ${
                billing?.subscription === "Premium"
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {billing?.subscription}
            </span>
          </p>
          {billing?.lastPayment ? (
            <div className="border p-4 rounded bg-gray-50">
              <h2 className="font-semibold mb-2">Last Payment</h2>
              <p>
                Reference: <code>{billing.lastPayment.reference}</code>
              </p>
              <p>Amount: ₦{billing.lastPayment.amount / 100}</p>
              <p>Status: {billing.lastPayment.status}</p>
              <p>
                Date:{" "}
                {new Date(billing.lastPayment.createdAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No payments yet.</p>
          )}
        </div>

        {billing?.subscription === "Premium" && (
          <button
            onClick={handleCancel}
            disabled={canceling}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {canceling ? "Cancelling..." : "Cancel Premium"}
          </button>
        )}
      </div>
    </div>
  );
}
