import { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EducatorApplication = () => {
  const { backendUrl, getToken, userData, isEducator } = useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    experience: userData?.educatorApplication?.details?.experience || '',
    subjectExpertise: userData?.educatorApplication?.details?.subjectExpertise || '',
    bio: userData?.educatorApplication?.details?.bio || '',
    phone: userData?.educatorApplication?.details?.phone || '',
    qualification: userData?.educatorApplication?.details?.qualification || '',
    additionalDetails: userData?.educatorApplication?.details?.additionalDetails || '',
    termsAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const status = userData?.educatorApplication?.status || 'none';
  const rejectionReason = userData?.educatorApplication?.rejectionReason || '';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = await getToken();
      const response = await axios.post(
        `${backendUrl}/api/educator/apply`,
        {
          experience: formData.experience,
          subjectExpertise: formData.subjectExpertise,
          bio: formData.bio,
          phone: formData.phone,
          qualification: formData.qualification,
          additionalDetails: formData.additionalDetails,
          termsAccepted: formData.termsAccepted,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Form Submitted Successfully");
        navigate('/');
      } else {
        toast.error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Apply to Become an Educator</h1>

      {isEducator && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">You are already approved</h2>
          <p className="text-gray-700 mb-4">Your educator account is active. Visit your educator dashboard to manage courses.</p>
          <button
            className="px-5 py-3 bg-indigo-600 text-white rounded-md"
            onClick={() => window.location.assign('/educator')}
          >
            Go to Educator Dashboard
          </button>
        </div>
      )}

      {!isEducator && status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Application Under Review</h2>
          <p className="text-gray-700">Your educator application is pending approval from the admin. We will let you know once it is reviewed.</p>
        </div>
      )}

      {!isEducator && status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Application Rejected</h2>
          <p className="text-gray-700 mb-2">Reason: {rejectionReason || 'No reason provided.'}</p>
          <p className="text-gray-700">You can submit a new application after making the requested updates.</p>
        </div>
      )}

      {!isEducator && status !== 'pending' && (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Years of experience</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows={3}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject expertise and teaching area</label>
            <textarea
              name="subjectExpertise"
              value={formData.subjectExpertise}
              onChange={handleChange}
              rows={3}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone or WhatsApp number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Any extra details for the admin</label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              rows={3}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-start gap-3">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-700">
              I agree to the terms and conditions and confirm my details are accurate.
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EducatorApplication;
