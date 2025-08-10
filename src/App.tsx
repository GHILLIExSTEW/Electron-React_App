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
  'Bot',
  'Flask Service'
];

const SCRIPT_PATHS = [
  '../DBSBM/bot/main.py', // Bot
  '../DBSBMWEB/flask_service.py' // Flask Service
];

interface ServiceControlProps {
  index: number;
  label: string;
  scriptPath: string;
}


interface ServiceState {
  status: 'stopped' | 'running';
  log: string;
}

function ServiceTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [services, setServices] = useState<ServiceState[]>([
    { status: 'stopped', log: '' },
    { status: 'stopped', log: '' },
  ]);
  // Poll logs for running services
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    services.forEach((service, i) => {
      if (service.status === 'running') {
        const interval = setInterval(async () => {
          const logText = await window.electronAPI.getLog(i);
          setServices(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], log: logText };
            return updated;
          });
        }, 1000);
        intervals.push(interval);
      }
    });
    return () => intervals.forEach(clearInterval);
  }, [services]);

  const handleStart = async (i: number) => {
    await window.electronAPI.serviceControl('start', i, SCRIPT_PATHS[i]);
    setServices(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], status: 'running' };
      return updated;
    });
  };
  const handleStop = async (i: number) => {
    await window.electronAPI.serviceControl('stop', i, SCRIPT_PATHS[i]);
    setServices(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], status: 'stopped' };
      return updated;
    });
  };
  const handleStartAll = async () => {
    await Promise.all(SCRIPT_PATHS.map((path, i) => window.electronAPI.serviceControl('start', i, path)));
    setServices(prev => prev.map(s => ({ ...s, status: 'running' })));
  };
  const handleStopAll = async () => {
    await Promise.all(SCRIPT_PATHS.map((path, i) => window.electronAPI.serviceControl('stop', i, path)));
    setServices(prev => prev.map(s => ({ ...s, status: 'stopped' })));
  };

  return (
    <div>
      <div className="tabs-header">
        {SERVICE_LABELS.map((label, i) => (
          <button
            key={i}
            className={`tab-btn${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {label}
            <span className={`status-dot ${services[i].status}`}></span>
          </button>
        ))}
      </div>
      <div className="tabs-actions">
        <button onClick={handleStartAll}>Start All</button>
        <button onClick={handleStopAll}>Stop All</button>
      </div>
      <div className="tab-content">
        <div className="service-header">
          <span className="service-label">{SERVICE_LABELS[activeTab]}</span>
          <button onClick={() => handleStart(activeTab)} disabled={services[activeTab].status === 'running'}>Start</button>
          <button onClick={() => handleStop(activeTab)} disabled={services[activeTab].status !== 'running'}>Stop</button>
        </div>
        <pre className="service-log" style={{height: '400px', width: '520px', overflow: 'auto', background: '#18191b', color: '#fff', borderRadius: 8, padding: 16, fontSize: 16, marginTop: 12 }}>{services[activeTab].log}</pre>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#191b1d' }}>
      <div style={{ background: '#232528', borderRadius: 20, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', padding: 40, minWidth: 600, minHeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: 36, marginBottom: 24 }}>Service Manager</h1>
        <ServiceTabs />
      </div>
    </div>
  );
}
