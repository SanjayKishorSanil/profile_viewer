// Using standard module style for frontend logic
let profileContext = {};

/**
 * Fetch profile data from Node API
 */
async function fetchProfile() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to fetch profile. Make sure the database is running and initialized.');
    
    const data = await res.json();
    profileContext = data; // Save context to pass back to AI Chat
    renderProfile(data);
  } catch (err) {
    console.error(err);
    document.getElementById('profile-name').innerText = 'Backend disconnected';
    document.getElementById('profile-bio').innerText = 'Please ensure MySQL backend is running and initialized with data.';
  }
}

/**
 * Render standard Data to DOM
 */
function renderProfile(data) {
  const { user, education, skills, achievements } = data;

  document.getElementById('profile-name').innerText = user.name;
  document.getElementById('profile-bio').innerText = user.bio;
  
  if (user.college) document.getElementById('profile-college').innerText = user.college;
  if (user.email) document.getElementById('profile-email').innerText = user.email;
  
  const githubEl = document.getElementById('profile-github');
  if (user.github) githubEl.href = user.github;
  else githubEl.style.display = 'none';
  
  const linkedinEl = document.getElementById('profile-linkedin');
  if (user.linkedin) linkedinEl.href = user.linkedin;
  else linkedinEl.style.display = 'none';

  if (user.profile_image) {
    document.getElementById('profile-img').src = user.profile_image;
  }

  // Education Timeline
  const edList = document.getElementById('education-list');
  edList.innerHTML = education.map(ed => `
    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <!-- Icon Marker -->
      <div class="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 text-indigo-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
        <i data-lucide="graduation-cap" class="w-4 h-4"></i>
      </div>
      <!-- Content Card -->
      <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
        <div class="flex flex-col sm:flex-row items-baseline justify-between mb-1">
          <div class="font-bold text-slate-800">${ed.degree}</div>
          <time class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">${ed.start_year} - ${ed.end_year}</time>
        </div>
        <div class="text-sm text-slate-600 font-medium">${ed.institution}</div>
        <div class="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-500"></i> Score: ${ed.grade}
        </div>
      </div>
    </div>
  `).join('');

  // Skills Pills
  const skillsList = document.getElementById('skills-list');
  skillsList.innerHTML = skills.map(skill => (
    `<span class="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-full font-medium shadow-sm hover:border-slate-300 transition cursor-default">
      ${skill.skill_name}
    </span>`
  )).join('');

  // Achievements
  const achievementsList = document.getElementById('achievements-list');
  achievementsList.innerHTML = achievements.map(ach => `
    <div class="p-3 rounded-lg bg-orange-50 border border-orange-100/50 hover:bg-orange-100/80 transition shadow-sm">
      <div class="font-semibold text-orange-900 text-sm">${ach.title} <span class="text-xs text-orange-600/70 font-normal">({ach.year})</span></div>
      <div class="text-slate-600 mt-1 text-xs">${ach.description}</div>
    </div>
  `).join('');

  lucide.createIcons();
}

/**
 * Handle AI Bot Form
 */
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const input = document.getElementById('chat-input');
  const question = input.value.trim();
  if (!question) return;

  appendMessage(question, 'user');
  input.value = '';

  const loadingId = appendMessage('...', 'ai', true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, profileContext })
    });
    
    const data = await res.json();
    
    removeMessage(loadingId);
    if (data.answer) {
      appendMessage(data.answer, 'ai');
    } else {
      appendMessage('Sorry, the server returned an error.', 'ai');
    }
  } catch (err) {
    console.error(err);
    removeMessage(loadingId);
    appendMessage('Network error. Failed to reach the AI.', 'ai');
  }
});

function appendMessage(text, sender, isLoading = false) {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  const id = 'msg-' + Date.now();
  msgDiv.id = id;
  
  if (sender === 'user') {
    msgDiv.className = 'bg-slate-800 text-white p-3 text-sm rounded-xl rounded-br-none ml-auto w-[85%] shadow-sm self-end';
  } else {
    msgDiv.className = 'bg-indigo-50 text-indigo-900 border border-indigo-100 p-3 text-sm rounded-xl rounded-bl-none w-[85%] shadow-sm self-start whitespace-pre-wrap leading-relaxed';
    if (isLoading) msgDiv.classList.add('animate-pulse');
  }
  
  msgDiv.innerText = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
  
  return id;
}

function removeMessage(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  fetchProfile();
});
