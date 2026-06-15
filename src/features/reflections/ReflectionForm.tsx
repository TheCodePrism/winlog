import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { generateId } from '../../utils/ids';
import { getCurrentISODateTime } from '../../utils/dates';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';

export default function ReflectionForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');
  const [relatedDreamId, setRelatedDreamId] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch dreams and goals
  const dreams = useLiveQuery(() => db.dreams.toArray());
  const goals = useLiveQuery(() => db.goals.toArray());

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '🚀', label: 'Excited / Productive' },
    { emoji: '🧘', label: 'Calm / Mindful' },
    { emoji: '🤔', label: 'Reflective' },
    { emoji: '📈', label: 'Growing' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😔', label: 'Struggling' }
  ];

  useEffect(() => {
    const qDreamId = searchParams.get('dreamId');
    const qGoalId = searchParams.get('goalId');
    if (qDreamId) setRelatedDreamId(qDreamId);
    if (qGoalId) setRelatedGoalId(qGoalId);
  }, [searchParams]);

  // Adjust goals based on selected dream
  const filteredGoals = goals?.filter((g) => {
    if (!relatedDreamId) return true;
    return g.dreamId === relatedDreamId;
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const now = getCurrentISODateTime();
      const newRef = {
        id: generateId(),
        title: title.trim() || undefined,
        content: content.trim(),
        mood,
        relatedDreamId: relatedDreamId || undefined,
        relatedGoalId: relatedGoalId || undefined,
        createdAt: now,
        updatedAt: now,
      };

      await db.reflections.add(newRef);
      navigate('/reflections');
    } catch (err) {
      console.error(err);
      setError('Failed to save journal entry. Please try again.');
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
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-955/40 flex items-center justify-center text-indigo-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-display m-0 leading-none">
              New Journal Reflection
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-none">
              Take a moment to record your thoughts, challenges, and milestones.
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
              Entry Title (optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly progress check-in"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
              maxLength={100}
            />
          </div>

          {/* Mood selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              How are you feeling today?
            </label>
            <div className="flex flex-wrap gap-2.5">
              {moods.map((m) => (
                <button
                  type="button"
                  key={m.label}
                  onClick={() => setMood(m.emoji)}
                  className={`
                    px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95
                    ${mood === m.emoji
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    }
                  `}
                  title={m.label}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Write reflection <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What went well? What obstacles did you encounter? What did you learn? Record your notes here..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base resize-none"
              required
            />
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
                  setRelatedGoalId(''); // Reset goal
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
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
