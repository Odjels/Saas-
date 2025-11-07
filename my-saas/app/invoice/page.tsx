// app/invoice/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  createdAt: string;
};

export default function InvoiceGenerator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState("");

  // Fetch user status and invoices
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const res = await fetch("/api/invoice/status");
      if (res.ok) {
        const data = await res.json();
        setIsPremium(data.isPremium);
        setInvoiceCount(data.invoiceCount);
        setInvoices(data.invoices);
      }
    };

    fetchData();
  }, [session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/login");
    return null;
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check limits for free users
    if (!isPremium && invoiceCount >= 5) {
      setShowUpgradeModal(true);
      return;
    }

    const invoice = {
      clientName,
      clientEmail,
      date,
      dueDate,
      items,
      notes,
    };

    const res = await fetch("/api/invoice/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice),
    });

    if (res.ok) {
      const newInvoice = await res.json();
      setInvoices([newInvoice, ...invoices]);
      setInvoiceCount(invoiceCount + 1);

      // Reset form
      setClientName("");
      setClientEmail("");
      setItems([{ description: "", quantity: 1, price: 0 }]);
      setNotes("");
      alert("Invoice created successfully!");
    }
  };

  const downloadPDF = async (invoiceId: string) => {
    // if (!isPremium) {
    //   alert("PDF download without watermark is a Premium feature!");
    //   setShowUpgradeModal(true);
    //   return;
    // }

  //   const res = await fetch(`/api/invoice/download/${invoiceId}`);
  //   if (res.ok) {
  //     const blob = await res.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `invoice-${invoiceId}.pdf`;
  //     a.click();
  //   }
  // };

const res = await fetch(`/api/invoice/download/${invoiceId}`);
if (!res.ok) throw new Error("Failed to download invoice");

const blob = await res.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
//a.download = `invoice-${invoiceId.invoiceNumber}.pdf`;
a.download = `invoice-${invoiceId}.pdf`;
document.body.appendChild(a);
a.click();
a.remove();
window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Invoice Generator</h1>
              <p className="text-gray-600 mt-1">
                {isPremium ? (
                  <span className="text-green-600 font-semibold">
                    Premium Account
                  </span>
                ) : (
                  <span>
                    Free Account - {invoiceCount}/5 invoices used this month
                  </span>
                )}
              </p>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Dashboard
              </button>
              {!isPremium && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded hover:opacity-90"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Items</label>
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      required
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      required
                      className="w-20 px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, "price", Number(e.target.value))
                      }
                      required
                      className="w-28 px-3 py-2 border rounded"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="bg-red-500 text-white px-3 py-2 rounded"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Add Item
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Payment terms, thank you note, etc."
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-lg font-bold text-right">
                  Total: ₦{calculateTotal().toLocaleString()}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold"
              >
                Create Invoice
              </button>
            </form>
          </div>

          {/* Invoice History */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Invoice History</h2>
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, isPremium ? undefined : 5).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="border rounded p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{invoice.clientName}</p>
                        <p className="text-sm text-gray-600">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ₦
                          {(() => {
                            try {
                              const items = Array.isArray(invoice.items)
                                ? invoice.items
                                : JSON.parse(invoice.items || "[]");

                              const total = (
                                items as { quantity: number; price: number }[]
                              ).reduce(
                                (sum, item) => sum + item.quantity * item.price,
                                0
                              );

                              return total.toLocaleString();
                            } catch {
                              return "0";
                            }
                          })()}
                        </p>
                        <button
                          onClick={() => downloadPDF(invoice.id)}
                          className="text-blue-600 text-sm hover:underline mt-1"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!isPremium && invoices.length > 5 && (
                  <p className="text-center text-gray-500 text-sm">
                    Upgrade to Premium to view all invoices
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
            <div className="space-y-3 mb-6">
              <p className="flex items-center">
                <span className="text-green-600 mr-2">✓</span> Unlimited
                invoices
              </p>
              <p className="flex items-center">
                <span className="text-green-600 mr-2">✓</span> Watermark-free
                PDFs
              </p>
              <p className="flex items-center">
                <span className="text-green-600 mr-2">✓</span> Custom branding
              </p>
              <p className="flex items-center">
                <span className="text-green-600 mr-2">✓</span> Email invoices
              </p>
              <p className="flex items-center">
                <span className="text-green-600 mr-2">✓</span> Unlimited history
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded font-semibold hover:opacity-90 mb-3"
            >
              Upgrade Now - ₦5,000/month
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
