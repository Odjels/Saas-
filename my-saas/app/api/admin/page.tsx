// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isPremium: boolean;
  createdAt: string;
};

type Transaction = {
  id: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
  user: { email: string };
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const uRes = await fetch("/api/admin/users");
      const tRes = await fetch("/api/admin/transactions");

      if (uRes.ok) setUsers(await uRes.json());
      if (tRes.ok) setTransactions(await tRes.json());

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading admin data...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* Users */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Premium</th>
                <th className="border p-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border p-2">{u.name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.role}</td>
                  <td className="border p-2">{u.isPremium ? "Yes" : "No"}</td>
                  <td className="border p-2">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Reference</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Amount (₦)</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="border p-2">{t.reference}</td>
                  <td className="border p-2">{t.user.email}</td>
                  <td className="border p-2">{t.amount / 100}</td>
                  <td
                    className={`border p-2 ${
                      t.status === "success" ? "text-green-600" : "text-red-600"
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
        </div>
      </div>
    </div>
  );
}
