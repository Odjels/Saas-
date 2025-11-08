// app/clients/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Mail, Phone, Building, Edit, Trash2 } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  totalRevenue: number;
  invoiceCount: number;
  paidInvoices: number;
  createdAt: string;
};

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session) {
      fetchClients();
    }
  }, [session, status, router]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      } else {
        console.error("Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingClient
        ? `/api/clients/${editingClient.id}`
        : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchClients();
        setShowModal(false);
        resetForm();
        alert(
          editingClient
            ? "Client updated successfully!"
            : "Client added successfully!"
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save client");
      }
    } catch (error) {
      console.error("Error saving client:", error);
      alert("An error occurred");
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
      company: client.company || "",
      notes: client.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchClients();
        alert("Client deleted successfully!");
      } else {
        alert("Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      notes: "",
    });
    setEditingClient(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold">Client Management</h1>
                <p className="text-gray-600 mt-1">
                  {clients.length} total clients
                </p>
              </div>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:opacity-90 inline-flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Add Client
              </button>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No clients yet
            </h2>
            <p className="text-gray-500 mb-6">
              Add your first client to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Add Your First Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {client.company}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition"
                      title="Edit client"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                      title="Delete client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </p>
                  {client.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">
                      {client.invoiceCount}
                    </p>
                    <p className="text-xs text-gray-600">Invoices</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {client.paidInvoices}
                    </p>
                    <p className="text-xs text-gray-600">Paid</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{client.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingClient ? "Edit Client" : "Add New Client"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Additional notes about this client..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 font-semibold transition"
                >
                  {editingClient ? "Update Client" : "Add Client"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded hover:bg-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
