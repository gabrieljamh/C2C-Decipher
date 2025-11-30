import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Wifi, Cpu, Clock, Activity, Lock, Unlock, RotateCcw, Save, History, Trash2, Check, Download, Upload, Tag, X } from 'lucide-react';
import { GameData, DAYS, MONTHS } from './types';
import { calculatePassword } from './utils';
import { CopyInput } from './components/CopyInput';
import { InputField } from './components/InputField';

const INITIAL_STATE: GameData = {
  serialNumber: '',
  deviceName: '',
  deviceIp: '',
  deviceModel: '',
  fabMonth: '01',
  fabDay: '01',
  latency: '',
};

interface HistoryItem {
  id: string;
  timestamp: string;
  label: string;
  serialNumber: string;
  deviceIp: string;
  password: string;
}

export default function App() {
  const [formData, setFormData] = useState<GameData>(INITIAL_STATE);
  const [password, setPassword] = useState('PENDING...');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logLabel, setLogLabel] = useState('');
  
  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pwd = calculatePassword(formData);
    setPassword(pwd);
    setSavedSuccess(false); // Reset save state when data changes
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, serialNumber: e.target.value.toUpperCase() }));
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, deviceModel: e.target.value.toUpperCase() }));
  };

  const handleClear = () => {
    setFormData(INITIAL_STATE);
    setSavedSuccess(false);
    setLogLabel('');
  };

  const handleSaveToHistory = () => {
    if (password === 'PENDING...' || password === 'ERROR') return;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      label: logLabel || 'Untitled Mission',
      serialNumber: formData.serialNumber || 'N/A',
      deviceIp: formData.deviceIp || 'N/A',
      password: password
    };

    setHistory(prev => [newItem, ...prev]);
    setSavedSuccess(true);
    setLogLabel(''); // Clear label input
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleExportClick = () => {
    if (history.length === 0) return;
    const defaultName = `c2c-log-${new Date().toISOString().split('T')[0]}`;
    setExportFileName(defaultName);
    setShowExportModal(true);
  };

  const performExport = () => {
    const finalFileName = exportFileName.trim() || `c2c-log-${new Date().toISOString().split('T')[0]}`;
    const jsonString = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFileName.endsWith('.json') ? finalFileName : `${finalFileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Basic validation check
          const isValid = parsed.every(item => item.id && item.password);
          if (isValid) {
            // Ensure backwards compatibility for logs without labels
            const normalized = parsed.map(item => ({
                ...item,
                label: item.label || 'Imported Entry'
            }));
            setHistory(normalized);
          } else {
            alert("Invalid log file format.");
          }
        }
      } catch (err) {
        console.error('Failed to parse history file', err);
        alert('Failed to read file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const copyOverrideCommand = (ip: string) => {
    const cmd = `/override ${ip}`;
    navigator.clipboard.writeText(cmd);
  };

  const isPasswordValid = password !== 'PENDING...' && password !== 'ERROR';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 relative">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-20">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
              <Terminal size={32} className="text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                C2C <span className="text-emerald-500">Decipher</span>
              </h1>
              <p className="text-slate-400 text-sm">Protocol Assistant & Override Tool</p>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-900/50 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-lg transition-all text-xs md:text-sm font-semibold group"
            title="Reset Form"
          >
            <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Inputs */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
              <ShieldAlert size={18} />
              <h2>Identification Data</h2>
            </div>

            <div className="space-y-4 p-5 bg-slate-900/50 rounded-xl border border-slate-800">
              
              {/* Serial Number Group */}
              <div className="space-y-3">
                <InputField 
                  label="Serial Number (XXXX-XXXX)"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleSerialChange}
                  placeholder="A1B2-C3D4"
                  maxLength={9}
                />
                <CopyInput 
                  label="Command: Identify"
                  value={formData.serialNumber ? `/identify ${formData.serialNumber}` : ''} 
                  placeholder="/identify ..."
                />
              </div>

              {/* Device Name Group */}
              <div className="space-y-3 pt-2 border-t border-slate-800/50">
                <InputField 
                  label="Device Name"
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleChange}
                  placeholder="MainServer"
                />
                <CopyInput 
                  label="Command: Scan"
                  value={formData.deviceName ? `/scan ${formData.deviceName}` : ''} 
                  placeholder="/scan ..."
                />
              </div>

              {/* IP Address Group */}
              <div className="space-y-3 pt-2 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-300">
                   <Wifi size={16} /> <span className="text-xs font-bold uppercase">Network</span>
                </div>
                <InputField 
                  label="Device IP (IPv4)"
                  name="deviceIp"
                  value={formData.deviceIp}
                  onChange={handleChange}
                  placeholder="192.168.0.1"
                />
                <CopyInput 
                  label="Command: Ping"
                  value={formData.deviceIp ? `/ping ${formData.deviceIp}` : ''} 
                  placeholder="/ping ..."
                />
              </div>

            </div>
          </section>

          {/* Right Column: Details & Output */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
              <Cpu size={18} />
              <h2>Hardware Specifications</h2>
            </div>

            <div className="space-y-4 p-5 bg-slate-900/50 rounded-xl border border-slate-800">
              
              <InputField 
                label="Device Model (XXX-XXX)"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleModelChange}
                placeholder="GEN-100"
                maxLength={12} 
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Clock size={12} /> Fab Date (Day)
                   </label>
                   <select 
                     name="fabDay" 
                     value={formData.fabDay} 
                     onChange={handleChange}
                     className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-md p-2.5 focus:outline-none focus:border-emerald-500"
                   >
                     {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                   </select>
                </div>
                <div className="flex flex-col gap-1">
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Clock size={12} /> Fab Date (Month)
                   </label>
                   <select 
                     name="fabMonth" 
                     value={formData.fabMonth} 
                     onChange={handleChange}
                     className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-md p-2.5 focus:outline-none focus:border-emerald-500"
                   >
                     {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                   </select>
                </div>
              </div>

              <div className="pt-2">
                 <InputField 
                  label="Device Latency (ms)"
                  name="latency"
                  type="number"
                  value={formData.latency}
                  onChange={handleChange}
                  placeholder="45"
                />
              </div>
            </div>

            {/* Final Output Section */}
            <div className="mt-8 pt-6 border-t border-slate-800 space-y-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    {isPasswordValid ? <Unlock size={18} /> : <Lock size={18} />}
                    <h2>Decryption Result</h2>
                 </div>
                 
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-40">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">
                        <Tag size={14} />
                      </div>
                      <input 
                        type="text" 
                        value={logLabel}
                        onChange={(e) => setLogLabel(e.target.value)}
                        placeholder="Mission Label..."
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-md pl-7 pr-2 py-1.5 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                      />
                    </div>
                    
                    <button 
                      onClick={handleSaveToHistory}
                      disabled={!isPasswordValid}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded border transition-all whitespace-nowrap ${
                        savedSuccess 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-emerald-400 hover:border-emerald-500/50 disabled:opacity-50 disabled:hover:text-slate-400'
                      }`}
                    >
                      {savedSuccess ? <Check size={14} /> : <Save size={14} />}
                      {savedSuccess ? 'Saved' : 'Save Log'}
                    </button>
                 </div>
               </div>

               <div className="p-6 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-6 shadow-lg shadow-emerald-900/5 relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity size={100} />
                  </div>

                  <CopyInput 
                    label="Command: Override"
                    value={formData.deviceIp ? `/override ${formData.deviceIp}` : ''}
                    placeholder="/override ..."
                  />
                  
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-between">
                        <span>Generated Password</span>
                        <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400">PLAIN FORMAT</span>
                     </label>
                     <div className="relative group">
                        <div className={`w-full text-center text-3xl font-mono font-bold tracking-widest py-6 rounded-lg border-2 transition-all duration-300 ${
                           password === 'PENDING...' 
                           ? 'bg-slate-900/50 border-slate-700 text-slate-600' 
                           : 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        }`}>
                           {password}
                        </div>
                        {isPasswordValid && (
                           <button
                           onClick={() => {
                              navigator.clipboard.writeText(password);
                           }}
                           className="absolute right-2 top-2 p-2 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all"
                           title="Copy Password"
                           >
                           <Copy size={20} />
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </main>

        {/* Mission Log / History - Always visible to allow Import */}
        <section className="pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-400 font-semibold">
                <History size={18} />
                <h2>Mission Log</h2>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <button 
                  onClick={handleImportClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-emerald-400 rounded transition-colors"
                >
                  <Upload size={14} /> Import
                </button>
                <button 
                  onClick={handleExportClick}
                  disabled={history.length === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    history.length === 0 
                      ? 'text-slate-600 bg-slate-900/50 border border-slate-800 cursor-not-allowed'
                      : 'text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-emerald-400'
                  }`}
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
            
            {history.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Mission Label</th>
                        <th className="px-4 py-3">Serial No.</th>
                        <th className="px-4 py-3">Device IP</th>
                        <th className="px-4 py-3">Result</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                          <td className="px-4 py-3">
                            <span className="text-emerald-400 font-semibold text-xs border border-emerald-900/50 bg-emerald-950/20 px-2 py-0.5 rounded">
                              {item.label}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{item.timestamp}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-300">{item.serialNumber}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">{item.deviceIp}</td>
                          <td className="px-4 py-3 font-mono text-emerald-400 font-bold tracking-wider">{item.password}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button 
                              onClick={() => copyOverrideCommand(item.deviceIp)}
                              className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-sky-950/30 rounded transition-colors"
                              title="Copy Override Command"
                            >
                              <Terminal size={14} />
                            </button>
                            <button 
                              onClick={() => navigator.clipboard.writeText(item.password)}
                              className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/30 rounded transition-colors"
                              title="Copy Password"
                            >
                              <Copy size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 text-center">
                <History className="text-slate-700 mb-3" size={32} />
                <p className="text-slate-500 text-sm">No mission logs recorded locally.</p>
                <p className="text-slate-600 text-xs mt-1">Save a decryption result or import a previously exported log file.</p>
              </div>
            )}
        </section>

      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Download size={20} className="text-emerald-500" />
              Export Mission Log
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Enter a filename to save your mission history locally.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filename</label>
                <input
                  type="text"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-md p-3 focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && performExport()}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={performExport}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-emerald-900/20 text-sm"
                >
                  Download JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple internal icon wrapper for reuse if needed
function Copy({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}