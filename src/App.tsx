import { useState, useEffect } from "react";
import './App.css';

declare global {
  interface Window {
    electronAPI: {
      serviceControl: (action: string, index: number, scriptPath: string) => Promise<any>;
      getLog: (index: number) => Promise<string>;
    };
  }
}
import './App.css';

const SERVICE_LABELS = [
  'Discord Bot',
  'Web Backend',
  'Other Service'
];

const SCRIPT_PATHS = [
  'C:/path/to/discord_bot.py',
  'C:/path/to/web_backend.py',
  'C:/path/to/other_service.py'
];

interface ServiceControlProps {
  index: number;
  label: string;
  scriptPath: string;
}

function ServiceControl({ index, label, scriptPath }: ServiceControlProps) {
  const [status, setStatus] = useState('stopped');
  const [log, setLog] = useState('');

  const handleStart = async () => {
    await window.electronAPI.serviceControl('start', index, scriptPath);
    setStatus('running');
  };
  const handleStop = async () => {
    await window.electronAPI.serviceControl('stop', index, scriptPath);
    setStatus('stopped');
  };

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(async () => {
        const logText = await window.electronAPI.getLog(index);
        setLog(logText);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, index]);

  return (
    <div className="service-panel">
      <div className="service-header">
        <span className={`status-dot ${status}`}></span>
        <span className="service-label">{label}</span>
        <button onClick={handleStart} disabled={status === 'running'}>Start</button>
        <button onClick={handleStop} disabled={status !== 'running'}>Stop</button>
      </div>
      <pre className="service-log">{log}</pre>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <h1>Service Manager</h1>
      <div className="services-list">
        {SERVICE_LABELS.map((label, i) => (
          <ServiceControl key={i} index={i} label={label} scriptPath={SCRIPT_PATHS[i]} />
        ))}
      </div>
    </div>
  );
}
