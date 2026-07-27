const form = document.querySelector('#briefForm');
const fields = {
  projectName: document.querySelector('#projectName'),
  clientName: document.querySelector('#clientName'),
  projectType: document.querySelector('#projectType'),
  projectGoal: document.querySelector('#projectGoal'),
  pageCount: document.querySelector('#pageCount'),
  timeline: document.querySelector('#timeline'),
};

const typeProfiles = {
  landing: { label: 'Landing page', base: 680, stack: 'Web', flow: 'Conversion', risk: 'Focused' },
  website: { label: 'Business site', base: 980, stack: 'Web', flow: 'Content', risk: 'Balanced' },
  portfolio: { label: 'Portfolio', base: 850, stack: 'Visual', flow: 'Showcase', risk: 'Focused' },
  dashboard: { label: 'Dashboard', base: 1650, stack: 'App', flow: 'Data flow', risk: 'Elevated' },
  store: { label: 'E-commerce', base: 1450, stack: 'Commerce', flow: 'Checkout', risk: 'Elevated' },
};

const featureCosts = {
  'Strategy workshop': 150,
  'Responsive design': 240,
  'CMS or content setup': 280,
  'Booking or contact flow': 210,
  'Analytics setup': 130,
  'Custom integrations': 440,
};

const timelineLabels = {
  flexible: ['6–8 wk', 'Flexible cadence'],
  standard: ['4–6 wk', 'Standard cadence'],
  fast: ['2–3 wk', 'Focused delivery'],
  urgent: ['1–2 wk', 'Priority delivery'],
};

const readState = () => ({
  projectName: fields.projectName.value.trim(),
  clientName: fields.clientName.value.trim(),
  projectType: fields.projectType.value,
  projectGoal: fields.projectGoal.value.trim(),
  pageCount: Math.max(1, Math.min(24, Number(fields.pageCount.value) || 1)),
  timeline: fields.timeline.value,
  features: [...document.querySelectorAll('.feature-option input:checked')].map((input) => input.value),
});

const calculate = (state) => {
  const profile = typeProfiles[state.projectType];
  const featureCost = state.features.reduce((sum, feature) => sum + featureCosts[feature], 0);
  const pageCost = Math.max(0, state.pageCount - 1) * 115;
  const timelineMultiplier = state.timeline === 'urgent' ? 1.28 : state.timeline === 'fast' ? 1.15 : state.timeline === 'flexible' ? 0.94 : 1;
  const total = Math.round((profile.base + featureCost + pageCost) * timelineMultiplier / 10) * 10;
  const score = Math.min(96, Math.round(23 + state.pageCount * 4 + state.features.length * 7 + (state.projectType === 'dashboard' ? 15 : 0) + (state.projectType === 'store' ? 11 : 0)));
  const risk = score > 72 ? 'Elevated' : score > 51 ? 'Balanced' : 'Focused';
  const decisions = Math.max(2, state.features.length + Math.ceil(state.pageCount / 3));
  return { profile, total, score, risk, decisions };
};

const formatCurrency = (amount) => {
  const low = Math.round(amount * 0.92 / 10) * 10;
  const high = Math.round(amount * 1.14 / 10) * 10;
  const compact = (value) => value >= 1000 ? `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `$${value}`;
  return `${compact(low)}–${compact(high)}`;
};

const render = () => {
  const state = readState();
  const result = calculate(state);
  const title = state.projectName || `${result.profile.label} proposal`;
  const client = state.clientName ? ` for ${state.clientName}` : '';
  const outcome = state.projectGoal || `A focused ${result.profile.label.toLowerCase()} designed to create a clear, useful first experience${client}.`;
  const [delivery, deliveryDetail] = timelineLabels[state.timeline];

  document.querySelector('#complexityScore').textContent = result.score;
  document.querySelector('#mapProjectName').textContent = state.projectName || 'Project';
  document.querySelector('#mapPages').textContent = String(state.pageCount).padStart(2, '0');
  document.querySelector('#mapFlow').textContent = result.profile.flow;
  document.querySelector('#mapStack').textContent = result.profile.stack;
  document.querySelector('#deliveryMetric').textContent = delivery;
  document.querySelector('#deliveryDetail').textContent = deliveryDetail;
  document.querySelector('#budgetMetric').textContent = formatCurrency(result.total);
  document.querySelector('#budgetDetail').textContent = `${state.pageCount} pages · ${state.features.length} additions`;
  document.querySelector('#riskMetric').textContent = result.risk;
  document.querySelector('#riskDetail').textContent = `${result.decisions} key decisions`;
  document.querySelector('#meterFill').style.width = `${result.score}%`;
  document.querySelector('#meterLabel').textContent = result.risk;
  document.querySelector('#proposalTitle').textContent = title;
  document.querySelector('#proposalOutcome').textContent = outcome;

  const scope = state.features.length ? state.features : ['Responsive design'];
  document.querySelector('#proposalScope').innerHTML = [
    `${state.pageCount} core page${state.pageCount === 1 ? '' : 's'}`,
    ...scope,
  ].map((item) => `<li>${item}</li>`).join('');

  const timeline = [
    'Discovery & direction',
    `Design & build (${delivery})`,
    result.risk === 'Elevated' ? 'Integration review & launch' : 'Review & launch',
  ];
  document.querySelector('#proposalTimeline').innerHTML = timeline.map((item) => `<li>${item}</li>`).join('');
  document.querySelector('#updatedAt').textContent = `Updated ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date())}`;
  document.querySelector('#draftStatus').textContent = 'Live';
};

const buildMarkdown = () => {
  const state = readState();
  const result = calculate(state);
  const [delivery] = timelineLabels[state.timeline];
  return `# ${state.projectName || 'Project Proposal'}\n\n## Client\n${state.clientName || 'Not specified'}\n\n## Outcome\n${state.projectGoal || 'A focused web experience designed around the client’s primary goal.'}\n\n## Scope\n- ${state.pageCount} core page${state.pageCount === 1 ? '' : 's'}\n${state.features.map((feature) => `- ${feature}`).join('\n')}\n\n## Delivery\n${delivery}\n\n## Estimated investment\n${formatCurrency(result.total)}\n\n## Project type\n${result.profile.label}\n\n---\nPrepared with AOTLoom\n`;
};

let toastTimer;
const toast = (message) => {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2600);
};

const saveDraft = () => {
  localStorage.setItem('aotloom-draft', JSON.stringify(readState()));
  document.querySelector('#draftStatus').textContent = 'Saved';
  toast('Draft saved in this browser');
};

const loadDraft = () => {
  try {
    const draft = JSON.parse(localStorage.getItem('aotloom-draft'));
    if (!draft) return;
    Object.entries(fields).forEach(([key, input]) => { if (draft[key] !== undefined) input.value = draft[key]; });
    document.querySelectorAll('.feature-option input').forEach((input) => { input.checked = draft.features?.includes(input.value); });
  } catch { /* The app remains usable even if browser storage is unavailable. */ }
};

const loadSample = () => {
  fields.projectName.value = 'Melo Studio Launch';
  fields.clientName.value = 'Melo Coffee';
  fields.projectType.value = 'website';
  fields.projectGoal.value = 'Create a warm, conversion-focused website that helps a neighbourhood coffee brand tell its story and capture wholesale enquiries.';
  fields.pageCount.value = '6';
  fields.timeline.value = 'standard';
  const enabled = ['Strategy workshop', 'Responsive design', 'CMS or content setup', 'Booking or contact flow', 'Analytics setup'];
  document.querySelectorAll('.feature-option input').forEach((input) => { input.checked = enabled.includes(input.value); });
  render();
  toast('Sample proposal loaded');
};

form.addEventListener('input', render);
form.addEventListener('change', render);
document.querySelector('#saveDraftButton').addEventListener('click', saveDraft);
document.querySelector('#loadSampleButton').addEventListener('click', loadSample);
document.querySelector('#copyButton').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(buildMarkdown()); toast('Proposal copied to clipboard'); } catch { toast('Copy is unavailable in this browser'); }
});
document.querySelector('#exportButton').addEventListener('click', () => {
  const file = new Blob([buildMarkdown()], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = `${(fields.projectName.value || 'aotloom-proposal').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Markdown proposal exported');
});
document.querySelector('#printButton').addEventListener('click', () => window.print());
loadDraft();
render();
