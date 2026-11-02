import "./style.css";

const AGENTS = [
  { id: "project-lead", name: "Project Lead", role: "قائد الفريق", model: "Nemotron Ultra", initials: "PL", tone: "gold" },
  { id: "problem-analyst", name: "Problem Analyst", role: "تحليل المشكلات", model: "DeepSeek V4.1 Flash", initials: "PA", tone: "blue" },
  { id: "implementation-engineer", name: "Implementation Engineer", role: "مهندس التنفيذ", model: "MiniMax M3.1 Flash", initials: "IE", tone: "violet" },
  { id: "fast-task-engineer", name: "Fast Task Engineer", role: "المهام السريعة", model: "GLM 5.3 Flash", initials: "FT", tone: "orange" },
  { id: "visual-reviewer", name: "Visual Reviewer", role: "مراجع الواجهات", model: "Nemotron Super VL", initials: "VR", tone: "pink" },
  { id: "long-horizon-engineer", name: "Long Horizon Engineer", role: "التخطيط طويل المدى", model: "Laguna XS 2.1", initials: "LH", tone: "cyan" },
  { id: "qa-engineer", name: "QA Engineer", role: "ضمان الجودة", model: "DeepSeek V4.1 Flash", initials: "QA", tone: "green" },
  { id: "security-auditor", name: "Security Auditor", role: "مراجع الأمان", model: "Nemotron Ultra", initials: "SA", tone: "slate" }
];

const state = {
  view: "chat",
  messages: [],
  agents: AGENTS.map((agent) => ({ ...agent, status: "unknown", progress: 0, statusText: "بانتظار الربط" })),
  backend: { database: false, dispatcher: false, callback: false },
  events: [],
  latestRun: null,
  loading: true,
  sending: false,
  error: "",
  room: "main"
};

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function icon(name, size = 18) {
  const paths = {
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
    agents: '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 14h.01M16 14h.01M9 17h6"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"/><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1 1-2.5z"/>'
  };
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.spark) + "</svg>";
}

function agentStatus(agent) {
  const fallback = agent.status === "running" ? "يعمل الآن" :
    agent.status === "completed" ? "اكتملت المهمة" :
    agent.status === "failed" ? "تعذّر التشغيل" : "بانتظار المهمة";
  const status = agent.status === "running" ? "running" :
    agent.status === "completed" ? "completed" :
    agent.status === "failed" ? "failed" : "idle";
  return '<span class="status-dot ' + status + '"></span> ' + escapeHtml(agent.statusText || fallback);
}

function renderAgent(agent) {
  return '<div class="agent-row">' +
    '<div class="agent-avatar ' + agent.tone + '">' + escapeHtml(agent.initials) + '</div>' +
    '<div class="agent-meta"><div class="agent-name">' + escapeHtml(agent.name) + '</div><div class="agent-role">' + escapeHtml(agent.role) + '</div><div class="agent-state">' + agentStatus(agent) + '</div><div class="agent-progress"><i style="width:' + Math.max(0, Math.min(100, Number(agent.progress) || 0)) + '%"></i></div></div>' +
    '<button class="agent-more" type="button" aria-label="تفاصيل ' + escapeHtml(agent.name) + '" data-agent="' + agent.id + '">' + icon("dots", 17) + '</button>' +
    '</div>';
}

function renderMessage(message) {
  const isUser = message.role === "user";
  const agent = AGENTS.find((item) => item.id === message.agent_id);
  const label = isUser ? "أنت" : (agent?.name || "Project Lead");
  return '<article class="message ' + (isUser ? "user-message" : "agent-message") + '">' +
    '<div class="message-avatar ' + (isUser ? "owner-avatar" : "lead-avatar") + '">' + (isUser ? "A" : escapeHtml(agent?.initials || "PL")) + '</div>' +
    '<div class="message-content"><div class="message-head"><strong>' + escapeHtml(label) + '</strong><time>' + escapeHtml(formatTime(message.created_at)) + '</time></div>' +
    '<div class="message-bubble">' + escapeHtml(message.content || "").replace(/\n/g, "<br>") + '</div></div></article>';
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
}

function viewContent() {
  if (state.view === "agents") {
    return '<section class="info-view"><div class="view-kicker">TEAM DIRECTORY</div><h2>فريق UTILORA</h2><p>ثمانية وكلاء متخصصين يعملون كفريق واحد. حالة كل وكيل ستظهر هنا عند اكتمال ربط محرك التشغيل.</p><div class="agent-directory">' + state.agents.map(renderAgent).join("") + '</div></section>';
  }
  if (state.view === "activity") {
    const rows = [...state.events].reverse();
    const timeline = rows.length
      ? rows.map((event) => {
          const agent = AGENTS.find((item) => item.id === event.agent_id);
          return '<article class="activity-event"><span class="activity-marker"></span><div class="activity-event-main"><div class="activity-event-head"><strong>' +
            escapeHtml(agent?.name || event.agent_id || "UTILORA") + '</strong><time>' + escapeHtml(formatTime(event.created_at)) +
            '</time></div><p>' + escapeHtml(event.message || event.event_type || "حدث جديد") + '</p></div></article>';
        }).join("")
      : '<div class="empty-state compact"><div class="empty-icon">' + icon("activity", 24) + '</div><strong>لا توجد أحداث مسجلة بعد</strong><span>ستظهر هنا بداية المهام وتقارير الوكلاء وحالات اكتمالها.</span></div>';
    return '<section class="info-view"><div class="view-kicker">ACTIVITY LOG</div><h2>سجل النشاط</h2><p>آخر أحداث التشغيل المسجلة مباشرة في قاعدة بيانات الفريق.</p><div class="activity-timeline">' + timeline + '</div></section>';
  }
  if (state.view === "security") {
    const securityBadge = (enabled) => '<b class="' + (enabled ? "secure-tag" : "pending-tag") + '">' + (enabled ? "متصل" : "غير مكتمل") + '</b>';
    return '<section class="info-view"><div class="view-kicker">ACCESS CONTROL</div><h2>الخصوصية والأمان</h2><p>تسجيل الدخول محمي عبر Vercel، وقاعدة البيانات لا تُقرأ إلا من الخادم. مفاتيح الخدمات لا تُرسل إلى المتصفح.</p><div class="security-cards"><div class="security-card"><span class="security-icon">' + icon("lock", 20) + '</span><div><strong>حماية الوصول</strong><small>Vercel Authentication على جميع البيئات · الفريق يحتوي على مالك واحد فقط حالياً</small></div><b class="secure-tag">مفعّل</b></div><div class="security-card"><span class="security-icon">' + icon("shield", 20) + '</span><div><strong>قاعدة البيانات</strong><small>RLS مفعّل، والوصول إلى الجداول محصور بمفتاح خادمي</small></div>' + securityBadge(state.backend.database) + '</div><div class="security-card"><span class="security-icon">' + icon("agents", 20) + '</span><div><strong>تشغيل الوكلاء</strong><small>GitHub Actions + هوية OIDC موثوقة، دون مفاتيح داخل المتصفح</small></div>' + securityBadge(state.backend.dispatcher && state.backend.callback) + '</div></div></section>';
  }
  return '<section class="chat-view"><div class="chat-feed" id="chat-feed">' +
    (state.messages.length ? state.messages.map(renderMessage).join("") : '<div class="welcome-card"><div class="welcome-spark">' + icon("spark", 26) + '</div><div class="view-kicker">PRIVATE TEAM ROOM</div><h2>مرحبًا بك في غرفة الفريق</h2><p>اكتب هدفك أو المهمة التي تريد تنفيذها، وسيتعاون الوكلاء المتخصصون ثم يجمع Project Lead خلاصة الفريق في رد واحد.</p><div class="welcome-prompts"><button type="button" class="prompt-chip" data-prompt="راجع بنية UTILORA الحالية وحدد أعلى ثلاث أولويات تقنية.">راجع بنية المشروع وحدد الأولويات</button><button type="button" class="prompt-chip" data-prompt="افحص تجربة المستخدم في أدوات PDF واقترح تحسينات قابلة للتنفيذ.">قيّم تجربة أدوات PDF</button><button type="button" class="prompt-chip" data-prompt="نفّذ تدقيقًا أمنيًا للواجهة والخلفية وحدد المخاطر.">اطلب تدقيقًا أمنيًا</button></div></div>') +
    '</div><div class="composer-wrap"><div class="composer" id="composer"><textarea id="message-input" rows="1" placeholder="اكتب رسالتك إلى فريق UTILORA…" aria-label="رسالتك إلى الفريق"></textarea><div class="composer-tools"><div class="composer-hint">' + icon("lock", 14) + '<span>محادثة خاصة — لا تظهر للزوار</span></div><button class="send-button" id="send-button" type="button" aria-label="إرسال الرسالة">' + icon("send", 18) + '<span>إرسال للفريق</span></button></div></div><div class="composer-foot">الضغط على Enter للإرسال · Shift + Enter لسطر جديد</div></div></section>';
}

function render() {
  const previousFeed = $("#chat-feed");
  const keepFeedAtBottom = !previousFeed || previousFeed.scrollHeight - previousFeed.scrollTop - previousFeed.clientHeight < 120;
  const previousFeedScrollTop = previousFeed?.scrollTop || 0;
  const activeLabel = state.view === "chat" ? "غرفة الفريق" : state.view === "agents" ? "الوكلاء" : state.view === "activity" ? "سجل النشاط" : "الأمان والخصوصية";
  const dbReady = state.backend.database;
  const dispatchReady = state.backend.dispatcher;
  $("#app").innerHTML = '<div class="studio-shell">' +
    '<aside class="sidebar"><div class="brand"><div class="brand-mark">U</div><div><div class="brand-name">UTILORA</div><div class="brand-sub">AGENT STUDIO</div></div></div>' +
    '<div class="private-label">' + icon("lock", 13) + '<span>مساحة خاصة</span><i></i></div>' +
    '<div class="nav-label">WORKSPACE</div><nav class="side-nav">' +
    navButton("chat", "غرفة الفريق") + navButton("agents", "الوكلاء") + navButton("activity", "سجل النشاط") +
    '</nav><div class="nav-label security-nav-label">CONTROL</div><nav class="side-nav">' + navButton("security", "الأمان والخصوصية") + '</nav>' +
    '<div class="sidebar-bottom"><div class="owner-card"><div class="owner-avatar">A</div><div><strong>Owner</strong><span>مالك مساحة UTILORA</span></div><span class="owner-dot"></span></div><div class="version">PRIVATE WORKSPACE <span>·</span> v0.1</div></div></aside>' +
    '<main class="main-panel"><header class="topbar"><div class="topbar-title"><div class="mobile-mark">U</div><div><div class="breadcrumb">UTILORA <span>/</span> ' + escapeHtml(activeLabel) + '</div><h1>' + escapeHtml(activeLabel) + '</h1></div></div><div class="topbar-actions"><div class="connection-pill ' + (dbReady ? "is-online" : "is-pending") + '"><span></span>' + (dbReady ? "قاعدة البيانات متصلة" : "بانتظار ربط الخادم") + '</div><div class="avatar-small">A</div></div></header>' +
    '<div class="main-content">' +
    (state.error ? '<div class="alert-banner" role="alert">' + escapeHtml(state.error) + '<button type="button" id="dismiss-error" aria-label="إغلاق">×</button></div>' : "") +
    (state.view === "chat" ? '<div class="room-banner"><div class="room-banner-icon">' + icon("lock", 18) + '</div><div class="room-banner-copy"><strong>غرفة UTILORA الخاصة</strong><span>' + escapeHtml(state.latestRun?.stage || "جاهزون لاستقبال المهمة") + '</span><div class="room-progress"><i style="width:' + Math.max(0, Math.min(100, Number(state.latestRun?.progress) || 0)) + '%"></i></div></div><div class="room-banner-status"><span></span>' + (state.latestRun?.status === "running" ? "قيد التنفيذ" : state.latestRun?.status === "completed" ? "مكتملة" : state.latestRun?.status === "failed" ? "تحتاج مراجعة" : "خاصة") + '</div></div>' : "") +
    viewContent() +
    '</div></main>' +
    '<aside class="team-panel"><div class="team-panel-head"><div><div class="view-kicker">YOUR AI TEAM</div><h2>فريق العمل</h2></div><span class="team-count">08</span></div><div class="team-summary"><div class="summary-number">' + state.agents.filter((a) => a.status === "running").length + '<small>/ 8</small></div><div><strong>وكلاء نشطون</strong><span>حالة الاتصال الحالية</span></div></div><div class="team-list">' + state.agents.map(renderAgent).join("") + '</div><div class="team-footer"><div class="footer-line"><span></span></div><p>' + (dispatchReady ? "محرك تشغيل الفريق متصل" : "ربط محرك التشغيل لم يكتمل بعد") + '</p><button class="refresh-button" id="refresh-button" type="button">' + icon("refresh", 15) + ' تحديث الحالة</button></div></aside>' +
    '</div>';
  bindEvents();
  const nextFeed = $("#chat-feed");
  if (nextFeed) {
    nextFeed.scrollTop = keepFeedAtBottom
      ? nextFeed.scrollHeight
      : Math.min(previousFeedScrollTop, Math.max(0, nextFeed.scrollHeight - nextFeed.clientHeight));
  }
}

function navButton(view, label) {
  return '<button type="button" class="nav-item ' + (state.view === view ? "active" : "") + '" data-view="' + view + '">' + icon(view === "security" ? "shield" : view) + '<span>' + label + '</span>' + (state.view === view ? '<span class="nav-active-dot"></span>' : "") + '</button>';
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => { state.view = button.dataset.view; state.error = ""; render(); });
  });
  $("#dismiss-error")?.addEventListener("click", () => { state.error = ""; render(); });
  $("#refresh-button")?.addEventListener("click", loadStatus);
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = $("#message-input");
      if (input) { input.value = button.dataset.prompt; input.focus(); }
    });
  });
  $("#send-button")?.addEventListener("click", sendMessage);
  $("#message-input")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); }
  });
  $("#message-input")?.addEventListener("input", (event) => {
    event.target.style.height = "auto";
    event.target.style.height = Math.min(event.target.scrollHeight, 160) + "px";
  });
  document.querySelectorAll("[data-agent]").forEach((button) => {
    button.addEventListener("click", () => {
      const agent = state.agents.find((item) => item.id === button.dataset.agent);
      if (agent) {
        state.error = agent.name + " — " + agent.model + " · " + agent.statusText;
        render();
      }
    });
  });
}

async function loadStatus(options = {}) {
  const silent = Boolean(options.silent);
  const currentInput = $("#message-input");
  const inputValue = currentInput?.value ?? "";
  const hadFocus = Boolean(currentInput && document.activeElement === currentInput);
  const selectionStart = currentInput?.selectionStart ?? inputValue.length;
  const selectionEnd = currentInput?.selectionEnd ?? inputValue.length;
  const button = $("#refresh-button");
  if (button) { button.disabled = true; button.classList.add("spinning"); }
  try {
    const response = await fetch("/api/status", { credentials: "same-origin", headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("تعذّر التحقق من حالة الخادم.");
    const data = await response.json();
    state.backend = {
      database: Boolean(data.integrations?.database),
      dispatcher: Boolean(data.integrations?.dispatcher),
      callback: Boolean(data.integrations?.callback)
    };
    state.latestRun = data.run || null;
    state.events = Array.isArray(data.events) ? data.events : [];
    if (Array.isArray(data.agents)) {
      for (const item of data.agents) {
        const agent = state.agents.find((entry) => entry.id === item.agent_id);
        if (agent) Object.assign(agent, {
          status: item.status || agent.status,
          statusText: item.status_text || item.statusText || agent.statusText,
          progress: Number(item.progress) || 0,
          response: item.response || null,
          error: item.error || null
        });
      }
    }
    state.error = "";
    if (state.backend.database) await loadHistory();
  } catch (error) {
    if (!silent) state.error = error.message || "تعذّر الاتصال بالخادم.";
  } finally {
    if (button) { button.disabled = false; button.classList.remove("spinning"); }
    render();
    const nextInput = $("#message-input");
    if (nextInput && inputValue) {
      nextInput.value = inputValue;
      nextInput.style.height = "auto";
      nextInput.style.height = Math.min(nextInput.scrollHeight, 160) + "px";
    }
    if (nextInput && hadFocus) {
      nextInput.focus();
      try { nextInput.setSelectionRange(selectionStart, selectionEnd); } catch { /* Ignore unsupported selection. */ }
    }
  }
}

async function loadHistory() {
  const response = await fetch("/api/chat?room=" + encodeURIComponent(state.room), {
    credentials: "same-origin", headers: { accept: "application/json" }
  });
  if (!response.ok) throw new Error("قاعدة البيانات لم تُرجع سجل المحادثة.");
  const data = await response.json();
  state.messages = Array.isArray(data.messages) ? data.messages : [];
  state.latestRun = Array.isArray(data.runs) ? (data.runs[0] || state.latestRun) : state.latestRun;
  state.events = Array.isArray(data.events) ? data.events : state.events;
  if (Array.isArray(data.agents)) {
    for (const item of data.agents) {
      const agent = state.agents.find((entry) => entry.id === item.agent_id);
      if (agent) Object.assign(agent, {
        status: item.status || agent.status,
        statusText: item.status_text || item.statusText || agent.statusText,
        progress: Number(item.progress) || 0,
        response: item.response || null,
        error: item.error || null
      });
    }
  }
}

async function sendMessage() {
  const input = $("#message-input");
  const content = input?.value?.trim();
  if (!content || state.sending) return;
  state.sending = true;
  const button = $("#send-button");
  if (button) { button.disabled = true; button.innerHTML = '<span class="spinner"></span><span>جارٍ الإرسال…</span>'; }
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ room: state.room, content })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "تعذّر إرسال المهمة إلى الفريق.");
    input.value = "";
    state.messages = Array.isArray(data.messages) ? data.messages : [...state.messages, data.message].filter(Boolean);
    state.error = "";
    render();
  } catch (error) {
    state.error = error.message || "فشل إرسال الرسالة.";
    render();
  } finally {
    state.sending = false;
    const nextButton = $("#send-button");
    if (nextButton) nextButton.disabled = false;
    loadStatus({ silent: true });
  }
}

async function boot() {
  render();
  await loadStatus();
  state.loading = false;
  window.setInterval(() => {
    if (document.visibilityState === "visible" && !state.sending) {
      loadStatus({ silent: true });
    }
  }, 7000);
}

boot();
