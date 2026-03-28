import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Github, Linkedin, BookOpen, Award, Code, Bot, Send, CheckCircle2, MessageSquare, X, Sun, Moon, Monitor, Heart } from 'lucide-react';

const FlipCard = ({ title, icon: Icon, children, frontClass, isExpandable = false, variants }) => {
  const [isFlipped, setFlipped] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setFlipped(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setFlipped(false);
    }, 400); // Debounce collapse to prevent layout bounce
  };

  return (
    <motion.div 
      layout
      variants={variants}
      className={`w-full cursor-pointer perspective-1000 ${isExpandable && isFlipped ? 'md:col-span-2' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setFlipped(!isFlipped)}
    >
      <motion.div
        layout
        className="w-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 140, damping: 18 }}
      >
        {/* Front Face */}
        <div className={`backface-hidden rounded-3xl shadow-xl border p-8 flex flex-col items-center justify-center gap-5 text-white z-20 ${frontClass} ${!isFlipped ? 'relative h-[400px]' : 'absolute inset-0 h-full overflow-hidden'}`}>
          <Icon className="w-20 h-20 opacity-90 drop-shadow-md" />
          <h2 className="text-3xl font-extrabold tracking-tight pt-2 drop-shadow-sm text-center">{title}</h2>
        </div>

        {/* Back Face */}
        <div className={`backface-hidden rounded-3xl shadow-xl border p-7 dark:bg-slate-800 bg-white/95 backdrop-blur-xl dark:border-slate-700/60 border-slate-200/60 rotate-y-180 flex flex-col z-10 ${isFlipped ? 'relative h-auto min-h-[400px]' : 'absolute inset-0 h-full overflow-hidden'}`}>
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-700/50 mt-2">
            <div className={`p-2 rounded-lg text-white shadow-sm ${frontClass.split(' ')[0]}`}>
              <Icon className="w-5 h-5" />
            </div>
            {title}
          </h3>
          <div className="flex-1 w-full">
             {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function App() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const initialGreeting = `Hey there! 👋 I am Profy, the personal AI assistant for this portfolio! 

Here is a quick walkthrough of what you can explore:
🎓 Education: Expand the card to view the academic journey.
🏆 Achievements: Discover real-world projects and hackathons.
💻 Skills Matrix: Check out core technical strengths.
🎨 Hobbies: See what happens outside of code!

Feel free to interact with any of the 3D cards, or click one of the suggested questions below to start chatting with me!`;

  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: initialGreeting, sender: 'ai' }
  ]);
  const [chatSuggested, setChatSuggested] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile');
      setProfileData(res.data);
      setLoading(false);
      
      // Auto-open chat to present Profy's walkthrough naturally after load animations finish
      setTimeout(() => setChatOpen(true), 1200);

      // Lazily hook generative AI to formulate initial recruiter suggestions tailored exactly to this fetched profile!
      axios.post('/api/chat/suggestions', { profileContext: res.data })
        .then(suggRes => {
          if (suggRes.data.suggestions) {
            setChatSuggested(suggRes.data.suggestions);
          }
        })
        .catch(err => console.error("Error fetching AI suggestions:", err));

    } catch (err) {
      console.error(err);
      setError('Failed to fetch profile. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const sendMessage = async (queryText) => {
    if (!queryText.trim() || chatLoading) return;
    
    setChatInput('');
    setChatSuggested([]); // Hide chips while loading
    setChatMessages(prev => [...prev, { id: Date.now(), text: queryText, sender: 'user' }]);
    setChatLoading(true);

    try {
      const res = await axios.post('/api/chat', { 
        question: queryText, 
        profileContext: profileData 
      });
      
      setChatMessages(prev => [...prev, { id: Date.now(), text: res.data.answer || "Sorry, I couldn't generate a response.", sender: 'ai' }]);
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        setChatSuggested(res.data.suggestions);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { id: Date.now(), text: 'Network error communicating with AI.', sender: 'ai' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    sendMessage(chatInput);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium text-slate-500 dark:text-slate-400 animate-pulse bg-slate-50 dark:bg-slate-900">Loading profile...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium bg-slate-50 dark:bg-slate-900">{error}</div>;
  if (!profileData) return null;

  const { user, education, skills, achievements } = profileData;

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1, y: 0,
      transition: { staggerChildren: 0.15, duration: 0.6, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-teal-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 overflow-x-hidden transition-colors duration-500 relative">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed" aria-hidden="true">
        <div className="absolute top-[5%] left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-500/30 dark:bg-indigo-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob"></div>
        <div className="absolute top-[30%] right-[0%] w-[30%] h-[40%] rounded-full bg-teal-400/30 dark:bg-teal-700/10 blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-rose-400/30 dark:bg-rose-800/10 blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="max-w-5xl mx-auto space-y-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* Theme Toggle Navbar */}
        <div className="flex justify-end mb-4">
          <div className="flex bg-white/70 dark:bg-slate-800/70 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 backdrop-blur-md">
            <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-colors flex items-center justify-center ${theme === 'light' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} aria-label="Light Theme">
              <Sun className="w-4 h-4" />
            </button>
            <button onClick={() => setTheme('system')} className={`p-2 rounded-full transition-colors flex items-center justify-center ${theme === 'system' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} aria-label="System Theme">
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setTheme('dark')} className={`p-2 rounded-full transition-colors flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} aria-label="Dark Theme">
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <motion.div variants={itemVariants} className="card p-10 flex flex-col md:flex-row items-center md:items-start gap-10 border-t-4 border-t-indigo-500 dark:border-t-indigo-400 bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-slate-800/90 dark:to-slate-800/90 shadow-lg">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="relative w-40 h-40 shrink-0 rounded-full overflow-hidden border-[6px] border-white dark:border-slate-800 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-teal-400 opacity-20"></div>
            <img src={user.profile_image || "/images/profile.jpg"} alt="Profile" className="w-full h-full object-cover" />
          </motion.div>
          <div className="flex-1 text-center md:text-left space-y-5">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
              >
                {user.name}
              </motion.h1>
              <p className="text-slate-500 dark:text-slate-400 text-xl mt-2 font-medium">{user.bio}</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-base font-semibold text-slate-600 dark:text-slate-300">
              {user.college && <div className="flex items-center gap-2"><div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full"><GraduationCap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /></div> <span>{user.college}</span></div>}
              {user.email && <div className="flex items-center gap-2"><div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-full"><Mail className="w-5 h-5 text-teal-500 dark:text-teal-400" /></div> <span>{user.email}</span></div>}
            </div>
            
            <div className="flex gap-4 justify-center md:justify-start pt-3">
              {user.github && (
                <motion.a whileHover={{ y: -4 }} href={user.github} target="_blank" rel="noreferrer" className="p-3 bg-indigo-600 dark:bg-slate-800 hover:bg-indigo-700 dark:hover:bg-slate-700 rounded-2xl transition-colors text-white dark:text-slate-300 shadow-md">
                  <Github className="w-6 h-6" />
                </motion.a>
              )}
              {user.linkedin && (
                <motion.a whileHover={{ y: -4 }} href={user.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-blue-600 dark:bg-slate-800 hover:bg-blue-700 dark:hover:bg-slate-700 rounded-2xl transition-colors text-white dark:text-slate-300 shadow-md">
                  <Linkedin className="w-6 h-6" />
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>

        {/* 3D Interactive Flip Card Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Education FlipCard */}
          <FlipCard isExpandable={true} variants={itemVariants} title="Education" icon={BookOpen} frontClass="bg-gradient-to-br from-indigo-500 to-blue-600 border-indigo-400/50">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/30 before:via-indigo-500/30 before:to-transparent">
                {education && education.map((ed) => (
                  <div key={ed.id} className="relative flex items-center justify-normal group is-active mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white dark:border-slate-800 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shrink-0 md:-translate-x-1/2 shadow-sm z-10 transition-colors">
                      <GraduationCap className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(100%-2.5rem)] p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{ed.degree}</div>
                        <time className="text-[11px] font-bold tracking-wide text-indigo-600 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-900/40 px-3 py-0.5 rounded-full w-fit">{ed.start_year} - {ed.end_year}</time>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">{ed.institution}</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 flex items-center gap-1.5 bg-white dark:bg-slate-800 w-fit px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> {ed.grade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FlipCard>

          {/* Achievements FlipCard */}
          <FlipCard variants={itemVariants} title="Achievements" icon={Award} frontClass="bg-gradient-to-br from-amber-500 to-orange-600 border-orange-400/50">
              <div className="space-y-4">
                {achievements && achievements.map((ach) => (
                  <div key={ach.id} className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border border-orange-100/60 dark:border-orange-500/20 shadow-sm relative overflow-hidden group/ach">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover/ach:scale-110"></div>
                    <div className="font-bold text-orange-900 dark:text-amber-300 text-[15px] mb-2 flex items-center gap-2">
                      {ach.title} 
                      <span className="text-xs text-orange-600/80 dark:text-amber-400/80 font-bold bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full ring-1 ring-orange-200/50 dark:ring-orange-500/30 shrink-0">{ach.year}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{ach.description}</div>
                  </div>
                ))}
              </div>
            </FlipCard>

          {/* Skills FlipCard */}
          <FlipCard variants={itemVariants} title="Skills Matrix" icon={Code} frontClass="bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-400/50">
              <div className="flex flex-wrap gap-2.5 pt-2">
                {skills && skills.map((skill) => (
                  <span key={skill.id} className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl font-bold tracking-wide shadow-sm hover:border-teal-300 dark:hover:border-teal-500 transition-colors">
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </FlipCard>

          {/* Hobbies FlipCard */}
          <FlipCard variants={itemVariants} title="Hobbies" icon={Heart} frontClass="bg-gradient-to-br from-rose-500 to-pink-600 border-rose-400/50">
              <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                <p className="text-base text-slate-700 dark:text-slate-300 leading-loose font-medium">{user.hobbies}</p>
              </div>
            </FlipCard>

        </motion.div>
      </motion.div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
              className="absolute bottom-20 right-0 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/60 dark:border-slate-700/60 ring-1 ring-slate-900/5 mb-4"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">Profy AI</h3>
                    <p className="text-[10px] text-indigo-100 font-medium opacity-90">Personal Assistant to {user.name.split(' ')[0]}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col scroll-smooth">
                {chatMessages.map(msg => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} 
                    className={msg.sender === 'user' 
                      ? "bg-slate-800 dark:bg-indigo-600 text-white p-3.5 text-sm rounded-2xl rounded-tr-sm w-[85%] shadow-sm self-end whitespace-pre-wrap leading-relaxed"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 text-sm rounded-2xl rounded-tl-sm w-[90%] shadow-sm self-start text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed"
                    }
                  >
                    {msg.text}
                  </motion.div>
                ))}
                {chatLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 text-sm rounded-2xl rounded-tl-sm w-fit shadow-sm self-start flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </motion.div>
                )}
                
                {/* Suggested Questions Quick Replies */}
                {!chatLoading && chatSuggested.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pt-3 pb-2">
                    {chatSuggested.map((q, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => sendMessage(q)}
                        className="text-[12px] font-medium bg-indigo-50/80 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-700/50 px-3.5 py-2 rounded-2xl shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 transition-all text-left w-fit max-w-[100%] leading-relaxed"
                      >
                        {q}
                      </button>
                    ))}
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                <form onSubmit={handleChatSubmit} className="flex gap-2 relative">
                  <input 
                    type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your question..." 
                    className="flex-1 text-sm pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-medium placeholder:text-slate-400 dark:text-slate-200" 
                  />
                  <button 
                    type="submit" disabled={chatLoading || !chatInput.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 w-9 flex items-center justify-center bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-colors ${chatOpen ? 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white' : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white'}`}
        >
          <AnimatePresence mode="wait">
            <motion.div key={chatOpen ? 'close' : 'open'} initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
              {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-24 py-8 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 md:px-0 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} {user.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms and Conditions</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
