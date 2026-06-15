import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';

// Dreams
import DreamList from './features/dreams/DreamList';
import DreamForm from './features/dreams/DreamForm';
import DreamDetail from './features/dreams/DreamDetail';

// Goals
import GoalList from './features/goals/GoalList';
import GoalForm from './features/goals/GoalForm';
import GoalDetail from './features/goals/GoalDetail';

// Milestones
import MilestoneList from './features/milestones/MilestoneList';

// Achievements
import AchievementTimeline from './features/achievements/AchievementTimeline';
import AchievementForm from './features/achievements/AchievementForm';

// Reflections
import ReflectionList from './features/reflections/ReflectionList';
import ReflectionForm from './features/reflections/ReflectionForm';

// Settings
import SettingsPage from './features/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          
          {/* Dreams */}
          <Route path="/dreams" element={<DreamList />} />
          <Route path="/dreams/new" element={<DreamForm />} />
          <Route path="/dreams/edit/:id" element={<DreamForm />} />
          <Route path="/dreams/:id" element={<DreamDetail />} />
          
          {/* Goals */}
          <Route path="/goals" element={<GoalList />} />
          <Route path="/goals/new" element={<GoalForm />} />
          <Route path="/goals/edit/:id" element={<GoalForm />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          
          {/* Milestones */}
          <Route path="/milestones" element={<MilestoneList />} />
          
          {/* Achievements */}
          <Route path="/achievements" element={<AchievementTimeline />} />
          <Route path="/achievements/new" element={<AchievementForm />} />
          
          {/* Reflections */}
          <Route path="/reflections" element={<ReflectionList />} />
          <Route path="/reflections/new" element={<ReflectionForm />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
