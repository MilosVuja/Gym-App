import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminApproval() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingMembers = async () => {
    try {
      const res = await axios.get("/api/admin/pending-members");
      setMembers(res.data.data.members);
      setLoading(false);
    } catch (err) {
      setError(err, "Failed to fetch members");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMembers();
  }, []);

  const approveMember = async (memberId) => {
    try {
      await axios.patch(`/api/admin/approve/${memberId}`);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
    } catch (err) {
      alert(err, "Failed to approve member");
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await axios.delete(`/api/admin/delete/${memberId}`);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
    } catch (err) {
      alert(err, "Failed to delete member");
    }
  };

  if (loading) return <p>Loading pending members...</p>;
  if (error) return <p>{error}</p>;

  if (members.length === 0) return <p>No pending members to approve.</p>;

  return (
    <div>
      <h2>Pending Members Approval</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m._id}>
              <td>{m.firstName}</td>
              <td>{m.lastName}</td>
              <td>{m.email}</td>
              <td>{m.phoneNumber || "N/A"}</td>
              <td>
                <button onClick={() => approveMember(m._id)}>Approve</button>{" "}
                <button onClick={() => deleteMember(m._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
