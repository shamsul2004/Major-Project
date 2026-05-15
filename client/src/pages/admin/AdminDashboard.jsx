import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { backendUrl, getToken, isAdmin } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReasons, setRejectReasons] = useState({});

  const fetchApplications = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/admin/educator-applications`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleApprove = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/admin/educator-applications/${userId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleReject = async (userId) => {
    const reason = rejectReasons[userId]?.trim();
    if (!reason) {
      toast.error('Please enter a rejection reason.');
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/admin/educator-applications/${userId}/reject`,
        { rejectionReason: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message);
        setRejectReasons((prev) => ({ ...prev, [userId]: '' }));
        fetchApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl w-full bg-white rounded-xl border border-gray-200 shadow p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="text-gray-600">Loading educator applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">No pending educator applications found.</div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{app.name || app.email}</h2>
                  <p className="text-sm text-gray-500">{app.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                    onClick={() => handleApprove(app._id)}
                  >
                    Approve
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold">Experience</h3>
                  <p className="text-gray-700">{app.educatorApplication.details?.experience || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Subject Expertise</h3>
                  <p className="text-gray-700">{app.educatorApplication.details?.subjectExpertise || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Qualification</h3>
                  <p className="text-gray-700">{app.educatorApplication.details?.qualification || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-700">{app.educatorApplication.details?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Bio</h3>
                <p className="text-gray-700">{app.educatorApplication.details?.bio || 'N/A'}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">Additional Details</h3>
                <p className="text-gray-700">{app.educatorApplication.details?.additionalDetails || 'N/A'}</p>
              </div>

              <div className="mt-4">
                <textarea
                  rows={3}
                  placeholder="Enter rejection reason"
                  value={rejectReasons[app._id] || ''}
                  onChange={(e) => setRejectReasons((prev) => ({ ...prev, [app._id]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-indigo-200"
                />
                <button
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  onClick={() => handleReject(app._id)}
                >
                  Reject Application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
