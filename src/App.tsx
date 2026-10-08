import React, { useState, useEffect } from 'react';
import { StorageService, subscribeToState, AppState } from './services/storage';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DemoWalkthroughBar } from './components/common/DemoWalkthroughBar';
import { IncidentDetailModal } from './components/admin/IncidentDetailModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { AuthModal } from './components/auth/AuthModal';
import { Incident, FieldWorker } from './types';
import { Droplets, Shield, HardHat, User, Sparkles, Activity } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(StorageService.getState());
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Subscribe to storage updates
  useEffect(() => {
    const unsubscribe = subscribeToState(() => {
      setAppState({ ...StorageService.getState() });
    });
    return unsubscribe;
  }, []);

  const activeOrg =
    appState.organizations.find((o) => o.id === appState.activeOrgId) ||
    appState.organizations[0];

  const unreadNotifications = appState.notifications.filter((n) => !n.isRead).length;

  const currentWorker =
    appState.workers.find((w) => w.id === appState.currentUser.id) ||
    appState.workers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        state={appState}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        unreadCount={unreadNotifications}
      />

      {/* Guided 6-Step Hackathon Workflow Tour Bar */}
      <DemoWalkthroughBar
        onOpenIncidentDetail={(id) => {
          const match = StorageService.getIncidentById(id);
          if (match) setSelectedIncident(match);
        }}
      />

      {/* Main Content Area based on Active Role */}
      <main className="flex-1 px-4 py-6 sm:px-6 max-w-7xl w-full mx-auto">
        {appState.currentUser.role === 'ADMIN' && (
          <AdminDashboard
            incidents={StorageService.getIncidents()}
            zonesRisk={StorageService.getZonesRisk()}
            weather={appState.weather}
            teams={StorageService.getTeams()}
            workers={StorageService.getWorkers()}
            activeOrg={activeOrg}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        )}

        {appState.currentUser.role === 'FIELD_WORKER' && (
          <WorkerDashboard
            worker={currentWorker}
            incidents={StorageService.getIncidents()}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        )}

        {appState.currentUser.role === 'CITIZEN' && (
          <CitizenPortal
            currentUser={appState.currentUser}
            incidents={StorageService.getIncidents()}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        )}
      </main>

      {/* Incident Detail Drawer / Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        teams={StorageService.getTeams()}
        workers={StorageService.getWorkers()}
      />

      {/* In-app Notification Flyout Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={appState.notifications}
        onSelectIncident={(id) => {
          const match = StorageService.getIncidentById(id);
          if (match) setSelectedIncident(match);
        }}
      />

      {/* Auth / Role Credentials Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Enterprise Platform Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <span className="font-extrabold text-white">AquaGrid</span>
            <span className="text-slate-500">•</span>
            <span>Intelligent Urban Water & Climate Operations Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-amber-400 font-semibold">Track: Heat & Water</span>
            <span className="text-slate-500">•</span>
            <span>Tagline: <i className="text-slate-300">Detect. Respond. Save Every Drop.</i></span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">ISO 55001 Asset Operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
