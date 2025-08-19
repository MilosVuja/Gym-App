import { useState } from "react";
import ConfirmModal from "../../../../common/ConfirmModal";

const MembershipsTab = () => {
  const [memberships, setMemberships] = useState([
    {
      id: 1,
      type: "Monthly",
      status: "Active",
      startDate: "2025-05-01",
      endDate: "2025-06-01",
      paymentStatus: "Paid",
    },
    {
      id: 2,
      type: "Yearly",
      status: "Expired",
      startDate: "2024-01-01",
      endDate: "2025-01-01",
      paymentStatus: "Paid",
    },
  ]);

  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [actionType, setActionType] = useState("");

  const openModal = (action, membership) => {
    setActionType(action);
    setSelectedMembership(membership);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (!selectedMembership) return;

    setMemberships((prev) =>
      prev.map((mem) => {
        if (mem.id !== selectedMembership.id) return mem;

        switch (actionType) {
          case "upgrade":
            return { ...mem, type: "Yearly" };
          case "cancel":
            return { ...mem, status: "Cancelled" };
          case "renew":
            return {
              ...mem,
              status: "Active",
              startDate: new Date().toISOString().slice(0, 10),
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                .toISOString()
                .slice(0, 10),
            };
          default:
            return mem;
        }
      })
    );

    setShowConfirmModal(false);
    setSelectedMembership(null);
    setActionType("");
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setSelectedMembership(null);
    setActionType("");
  };

  const filteredMemberships = memberships.filter((mem) => {
    return (
      (typeFilter === "All" || mem.type === typeFilter) &&
      (statusFilter === "All" || mem.status === statusFilter)
    );
  });

  const getModalMessage = () => {
    if (!selectedMembership) return "";

    switch (actionType) {
      case "upgrade":
        return `Upgrade ${selectedMembership.type} membership to Yearly?`;
      case "cancel":
        return `Cancel ${selectedMembership.type} membership?`;
      case "renew":
        return `Renew ${selectedMembership.type} membership for one more year?`;
      default:
        return "";
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-4">Your Memberships</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="text-black p-2 rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
          <option value="Premium">Premium</option>
        </select>

        <select
          className="text-black p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {filteredMemberships.map((mem) => (
        <div
          key={mem.id}
          className="border border-gray-600 rounded p-4 mb-4 bg-gray-800"
        >
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-lg">{mem.type} Membership</h3>
              <p>Status: {mem.status}</p>
              <p>Start: {mem.startDate}</p>
              <p>End: {mem.endDate}</p>
              <p>Payment: {mem.paymentStatus}</p>
            </div>
            <div className="flex gap-2">
              {mem.status === "Active" && (
                <>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => openModal("upgrade", mem)}
                  >
                    Upgrade
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => openModal("cancel", mem)}
                  >
                    Cancel
                  </button>
                </>
              )}
              {mem.status === "Expired" && (
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => openModal("renew", mem)}
                >
                  Renew
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={showConfirmModal}
        message={getModalMessage()}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default MembershipsTab;
