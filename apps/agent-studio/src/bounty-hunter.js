const state = { loading: false, data: null, error: "", filter: "all", selected: null };

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const FILTERS = [
  ["all", "الكل"],
  ["coding", "البرمجة"],
  ["ai-work", "مهام AI"],
  ["security", "الأمن"],
  ["ai-security", "أمن AI"],
  ["web3-security", "Web3"]
];

function eligibilityLabel(status) {
  return ({
    conditional: "أهلية مشروطة",
    verify: "تحتاج تحقق",
    "age-blocked": "غير متاحة حالياً بسبب العمر"
  })[status] || "غير محسومة";
}

function sourceCard(source) {
  return '<article class="bh-source-card">' +
    '<div class="bh-source-top"><span class="bh-source-type">' + esc(source.category.replaceAll("-", " ")) + '</span><span class="bh-eligibility ' + esc(source.eligibility) + '">' + esc(eligibilityLabel(source.eligibility)) + '</span></div>' +
    '<h3>' + esc(source.name) + '</h3><div class="bh-reward">' + esc(source.reward) + '</div>' +
    '<dl class="bh-source-details"><div><dt>العمر</dt><dd>' + esc(source.age) + '</dd></div><div><dt>الجزائر</dt><dd>' + esc(source.country) + '</dd></div><div><dt>الدفع</dt><dd>' + esc(source.payout) + '</dd></div><div><dt>استخدام الوكلاء</dt><dd>' + esc(source.automation) + '</dd></div></dl>' +
    '<p class="bh-note">' + esc(source.note) + '</p><a class="bh-link" href="' + esc(source.url) + '" target="_blank" rel="noopener noreferrer">القواعد الرسمية ↗</a>' +
    '</article>';
}

function opportunityCard(item) {
  return '<article class="bh-opportunity-card"><div class="bh-opportunity-meta"><span>' + esc(item.repository || "GitHub") + '</span><span class="bh-unverified">فرصة غير مؤكدة التمويل</span></div>' +
    '<h3>' + esc(item.title) + '</h3><p>' + esc(item.body || "لا يوجد وصف متاح.") + '</p>' +
    '<div class="bh-opportunity-foot"><span>' + (item.rewardMention ? "ذكر مكافأة: " + esc(item.rewardMention) : "المكافأة غير مثبتة") + '</span><a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">فتح المشكلة ↗</a></div>' +
    '<button class="bh-analyze" type="button" data-analyze="' + esc(item.id) + '">إرسال للوكلاء للتحليل</button></article>';
}

function renderSources() {
  const sources = state.data?.sources || [];
  const filtered = sources.filter((source) => state.filter === "all" || source.category === state.filter);
  return filtered.length ? filtered.map(sourceCard).join("") : '<div class="bh-empty">لا توجد جهات ضمن هذا التصنيف.</div>';
}

function renderActivePrograms() {
  const programs = state.data?.activePrograms || [];
  if (!programs.length) return '<div class="bh-empty">لا توجد برامج مباشرة موثقة في هذه المراجعة.</div>';
  return programs.map((program) =>
    '<article class="bh-program-card"><div class="bh-opportunity-meta"><span>' + esc(program.category) + '</span><span class="bh-unverified">' + esc(program.status) + '</span></div>' +
    '<h3>' + esc(program.name) + '</h3><div class="bh-reward">' + esc(program.reward) + '</div>' +
    '<p>' + esc(program.payout) + '</p><p class="bh-note">' + esc(program.note) + '</p>' +
    '<a class="bh-link" href="' + esc(program.url) + '" target="_blank" rel="noopener noreferrer">قواعد البرنامج والمكافآت ↗</a></article>'
  ).join("");
}

function renderOpportunities() {
  if (state.loading && !state.data) return '<div class="bh-empty">جارٍ البحث في GitHub عن مهام ومكافآت منشورة…</div>';
  if (state.error && !state.data) return '<div class="bh-empty bh-error">' + esc(state.error) + '</div>';
  const items = state.data?.opportunities || [];
  return items.length ? items.map(opportunityCard).join("") : '<div class="bh-empty">لم يعثر البحث الحالي على مشكلات مرشحة. هذا لا يعني عدم وجود مكافآت؛ يمكن تحديث البحث لاحقاً.</div>';
}

function renderDashboard() {
  const data = state.data;
  const sources = data?.sources || [];
  const eligible = sources.filter((source) => source.eligibility === "conditional").length;
  const blocked = sources.filter((source) => source.eligibility === "age-blocked").length;
  const items = data?.opportunities || [];
  const updated = data?.generatedAt ? new Date(data.generatedAt).toLocaleString("ar-DZ") : "لم يتم التحديث بعد";
  return '<section class="info-view bounty-hunter-view">' +
    '<div class="view-kicker">AUTONOMOUS REWARD RADAR</div>' +
    '<div class="bh-heading"><div><h2>UTILORA Bounty Hunter</h2><p>رادار خاص لاكتشاف المكافآت الممولة والمهام البرمجية ومشاريع الذكاء الاصطناعي والأمن.</p></div><button class="bh-refresh" id="bh-refresh" type="button" ' + (state.loading ? "disabled" : "") + '>↻ تحديث الرادار</button></div>' +
    '<div class="bh-alert"><strong>شفافية الأهلية:</strong> أنت في الجزائر وعمرك أقل من 18 سنة. لا نرسل مهاماً ولا نعتبر أي منصة متاحة قبل التحقق من العمر والبلد ووسيلة الدفع وشروط استخدام الوكلاء. في هذه المراجعة لم نعثر على جهة تؤكد صراحةً السماح بتنفيذ المكافآت وتقديمها بواسطة وكلاء مستقلين فقط؛ لذلك لا توجد مطالبة آلية أو إرسال خارجي. لا نستخدم حساباً بهوية شخص آخر.</div>' +
    '<div class="bh-stats"><div><span>مصادر تمت مراجعتها</span><strong>' + sources.length + '</strong></div><div><span>أهلية مشروطة</span><strong>' + eligible + '</strong></div><div><span>موقوفة بسبب العمر</span><strong>' + blocked + '</strong></div><div><span>فرص GitHub المرشحة</span><strong>' + items.length + '</strong></div><div><span>برامج مكافآت مباشرة</span><strong>' + (data?.activePrograms?.length || 0) + '</strong></div></div>' +
    '<div class="bh-section-head"><div><h3>برامج مكافآت مباشرة منشورة</h3><p>صفحات برامج فعلية بمكافآت معلنة؛ ليست وعداً بأهلية الحساب أو قبول اكتشاف.</p></div></div>' +
    '<div class="bh-program-grid">' + renderActivePrograms() + '</div>' +
    '<div class="bh-section-head"><div><h3>مصادر المكافآت الرسمية</h3><p>قواعد كل جهة، العمر، الجزائر، الدفع، وسماح الأتمتة.</p></div></div>' +
    '<div class="bh-filters">' + FILTERS.map(([id, label]) => '<button type="button" data-bh-filter="' + id + '" class="' + (state.filter === id ? "active" : "") + '">' + label + '</button>').join("") + '</div>' +
    '<div class="bh-source-grid">' + renderSources() + '</div>' +
    '<div class="bh-section-head bh-live-head"><div><h3>فرص GitHub المرشحة</h3><p>' + esc(data?.discovery?.message || "لم يبدأ البحث بعد.") + '</p></div><span class="bh-updated">' + esc(updated) + '</span></div>' +
    '<div class="bh-opportunity-grid">' + renderOpportunities() + '</div>' +
    '<div class="bh-agent-rule"><strong>طريقة تشغيل الفريق</strong><p>يستطيع الوكلاء البحث والتحليل وكتابة الاختبارات وتجهيز Patch أو تقرير. لا يتم ادعاء أن المكافأة ممولة، ولا تقديم تقرير أمني أو فتح PR أو قبول شروط قانونية تلقائياً. أي إرسال خارجي أو إجراء قد ينشئ التزاماً يحتاج موافقتك الصريحة.</p></div>' +
    '</section>';
}

export function renderBountyHunter() {
  return renderDashboard();
}

async function refreshBounties() {
  state.loading = true;
  state.error = "";
  const button = document.querySelector("#bh-refresh");
  if (button) { button.disabled = true; button.textContent = "جارٍ التحديث…"; }
  try {
    const response = await fetch("/api/bounties", {
      credentials: "same-origin",
      headers: { accept: "application/json" }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "تعذّر تحديث رادار المكافآت.");
    state.data = data;
  } catch (error) {
    state.error = error?.message || "تعذّر تحديث رادار المكافآت.";
  } finally {
    state.loading = false;
    const root = document.querySelector(".bounty-hunter-view");
    if (root) {
      root.outerHTML = renderDashboard();
      bindBountyHunter();
    }
  }
}

export function bindBountyHunter({ onAnalyze } = {}) {
  document.querySelector("#bh-refresh")?.addEventListener("click", refreshBounties);
  document.querySelectorAll("[data-bh-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.bhFilter || "all";
      const root = document.querySelector(".bounty-hunter-view");
      if (root) {
        root.outerHTML = renderDashboard();
        bindBountyHunter({ onAnalyze });
      }
    });
  });
  document.querySelectorAll("[data-analyze]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = (state.data?.opportunities || []).find((entry) => String(entry.id) === button.dataset.analyze);
      if (item && typeof onAnalyze === "function") onAnalyze(item);
    });
  });
  if (!state.data && !state.loading) refreshBounties();
}
