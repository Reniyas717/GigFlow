import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGig, clearError } from './gigSlice';
import { Briefcase, FileText, IndianRupee, Send } from 'lucide-react';

export default function CreateGigPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    positionsAvailable: 1,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.gigs);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createGig({
      ...formData,
      budget: Number(formData.budget),
      positionsAvailable: Number(formData.positionsAvailable)
    }));
    if (result.type === 'gigs/createGig/fulfilled') {
      navigate('/browse');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-slate-700 dark:bg-cyan-500/20 rounded-lg">
            <Briefcase className="w-6 h-6 text-white dark:text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Gig</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-fade-in">
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all"
                placeholder="e.g., Build a responsive website"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all resize-none"
              placeholder="Describe your project requirements, deliverables, and timeline..."
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Budget (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all"
                placeholder="Enter your budget"
                required
              />
            </div>
          </div>

          {/* Positions Available */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Positions Available
            </label>
            <input
              type="number"
              name="positionsAvailable"
              value={formData.positionsAvailable}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all"
              placeholder="Number of people needed"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              How many freelancers do you need for this gig?
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send size={20} />
            {loading ? 'Creating...' : 'Create Gig'}
          </button>
        </form>
      </div>
    </div>
  );
}

