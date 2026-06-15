import { useState, useRef } from 'react';
import { db } from '../../db/db';
import { triggerConfetti } from '../../utils/confetti';
import { useGoogleLogin } from '@react-oauth/google';
import { uploadBackup, downloadBackup, getLatestBackup } from '../../services/googleDrive';
import {
  Download,
  Upload,
  RefreshCw,
  Check,
  ShieldAlert,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const checkLatestBackup = async (token: string) => {
    try {
      const latest = await getLatestBackup(token);
      if (latest) {
        setLastBackupTime(new Date(latest.modifiedTime).toLocaleString());
      } else {
        setLastBackupTime('No backup found');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token);
      checkLatestBackup(tokenResponse.access_token);
      showMessage('Connected to Google Drive', 'success');
    },
    onError: () => {
      showMessage('Failed to connect to Google Drive', 'error');
    }
  });

  const handleCloudBackup = async () => {
    if (!googleToken) return;
    setCloudSyncing(true);
    try {
      const dreams = await db.dreams.toArray();
      const goals = await db.goals.toArray();
      const milestones = await db.milestones.toArray();
      const achievements = await db.achievements.toArray();
      const reflections = await db.reflections.toArray();

      const backupData = {
        app: 'success-tracker',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: { dreams, goals, milestones, achievements, reflections }
      };

      await uploadBackup(googleToken, JSON.stringify(backupData));
      showMessage('Successfully backed up to Google Drive', 'success');
      checkLatestBackup(googleToken);
    } catch (err) {
      console.error(err);
      showMessage('Failed to backup to Google Drive', 'error');
    } finally {
      setCloudSyncing(false);
    }
  };

  const handleCloudRestore = async () => {
    if (!googleToken) return;
    
    const confirmImport = confirm(
      'WARNING: Restoring from cloud will overwrite all current local entries. Do you want to continue?'
    );
    if (!confirmImport) return;

    setCloudSyncing(true);
    try {
      const latest = await getLatestBackup(googleToken);
      if (!latest) {
        showMessage('No backup found in Google Drive', 'error');
        return;
      }

      const backupStr = await downloadBackup(googleToken, latest.id);
      const backup = JSON.parse(backupStr);

      if (backup.app !== 'success-tracker' || !backup.data) {
        throw new Error('Invalid backup file structure.');
      }

      const { dreams, goals, milestones, achievements, reflections } = backup.data;

      await Promise.all([
        db.dreams.clear(),
        db.goals.clear(),
        db.milestones.clear(),
        db.achievements.clear(),
        db.reflections.clear()
      ]);

      if (dreams && dreams.length > 0) await db.dreams.bulkAdd(dreams);
      if (goals && goals.length > 0) await db.goals.bulkAdd(goals);
      if (milestones && milestones.length > 0) await db.milestones.bulkAdd(milestones);
      if (achievements && achievements.length > 0) await db.achievements.bulkAdd(achievements);
      if (reflections && reflections.length > 0) await db.reflections.bulkAdd(reflections);

      triggerConfetti();
      showMessage('Restored from Google Drive successfully.', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to restore from Google Drive', 'error');
    } finally {
      setCloudSyncing(false);
    }
  };

  // Export Data
  const handleExport = async () => {
    setExporting(true);
    try {
      const dreams = await db.dreams.toArray();
      const goals = await db.goals.toArray();
      const milestones = await db.milestones.toArray();
      const achievements = await db.achievements.toArray();
      const reflections = await db.reflections.toArray();

      const backupData = {
        app: 'success-tracker',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: { dreams, goals, milestones, achievements, reflections }
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `winlog-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showMessage('Backup downloaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to export data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Import Data
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmImport = confirm(
      'WARNING: Importing backup data will overwrite all current entries in the app. Make sure to download a backup of your current data first. Do you want to continue?'
    );
    if (!confirmImport) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const backup = JSON.parse(text);

        if (backup.app !== 'success-tracker' || !backup.data) {
          throw new Error('Invalid backup file structure.');
        }

        const { dreams, goals, milestones, achievements, reflections } = backup.data;

        await Promise.all([
          db.dreams.clear(),
          db.goals.clear(),
          db.milestones.clear(),
          db.achievements.clear(),
          db.reflections.clear()
        ]);

        if (dreams && dreams.length > 0) await db.dreams.bulkAdd(dreams);
        if (goals && goals.length > 0) await db.goals.bulkAdd(goals);
        if (milestones && milestones.length > 0) await db.milestones.bulkAdd(milestones);
        if (achievements && achievements.length > 0) await db.achievements.bulkAdd(achievements);
        if (reflections && reflections.length > 0) await db.reflections.bulkAdd(reflections);

        triggerConfetti();
        showMessage('All data restored from backup successfully.', 'success');
      } catch (err) {
        console.error(err);
        showMessage('Import failed. Invalid or corrupted backup file.', 'error');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  // Database Wipe Reset
  const handleReset = async () => {
    const confirmReset = confirm(
      'CRITICAL WARNING: This will permanently delete all your dreams, goals, milestones, achievements, and reflections from this browser. This cannot be undone. Are you absolutely sure?'
    );
    
    if (!confirmReset) return;

    const confirmDouble = confirm('Double check: Type OK or click confirm if you want to wipe everything.');
    if (!confirmDouble) return;

    setResetting(true);
    try {
      await Promise.all([
        db.dreams.clear(),
        db.goals.clear(),
        db.milestones.clear(),
        db.achievements.clear(),
        db.reflections.clear()
      ]);
      showMessage('Database cleared successfully. All data wiped.', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to wipe database.', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast alert message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-950/50'
              : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-955/30 dark:text-rose-455 dark:border-rose-950/50'
          }`}
        >
          <Check className="h-4 w-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Cloud Sync Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display m-0">
              Cloud Sync
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
              Sync your local data securely to your own Google Drive.
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500">
            <Cloud className="h-5 w-5" />
          </div>
        </div>

        {!googleToken ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Connect your Google account to enable automatic or manual backups to Google Drive. Your data stays private.
            </p>
            <button
              onClick={() => login()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Connected to Google Drive
              </span>
              <button 
                onClick={() => { setGoogleToken(null); setLastBackupTime(null); }}
                className="flex items-center gap-1 text-xs font-medium hover:text-blue-800 dark:hover:text-blue-200"
              >
                <LogOut className="h-3 w-3" /> Disconnect
              </button>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
              Last Backup: <span className="font-semibold text-slate-700 dark:text-slate-300">{lastBackupTime || 'Loading...'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleCloudBackup}
                disabled={cloudSyncing}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-98 disabled:opacity-50 text-left"
              >
                <div className="h-8 w-8 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
                  <CloudUpload className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-sm leading-snug">Backup to Cloud</span>
                </div>
              </button>

              <button
                onClick={handleCloudRestore}
                disabled={cloudSyncing}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-98 disabled:opacity-50 text-left"
              >
                <div className="h-8 w-8 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
                  <CloudDownload className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-sm leading-snug">Restore from Cloud</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Local Backup and Restore Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display m-0">
            Local Backup Utilities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
            Export or import your offline journal entries as manual JSON files.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-3 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-98 disabled:opacity-50 text-left"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <span className="block font-bold text-sm leading-snug">Export File</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Save as JSON</span>
            </div>
          </button>

          <button
            onClick={handleImportClick}
            disabled={importing}
            className="flex items-center gap-3 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-98 disabled:opacity-50 text-left"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <span className="block font-bold text-sm leading-snug">Import File</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Restore from JSON</span>
            </div>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/20 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 font-display m-0 leading-none">
              Danger Zone
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-none">
              Destructive settings. Be careful.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/5 border border-rose-100 dark:border-rose-950/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="block font-bold text-sm text-slate-800 dark:text-slate-200">Wipe Database</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Clear all local entries. Does not delete cloud backups.
            </span>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{resetting ? 'Wiping...' : 'Reset Database'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
