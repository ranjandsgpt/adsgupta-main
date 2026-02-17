/**
 * Live Data Sync Status Bar
 * Replaces upload UI when user has connected their Amazon SP-API
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, RefreshCw, AlertTriangle, Clock, Zap, Database,
  ArrowUpRight, Settings, Pause, Play
} from 'lucide-react';

const SyncStatusBar = ({ 
  isConnected = false,
  lastSync = null,
  nextSync = null,
  status = 'syncing', // connected, syncing, error, paused
  sellerId = null,
  onPause,
  onResume,
  onDisconnect,
  onManualSync
}) => {
  const [timeUntilSync, setTimeUntilSync] = useState(null);

  // Calculate time until next sync
  useEffect(() => {
    if (!nextSync) return;
    
    const updateTimer = () => {
      const now = new Date();
      const next = new Date(nextSync);
      const diff = Math.max(0, next - now);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilSync(`${hours}h ${minutes}m`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [nextSync]);

  const statusConfig = {
    connected: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: CheckCircle2,
      label: 'Live Data Connected'
    },
    syncing: {
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: RefreshCw,
      label: 'Syncing Data...'
    },
    error: {
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: AlertTriangle,
      label: 'Sync Error'
    },
    paused: {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: Pause,
      label: 'Sync Paused'
    }
  };

  const config = statusConfig[status] || statusConfig.connected;
  const StatusIcon = config.icon;

  if (!isConnected) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${config.border} ${config.bg} p-6`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
            <StatusIcon 
              size={24} 
              className={`${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`} 
            />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${config.color}`}>{config.label}</h3>
            <p className="text-zinc-400 text-sm">
              {sellerId && <span>Seller ID: {sellerId} • </span>}
              {lastSync && (
                <span>Last sync: {new Date(lastSync).toLocaleString()}</span>
              )}
            </p>
          </div>
        </div>

        {/* Sync Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Next Sync Timer */}
          {timeUntilSync && status !== 'paused' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
              <Clock size={14} className="text-zinc-500" />
              <span className="text-zinc-400 text-sm">Next sync in</span>
              <span className="text-white font-mono font-semibold">{timeUntilSync}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {status === 'paused' ? (
              <button
                onClick={onResume}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
              >
                <Play size={14} />
                Resume
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all"
              >
                <Pause size={14} />
                Pause
              </button>
            )}

            <button
              onClick={onManualSync}
              disabled={status === 'syncing'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={status === 'syncing' ? 'animate-spin' : ''} />
              Sync Now
            </button>

            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Progress (when syncing) */}
      {status === 'syncing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-400">Fetching reports...</span>
            <span className="text-blue-400 font-mono">Processing</span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              initial={{ width: '0%' }}
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}

      {/* Error Details */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <p className="text-red-400 text-sm">
            <AlertTriangle size={14} className="inline mr-2" />
            Failed to sync data. Please check your API credentials or try again.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export { SyncStatusBar };
export default SyncStatusBar;
