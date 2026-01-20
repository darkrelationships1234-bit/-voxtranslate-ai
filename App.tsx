
import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { AppStatus, ProcessingResult, SOURCE_LANGUAGES, TARGET_LANGUAGES, View, ErrorDetail } from './types';
import { transcribeVideo } from './services/geminiService';

const BLOG_POSTS = [
  {
    id: 1,
    title: "How to Translate Chinese Videos to English in 2026: A Step-by-Step Guide",
    excerpt: "Learn the latest workflows for high-accuracy Mandarin translation using neural AI models.",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800",
    date: "March 15, 2026"
  },
  {
    id: 2,
    title: "Why Gemini 1.5 Flash is the Best AI for Mandarin Transcription",
    excerpt: "An in-depth look at latency, context windows, and why Flash-tier models are winning the media game.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    date: "March 12, 2026"
  },
  {
    id: 3,
    title: "5 Secrets to Growing Your Global YouTube Audience using Video Subtitles",
    excerpt: "Subtitles aren't just for accessibility; they are your ticket to global SEO dominance.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    date: "March 10, 2026"
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<ProcessingResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ProcessingResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState('Chinese');
  const [targetLang, setTargetLang] = useState('English');
  const [progress, setProgress] = useState(0);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('vox_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const processFile = async () => {
    if (!selectedFile) return;
    setStatus(AppStatus.UPLOADING);
    setProgress(10);
    setErrorDetail(null);

    try {
      if (selectedFile.size > 25 * 1024 * 1024) {
        throw {
          type: 'size',
          message: 'File size exceeds 25MB limit.',
          suggestions: ['Compress your video.', 'Trim the video.', 'Upgrade to Pro.']
        };
      }

      await new Promise(r => setTimeout(r, 1000));
      setProgress(30);
      
      setStatus(AppStatus.POLLING);
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 1000));
        setProgress(30 + (i * 15));
      }
      
      setStatus(AppStatus.PROCESSING);
      setProgress(85);
      
      const resData = await transcribeVideo(selectedFile, sourceLang, targetLang);
      
      const fullResult: ProcessingResult = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: selectedFile.name,
        date: new Date().toLocaleDateString(),
        sourceLang,
        targetLang,
        ...resData
      };

      const newHistory = [fullResult, ...history];
      setHistory(newHistory);
      localStorage.setItem('vox_history', JSON.stringify(newHistory));
      
      setCurrentResult(fullResult);
      setStatus(AppStatus.COMPLETED);
      setView('result');
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorDetail(err.type ? (err as ErrorDetail) : {
        type: 'unknown',
        message: 'Processing failed.',
        suggestions: ['Refresh the page.', 'Try a different video format.', 'Check network connection.']
      });
    }
  };

  const renderNavbar = () => (
    <nav className="glass sticky top-0 z-50 px-8 py-4 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setView('dashboard'); setStatus(AppStatus.IDLE); }}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-bolt-lightning text-white text-lg"></i>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">VoxTranslate AI</span>
      </div>
      
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          onClick={() => setView('dashboard')} 
          className={`text-xs uppercase tracking-widest font-bold ${view === 'dashboard' ? 'text-blue-400' : ''}`}
        >
          Home
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setView('blog')} 
          className={`text-xs uppercase tracking-widest font-bold ${view === 'blog' ? 'text-blue-400' : ''}`}
        >
          Blog
        </Button>
      </div>
    </nav>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-6 space-y-16 py-10 page-transition">
      {/* 1. HERO: PROFESSIONAL UPLOAD ZONE */}
      <section className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="p-8 lg:p-12 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              VoxTranslate AI <span className="text-blue-500">Video Transcription</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Professional English translations from Chinese, Spanish, and more. Optimized for 2026 media workflows.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className={`relative glass border-2 border-dashed rounded-3xl p-12 text-center transition-all ${selectedFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30'}`}>
              <input 
                type="file" 
                id="dashboard-upload" 
                className="hidden" 
                accept="video/*" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
              />
              <label htmlFor="dashboard-upload" className="cursor-pointer block">
                <i className={`fa-solid ${selectedFile ? 'fa-file-circle-check text-blue-500' : 'fa-cloud-arrow-up text-gray-600'} text-6xl mb-6 transition-all`}></i>
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-white truncate max-w-sm mx-auto">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB Ready for processing</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xl font-bold">Drag & Drop Your Media</p>
                    <p className="text-sm text-gray-500">MP4, MOV, WEBM (Max 25MB)</p>
                  </div>
                )}
              </label>
              {selectedFile && (
                <button onClick={() => setSelectedFile(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400"><i className="fa-solid fa-circle-xmark text-xl"></i></button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Source Language</label>
                <div className="relative">
                  <select 
                    value={sourceLang} 
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full h-12 bg-gray-900 border border-white/10 rounded-xl px-4 appearance-none text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {SOURCE_LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.name}</option>)}
                  </select>
                  <i className="fa-solid fa-caret-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Target Language</label>
                <div className="relative">
                  <select 
                    value={targetLang} 
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full h-12 bg-gray-900 border border-white/10 rounded-xl px-4 appearance-none text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {TARGET_LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.name}</option>)}
                  </select>
                  <i className="fa-solid fa-caret-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                </div>
              </div>
            </div>

            <Button 
              className={`w-full h-14 text-lg font-bold shadow-xl shadow-blue-600/10 transition-all ${selectedFile && status === AppStatus.IDLE ? 'shimmer-active' : ''}`} 
              onClick={processFile}
              disabled={!selectedFile || status !== AppStatus.IDLE}
              isLoading={status !== AppStatus.IDLE && status !== AppStatus.ERROR}
            >
              {status === AppStatus.IDLE ? `Transcribe ${sourceLang} to ${targetLang}` : 'Processing...'}
            </Button>

            {(status === AppStatus.UPLOADING || status === AppStatus.POLLING || status === AppStatus.PROCESSING) && (
              <div className="space-y-3 animate-in fade-in">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 text-center font-medium tracking-widest uppercase">
                  {status === AppStatus.UPLOADING && 'Sending fragments to cloud...'}
                  {status === AppStatus.POLLING && 'Waiting for file state: ACTIVE...'}
                  {status === AppStatus.PROCESSING && 'Running Gemini Flash Neural Engine...'}
                </p>
              </div>
            )}

            {status === AppStatus.ERROR && errorDetail && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errorDetail.message}</span>
                <button onClick={() => setStatus(AppStatus.IDLE)} className="ml-auto underline font-bold">Retry</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. GALLERY: HISTORY GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className="fa-solid fa-clock-rotate-left text-gray-500"></i>
            Recent Transcriptions
          </h2>
          <span className="text-xs font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
            {history.length} Files
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-20 text-center glass rounded-3xl border-dashed border-white/10">
            <i className="fa-solid fa-folder-open text-5xl mb-4 opacity-10"></i>
            <p className="text-gray-500">No transcription history yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div key={item.id} className="glass rounded-3xl p-6 border border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => { setCurrentResult(item); setView('result'); }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-file-video text-xl"></i>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded text-gray-400 uppercase tracking-tighter">{item.sourceLang}</span>
                    <i className="fa-solid fa-arrow-right text-[8px] mt-1 text-gray-600"></i>
                    <span className="text-[9px] font-bold bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 uppercase tracking-tighter">{item.targetLang}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white truncate mb-1 group-hover:text-blue-400 transition-colors">{item.fileName}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">{item.date}</p>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" className="px-0 py-0 text-[10px] font-bold uppercase tracking-widest hover:bg-transparent">
                    Open Results <i className="fa-solid fa-chevron-right ml-1"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. HOW IT WORKS: GRID BOXES */}
      <section className="space-y-10 py-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">How It Works</h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 text-sm">Video translation ka sabse asaan tareeqa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
              <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Step 1: Upload</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Apna Chinese ya koi bhi foreign video drag aur drop karein. Hum sabhi formats support karte hain.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-500 mb-6">
              <i className="fa-solid fa-microchip text-xl"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Step 2: AI Processing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Gemini 1.5 Flash AI video ko 'watch' karta hai aur speech recognize karke timestamps generate karta hai.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-400/30 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
              <i className="fa-solid fa-language text-xl"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Step 3: Translation</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI automatically dialogue ko fluently English mein translate karta hai, bina context khoye.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-green-500/30 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mb-6">
              <i className="fa-solid fa-copy text-xl"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Step 4: Copy & Use</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Side-by-side script dekhein aur ek click mein copy karke apne kaam mein use karein.
            </p>
          </div>
        </div>
      </section>

      {/* AD Slot */}
      <div className="ad-unit h-24 rounded-2xl border-white/5 mt-6">
        Ad Slot - Optimized for Media Content (728x90)
      </div>
    </div>
  );

  const renderBlog = () => (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12 page-transition">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight">VoxTranslate <span className="text-blue-500">Insights</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Expert guides on AI video translation, media localization, and audience growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {BLOG_POSTS.map((post) => (
          <article key={post.id} className="glass rounded-[2rem] overflow-hidden border border-white/5 group hover:border-blue-500/20 transition-all flex flex-col shadow-2xl">
            <div className="h-56 overflow-hidden relative">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-600/30 backdrop-blur-md">
                  AI Media
                </span>
              </div>
            </div>
            <div className="p-8 space-y-4 flex-1 flex flex-col">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">{post.date}</p>
              <h2 className="text-xl font-bold group-hover:text-blue-400 transition-colors leading-tight">
                {post.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
              <div className="pt-4 mt-auto">
                <Button variant="secondary" className="w-full justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  Read Full Guide <i className="fa-solid fa-arrow-right-long ml-2 group-hover:translate-x-1 transition-transform"></i>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="ad-unit h-48 rounded-[2rem] border-white/5 mt-10">
        Sidebar Optimized Content Ad Slot (970x250)
      </div>
    </div>
  );

  const renderResult = () => currentResult && (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 page-transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('dashboard')} className="glass w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/10 border border-white/10">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-2xl font-extrabold truncate max-w-md">{currentResult.fileName}</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{currentResult.date} • {currentResult.sourceLang} to {currentResult.targetLang}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="px-5" onClick={() => window.print()}><i className="fa-solid fa-file-pdf mr-2"></i> Export</Button>
          <Button variant="primary" className="px-5" onClick={() => { setSelectedFile(null); setStatus(AppStatus.IDLE); setView('dashboard'); }}>
            <i className="fa-solid fa-plus mr-2"></i> New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh]">
        <div className="glass rounded-[2rem] border border-white/10 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Original Audio ({currentResult.sourceLang})</span>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
            {currentResult.segments.map((s, i) => (
              <div key={i} className="flex gap-6 group hover:bg-white/[0.01] transition-all p-2 rounded-xl">
                <span className="text-[10px] font-mono text-gray-600 mt-1 whitespace-nowrap">{s.timestamp}</span>
                <p className="text-gray-400 text-sm leading-relaxed">{s.originalText}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2rem] border-2 border-blue-500/20 flex flex-col overflow-hidden shadow-2xl shadow-blue-500/5">
          <div className="p-5 border-b border-white/5 bg-blue-500/[0.03] flex justify-between items-center">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">English Translation</span>
            <button 
              onClick={() => { navigator.clipboard.writeText(currentResult.segments.map(s => s.translatedText).join('\n')); alert('Copied to clipboard!'); }}
              className="text-blue-500 hover:text-blue-300 transition-colors text-sm"
            >
              <i className="fa-regular fa-copy"></i>
            </button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 bg-blue-500/[0.01]">
            {currentResult.segments.map((s, i) => (
              <div key={i} className="flex gap-6 border-l-2 border-blue-500/20 pl-4 group hover:bg-white/[0.01] transition-all py-2 rounded-r-xl">
                <span className="text-[10px] font-mono text-blue-500/60 mt-1 whitespace-nowrap">{s.timestamp}</span>
                <p className="text-white text-sm leading-relaxed font-medium">{s.translatedText}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">
      {renderNavbar()}

      <main className="flex-1">
        {view === 'dashboard' && renderDashboard()}
        {view === 'blog' && renderBlog()}
        {view === 'result' && renderResult()}
        {(view === 'privacy' || view === 'terms' || view === 'about' || view === 'contact') && (
            <div className="py-32 text-center glass m-8 rounded-[3rem] border border-white/10 page-transition">
              <h2 className="text-4xl font-extrabold mb-4 uppercase tracking-tighter">
                {view === 'privacy' && 'Privacy Policy'}
                {view === 'terms' && 'Terms of Service'}
                {view === 'about' && 'About Our AI'}
                {view === 'contact' && 'Contact Support'}
              </h2>
              <p className="text-gray-500 italic max-w-lg mx-auto leading-relaxed">
                We are committed to full transparency in 2026. This documentation is currently being updated to reflect the latest Gemini Flash processing protocols.
              </p>
              <Button className="mt-10 mx-auto" onClick={() => setView('dashboard')}>Return Home</Button>
            </div>
        )}
      </main>

      <footer className="glass border-t border-white/5 py-16 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-bolt-lightning text-white text-sm"></i>
                </div>
                <span className="font-bold tracking-tight text-lg">VoxTranslate AI</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-widest font-medium">
                The world's first Gemini-native video localization engine. Zero latency, 100% neural accuracy for the next generation of global creators.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Platform</h4>
                <ul className="text-[10px] space-y-3 font-bold text-gray-500 uppercase tracking-widest">
                  <li><button onClick={() => setView('dashboard')} className="hover:text-blue-400 transition-colors">Home</button></li>
                  <li><button onClick={() => setView('blog')} className="hover:text-blue-400 transition-colors">Blog</button></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Legal</h4>
                <ul className="text-[10px] space-y-3 font-bold text-gray-500 uppercase tracking-widest">
                  <li><button onClick={() => setView('privacy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => setView('terms')} className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Support</h4>
                <ul className="text-[10px] space-y-3 font-bold text-gray-500 uppercase tracking-widest">
                  <li><button onClick={() => setView('contact')} className="hover:text-blue-400 transition-colors">Contact</button></li>
                  <li><button onClick={() => setView('about')} className="hover:text-blue-400 transition-colors">Safety</button></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em]">
              © 2026 VOXTRANSLATE AI | HIGH-PERFORMANCE MEDIA TRANSLATION
            </p>
            <div className="flex gap-6 text-gray-500">
              <i className="fa-brands fa-x-twitter hover:text-white cursor-pointer transition-colors"></i>
              <i className="fa-brands fa-github hover:text-white cursor-pointer transition-colors"></i>
              <i className="fa-brands fa-linkedin hover:text-white cursor-pointer transition-colors"></i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
