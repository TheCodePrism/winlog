import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { generateId } from '../../utils/ids';
import { triggerConfetti } from '../../utils/confetti';
import { getCurrentISODate } from '../../utils/dates';
import { ArrowLeft, Trophy } from 'lucide-react';


export default function AchievementForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getCurrentISODate());
  const [category, setCategory] = useState('Personal');
  const [relatedDreamId, setRelatedDreamId] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch dreams and goals for select selectors
  const dreams = useLiveQuery(() => db.dreams.toArray());
  const goals = useLiveQuery(() => db.goals.toArray());

  const categories = [
    'Personal',
    'Career',
    'Health & Fitness',
    'Finance',
    'Travel & Adventure',
    'Relationships',
    'Creative & Hobbies',
    'Learning & Skills',
    'Other'
  ];

  useEffect(() => {
    const qDreamId = searchParams.get('dreamId');
    const qGoalId = searchParams.get('goalId');
    if (qDreamId) setRelatedDreamId(qDreamId);
    if (qGoalId) setRelatedGoalId(qGoalId);
  }, [searchParams]);

  // Adjust goals options based on selected dream
  const filteredGoals = goals?.filter((g) => {
    if (!relatedDreamId) return true; // Show all if no dream selected
    return g.dreamId === relatedDreamId;
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newWin = {
        id: generateId(),
        title: title.trim(),
        description: description.trim() || undefined,
        date: date || getCurrentISODate(),
        category,
        relatedDreamId: relatedDreamId || undefined,
        relatedGoalId: relatedGoalId || undefined,
        createdAt: new Date().toISOString(),
      };

      await db.achievements.add(newWin);
      
      // Trigger confetti celebrating success!
      triggerConfetti();

      // Go back to timeline
      navigate('/achievements');
    } catch (err) {
      console.error(err);
      setError('Failed to log achievement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-955/40 flex items-center justify-center text-amber-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-display m-0 leading-none">
              Celebrate a Win
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-none">
              Record a success, milestone, or victory you are proud of.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-400 text-sm border border-rose-100 dark:border-rose-950">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              What did you achieve? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finished writing the first complete draft of chapter 1!"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Write a note about this achievement (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How do you feel? What did you learn? How did you celebrate? Add details you'll love reading later."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base resize-none"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Date Achieved
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
                required
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-6">
            <div>
              <label htmlFor="relatedDreamId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Link to Dream
              </label>
              <select
                id="relatedDreamId"
                value={relatedDreamId}
                onChange={(e) => {
                  setRelatedDreamId(e.target.value);
                  setRelatedGoalId(''); // Reset goal on dream change
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
              >
                <option value="">-- No connected dream --</option>
                {dreams?.map((dream) => (
                  <option key={dream.id} value={dream.id}>
                    {dream.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="relatedGoalId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Link to Goal
              </label>
              <select
                id="relatedGoalId"
                value={relatedGoalId}
                onChange={(e) => setRelatedGoalId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
              >
                <option value="">-- No connected goal --</option>
                {filteredGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Trophy className="h-4 w-4" />
              <span>{loading ? 'Logging...' : 'Log Achievement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
