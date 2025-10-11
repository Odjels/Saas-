// components/UpgradeButton.tsx
"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function UpgradeButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!session) return <p>Please sign in to upgrade</p>;

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000 }) // NGN 1000
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'init failed');
      // redirect to Paystack checkout page
      window.location.href = data.authorization_url;
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Payment init error');
      } else {
        alert('Payment init error');
      }
      setLoading(false);
    }
  }

  return (
    <button onClick={handleUpgrade} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">
      {loading ? 'Redirecting…' : 'Upgrade to Premium — ₦1,000'}
    </button>
  );
}
