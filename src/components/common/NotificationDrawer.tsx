import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { InAppNotification } from '../../types';
import { StorageService } from '../../services/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  onSelectIncident?: (incidentId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectIncident,
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
  };

  const handleItemClick = (notif: InAppNotification) => {
    StorageService.markNotificationRead(notif.id);
    if (notif.incidentId && onSelectIncident) {
      onSelectIncident(notif.incidentId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Notifications</h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
              <Bell className="h-10 w-10 text-slate-700 mb-2" />
              <p className="text-sm">No notifications currently</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isCritical = n.type === 'CRITICAL_ALERT';
              const isResolved = n.type === 'RESOLUTION';
              const isAssignment = n.type === 'ASSIGNMENT';

              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`group relative rounded-xl border p-3.5 cursor-pointer transition ${
                    !n.isRead
                      ? 'border-cyan-800/60 bg-cyan-950/20 shadow-sm hover:border-cyan-600'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isResolved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isAssignment
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {isCritical ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : isResolved ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {n.createdAt}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {n.message}
                      </p>

                      {n.incidentId && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                          <span>View Incident {n.incidentId}</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
