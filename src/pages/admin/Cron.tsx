import { useState } from 'react';
import { Clock, Plus, Play, Pause, Trash2, Edit2, Calendar, X, Check } from 'lucide-react';
import './Cron.css';

interface CronJob {
  id: string;
  name: string;
  message: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  channel?: string;
}

interface JobFormData {
  name: string;
  message: string;
  schedule: string;
  channel: string;
}

const emptyFormData: JobFormData = {
  name: '',
  message: '',
  schedule: '0 9 * * *',
  channel: '',
};

const mockJobs: CronJob[] = [
  { id: '1', name: 'Daily Report', message: 'Generate and send daily summary report', schedule: '0 9 * * *', enabled: true, lastRun: '1 hour ago', nextRun: 'Tomorrow 9:00 AM' },
  { id: '2', name: 'Hourly Check', message: 'Check system status', schedule: '0 * * * *', enabled: true, lastRun: '15 min ago', nextRun: 'In 45 minutes' },
  { id: '3', name: 'Weekly Backup', message: 'Backup all data', schedule: '0 2 * * 0', enabled: false, lastRun: '1 week ago', nextRun: 'Disabled' },
  { id: '4', name: 'Good Morning', message: 'Send good morning greeting', schedule: '0 7 * * *', enabled: true, lastRun: '8 hours ago', nextRun: 'Tomorrow 7:00 AM', channel: 'telegram' },
];

// Common cron presets
const cronPresets = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at 9 AM', value: '0 9 * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
  { label: 'Every week (Sunday)', value: '0 2 * * 0' },
  { label: 'Every month (1st)', value: '0 0 1 * *' },
];

const channels = [
  { value: '', label: 'All Channels' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'feishu', label: 'Feishu' },
];

// Helper function to parse cron schedule to human readable
const parseCronToText = (cron: string): string => {
  const preset = cronPresets.find(p => p.value === cron);
  if (preset) return preset.label;
  
  const parts = cron.split(' ');
  if (parts.length !== 5) return cron;
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  if (minute === '*' && hour === '*') return 'Every minute';
  if (minute === '0' && hour === '*') return 'Every hour';
  if (minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Daily at ${hour}:${minute.padStart(2, '0')}`;
  }
  
  return cron;
};

export default function AdminCron() {
  const [jobs, setJobs] = useState(mockJobs);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [formData, setFormData] = useState<JobFormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<{ jobId: string; success: boolean } | null>(null);

  const toggleJob = (id: string) => {
    setJobs(jobs.map((j) => {
      if (j.id === id) {
        const enabled = !j.enabled;
        return { 
          ...j, 
          enabled,
          nextRun: enabled ? calculateNextRun(j.schedule) : 'Disabled'
        };
      }
      return j;
    }));
  };

  const calculateNextRun = (schedule: string): string => {
    // Simplified next run calculation
    const now = new Date();
    const parts = schedule.split(' ');
    if (parts.length !== 5) return 'Unknown';
    
    const [minute, hour] = parts;
    
    if (minute === '*' && hour === '*') return 'In 1 minute';
    if (minute === '0' && hour === '*') return `In ${60 - now.getMinutes()} minutes`;
    
    if (hour !== '*' && minute !== '*') {
      const targetHour = parseInt(hour);
      const targetMinute = parseInt(minute);
      const target = new Date();
      target.setHours(targetHour, targetMinute, 0, 0);
      
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 1) return `In ${Math.floor(diff / (1000 * 60))} minutes`;
      if (hours < 24) return `In ${hours} hours`;
      return `Tomorrow at ${targetHour}:${String(targetMinute).padStart(2, '0')}`;
    }
    
    return 'Scheduled';
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const handleEditJob = (job: CronJob) => {
    setEditingJob(job);
    setFormData({
      name: job.name,
      message: job.message,
      schedule: job.schedule,
      channel: job.channel || '',
    });
    setShowModal(true);
  };

  const handleSaveJob = () => {
    if (!formData.name || !formData.message || !formData.schedule) {
      return;
    }

    if (editingJob) {
      // Update existing job
      setJobs(jobs.map((j) =>
        j.id === editingJob.id
          ? { 
              ...j, 
              ...formData,
              nextRun: j.enabled ? calculateNextRun(formData.schedule) : 'Disabled'
            }
          : j
      ));
    } else {
      // Add new job
      const newJob: CronJob = {
        id: crypto.randomUUID(),
        name: formData.name,
        message: formData.message,
        schedule: formData.schedule,
        channel: formData.channel || undefined,
        enabled: true,
        nextRun: calculateNextRun(formData.schedule),
      };
      setJobs([...jobs, newJob]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(emptyFormData);
    setEditingJob(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      setJobs(jobs.filter((j) => j.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const runJob = async (id: string) => {
    setIsRunning(id);
    setRunResult(null);
    
    // Simulate job execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update last run time
    setJobs(jobs.map((j) =>
      j.id === id ? { ...j, lastRun: 'Just now' } : j
    ));
    
    setRunResult({ jobId: id, success: true });
    setIsRunning(null);
    
    // Clear result after 3 seconds
    setTimeout(() => setRunResult(null), 3000);
  };

  return (
    <div className="cron-page animate-fade-in">
      <div className="cron-header">
        <div className="cron-summary">
          <Clock size={20} />
          <span>{jobs.filter((j) => j.enabled).length} active jobs</span>
        </div>
        <button className="btn btn-primary" onClick={handleAddJob}>
          <Plus size={18} /> Add Job
        </button>
      </div>

      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job.id} className={`job-card glass-card ${job.enabled ? 'enabled' : ''} ${runResult?.jobId === job.id ? 'just-ran' : ''}`}>
            <div className="job-main">
              <div className="job-info">
                <div className="job-header">
                  <h3>{job.name}</h3>
                  <span className={`badge ${job.enabled ? 'badge-success' : ''}`}>
                    {job.enabled ? 'Active' : 'Disabled'}
                  </span>
                  {runResult?.jobId === job.id && (
                    <span className="badge badge-success run-success">
                      <Check size={12} /> Executed
                    </span>
                  )}
                </div>
                <p className="job-message">{job.message}</p>
                <div className="job-meta">
                  <span className="meta-item" title={job.schedule}>
                    <Calendar size={12} />
                    {parseCronToText(job.schedule)}
                  </span>
                  {job.channel && (
                    <span className="badge badge-primary">{job.channel}</span>
                  )}
                </div>
              </div>
              <div className="job-timing">
                <div className="timing-item">
                  <span className="timing-label">Last Run</span>
                  <span className="timing-value">{job.lastRun || 'Never'}</span>
                </div>
                <div className="timing-item">
                  <span className="timing-label">Next Run</span>
                  <span className="timing-value">{job.nextRun}</span>
                </div>
              </div>
            </div>
            <div className="job-actions">
              <button
                className={`btn-icon btn-ghost btn-sm ${isRunning === job.id ? 'running' : ''}`}
                onClick={() => runJob(job.id)}
                title="Run now"
                disabled={isRunning === job.id}
              >
                <Play size={14} className={isRunning === job.id ? 'spinning' : ''} />
              </button>
              <button
                className="btn-icon btn-ghost btn-sm"
                onClick={() => toggleJob(job.id)}
                title={job.enabled ? 'Pause' : 'Enable'}
              >
                {job.enabled ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button 
                className="btn-icon btn-ghost btn-sm" 
                title="Edit"
                onClick={() => handleEditJob(job)}
              >
                <Edit2 size={14} />
              </button>
              <button
                className="btn-icon btn-ghost btn-sm btn-danger"
                onClick={() => handleDeleteClick(job.id)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Job Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingJob ? 'Edit Job' : 'Add New Job'}</h3>
              <button className="btn-icon btn-ghost" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Job Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Daily Report"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Message / Action *</label>
                <textarea
                  className="input textarea"
                  placeholder="What should this job do?"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Schedule *</label>
                <select
                  className="input select"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                >
                  {cronPresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label} ({preset.value})
                    </option>
                  ))}
                </select>
                <div className="cron-manual">
                  <input
                    type="text"
                    className="input"
                    placeholder="Or enter custom cron: * * * * *"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  />
                  <span className="input-hint">
                    Format: minute hour day-of-month month day-of-week
                  </span>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Target Channel</label>
                <select
                  className="input select"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                >
                  {channels.map((ch) => (
                    <option key={ch.value} value={ch.value}>{ch.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveJob}
                disabled={!formData.name || !formData.message || !formData.schedule}
              >
                {editingJob ? 'Save Changes' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal-sm glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Job</h3>
              <button className="btn-icon btn-ghost" onClick={() => setDeleteConfirm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this cron job? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
