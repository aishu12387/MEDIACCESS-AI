import React, { useState } from 'react';
import { User, AccessibilityMode, TextSize, AppNotification } from '../../types';
import { dataStore } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import {
  Heart,
  Eye,
  Ear,
  Mic,
  Volume2,
  Sliders,
  Bell,
  LogOut,
  Sparkles,
  Contrast,
  Type,
  UserCheck,
  Check,
  X,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenSettings,
  onNavigate,
  currentScreen,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications: AppNotification[] = currentUser
    ? dataStore.getNotifications(currentUser.id)
    : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleHighContrast = () => {
    if (!currentUser) return;
    const currentVal = currentUser.accessibilitySettings.highContrast;
    const updated = dataStore.updateUserAccessibility({ highContrast: !currentVal });
    soundService.playSuccess();
    soundService.announce(
      !currentVal ? 'High contrast mode enabled' : 'Standard contrast restored'
    );
  };

  const cycleTextSize = () => {
    if (!currentUser) return;
    const sizes: TextSize[] = ['normal', 'large', 'xlarge'];
    const currentIdx = sizes.indexOf(currentUser.accessibilitySettings.textSize);
    const nextSize = sizes[(currentIdx + 1) % sizes.length];
    dataStore.updateUserAccessibility({ textSize: nextSize });
    soundService.playSuccess();
    soundService.announce(`Text size set to ${nextSize}`);
  };

  const getModeBadge = (mode: AccessibilityMode) => {
    switch (mode) {
      case 'visually_impaired':
        return { label: 'Visually Impaired', icon: Eye, color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'hearing_impaired':
        return { label: 'Hearing Impaired', icon: Ear, color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'speech_impaired':
        return { label: 'Speech Impaired', icon: Mic, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'deaf_speech_impaired':
        return { label: 'Deaf + Speech Impaired', icon: Sparkles, color: 'bg-purple-100 text-purple-900 border-purple-300' };
      default:
        return { label: 'Standard Mode', icon: UserCheck, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const badge = currentUser ? getModeBadge(currentUser.accessibilitySettings.mode) : null;
  const BadgeIcon = badge?.icon;

  const markAllRead = () => {
    if (currentUser) {
      dataStore.markAllNotificationsRead(currentUser.id);
      soundService.playSuccess();
    }
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs transition-colors"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-hidden focus:ring-4 focus:ring-teal-500 rounded-xl p-1"
          aria-label="MediAccess AI Home - Healthcare Without Communication Barriers"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Heart className="w-7 h-7 fill-white/20 stroke-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
                MediAccess<span className="text-teal-600">AI</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                Voice-First
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Healthcare Without Communication Barriers
            </p>
          </div>
        </button>

        {/* Accessibility Toolbar & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <>
              {/* Accessibility Mode Badge */}
              {badge && BadgeIcon && (
                <button
                  onClick={onOpenSettings}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:shadow-xs ${badge.color}`}
                  title="Click to change accessibility mode"
                  aria-label={`Current accessibility mode: ${badge.label}. Click to adjust.`}
                >
                  <BadgeIcon className="w-4 h-4" />
                  <span>{badge.label}</span>
                </button>
              )}

              {/* Text Size Cycler */}
              <button
                onClick={cycleTextSize}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-500 border border-slate-200"
                aria-label={`Adjust text size. Current: ${currentUser.accessibilitySettings.textSize}`}
                title="Change text size (A- / A / A+)"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs ml-0.5">
                  {currentUser.accessibilitySettings.textSize === 'normal'
                    ? 'A'
                    : currentUser.accessibilitySettings.textSize === 'large'
                    ? 'A+'
                    : 'A++'}
                </span>
              </button>

              {/* High Contrast Toggle */}
              <button
                onClick={toggleHighContrast}
                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-500 border ${
                  currentUser.accessibilitySettings.highContrast
                    ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                aria-label={`Toggle high contrast mode. Currently ${
                  currentUser.accessibilitySettings.highContrast ? 'On' : 'Off'
                }`}
                title="Toggle High Contrast"
              >
                <Contrast className="w-5 h-5" />
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-500 border border-slate-200"
                  aria-label={`Notifications. ${unreadCount} unread.`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white font-bold text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-teal-600" />
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                          aria-label="Close notifications"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-2">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-500">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-xl transition-colors ${
                              notif.read ? 'bg-white' : 'bg-teal-50/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm text-slate-900">
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-2 block">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        soundService.speak(
                          notifications.length > 0
                            ? `You have ${notifications.length} notifications. Most recent: ${notifications[0].title}, ${notifications[0].message}`
                            : 'You have no notifications.'
                        );
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-4 h-4 text-teal-600" />
                      Read Notifications Aloud
                    </button>
                  </div>
                )}
              </div>

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-500 border border-slate-200"
                aria-label="Accessibility and application settings"
                title="Settings"
              >
                <Sliders className="w-5 h-5" />
              </button>

              {/* User Profile / Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div
                  className="w-10 h-10 rounded-xl bg-teal-100 border-2 border-teal-500 overflow-hidden shrink-0 flex items-center justify-center"
                  title={`${currentUser.name} (${currentUser.role})`}
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-teal-800 font-bold text-sm">
                      {currentUser.name.charAt(0)}
                    </span>
                  )}
                </div>

                <button
                  onClick={onLogout}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
