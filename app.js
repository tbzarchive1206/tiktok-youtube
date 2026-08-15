const VIDEOS = Array.isArray(window.TIKTOK_ARCHIVE_DATA?.videos) ? window.TIKTOK_ARCHIVE_DATA.videos : [];
const PAGE_SIZE = 16;
const ACCOUNTS = ["istent_theboyz", "theboyz_officl", "jakeybaee2", "kebean.moon", "eric.sohn22"];

const COPY = {
  videos: "VIDEOS",
  accounts: "ACCOUNTS",
  years: "YEARS",
  mainPage: "MAIN PAGE",
  filters: "FILTERS",
  account: "ACCOUNT",
  member: "MEMBER",
  year: "YEAR",
  sort: "SORT",
  allAccounts: "ALL ACCOUNTS",
  allMembers: "ALL MEMBERS",
  allYears: "ALL YEARS",
  newest: "NEWEST FIRST",
  oldest: "OLDEST FIRST",
  reset: "RESET",
  empty: "TRY CHANGING THE FILTERS.",
  loadMore: "LOAD MORE ↓",
  original: "Original on TikTok →",
  download: "Download from Google Drive ↓",
  youtubeMissing: "YouTube upload pending",
  mainArchive: "MAIN ARCHIVE",
  backTop: "BACK TO TOP",
  results: "VIDEOS"
};

const MEMBER_OPTIONS = [
  { value: "Sangyeon", aliases: ["sangyeon", "상연"] },
  { value: "Jacob", aliases: ["jacob", "제이콥"] },
  { value: "Younghoon", aliases: ["younghoon", "영훈"] },
  { value: "Hyunjae", aliases: ["hyunjae", "현재"] },
  { value: "Juyeon", aliases: ["juyeon", "주연"] },
  { value: "Kevin", aliases: ["kevin", "케빈"] },
  { value: "Q", aliases: ["q", "changmin", "창민", "큐"], contentAliases: ["changmin", "창민", "큐"], hashtagAliases: ["q", "changmin"] },
  { value: "Sunwoo", aliases: ["sunwoo", "선우"] },
  { value: "Eric", aliases: ["eric", "에릭"] },
  { value: "Hwall", aliases: ["hwall", "hyunjun", "hur hyunjun", "활", "허현준", "현준"] },
  { value: "Haknyeon", aliases: ["haknyeon", "ju haknyeon", "학년", "주학년"] },
  { value: "New", aliases: ["new", "chanhee", "choi chanhee", "뉴", "찬희", "최찬희"], contentAliases: ["chanhee", "choi chanhee", "뉴", "찬희", "최찬희"], hashtagAliases: ["new", "chanhee"] }
];

const state = { account: "all", member: "all", year: "all", sort: "newest", shown: PAGE_SIZE };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const cleanAccount = (value) => String(value || "").replace(/^@/, "").trim();
const members = (value) => Array.isArray(value) ? value.map(String) : String(value || "").split(/[,;/|]+/).map((item) => item.trim()).filter(Boolean);
const normalizeWords = (value) => ` ${String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;

function youtubeId(url) {
  const source = String(url || "").trim();
  if (!source) return "";
  const patterns = [
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/i,
    /youtu\.be\/([A-Za-z0-9_-]{11})/i,
    /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/i
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[1];
  }
  return /^[A-Za-z0-9_-]{11}$/.test(source) ? source : "";
}

function youtubeEmbed(video) {
  const id = youtubeId(video.youtubeUrl);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` : "";
}

function compactDate(video) {
  const source = String(video.dateCode || String(video.date || "").replaceAll("-", "").slice(-6));
  return /^\d{6}$/.test(source) ? source : "------";
}

function chronology(video) {
  return `${String(video.date || "").replaceAll("-", "")}|${video.tiktokId || ""}`;
}

function title(video) {
  return `${compactDate(video)} ${String(video.description || "").replace(/\s+/g, " ").trim()}`.trim();
}

function driveDownload(url) {
  const source = String(url || "").trim();
  if (!source) return "";
  const match = source.match(/\/d\/([A-Za-z0-9_-]+)/) || source.match(/[?&]id=([A-Za-z0-9_-]+)/);
  return match ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(match[1])}` : source;
}

function containsAlias(text, aliases) {
  const normalizedText = normalizeWords(text);
  return aliases.some((alias) => normalizedText.includes(normalizeWords(alias)));
}

function hasHashtag(text, aliases) {
  const hashtags = [...String(text || "").matchAll(/#([\p{L}\p{N}_-]+)/gu)].map((match) => normalizeWords(match[1]));
  return aliases.some((alias) => hashtags.includes(normalizeWords(alias)));
}

function memberMatches(video, selectedMember) {
  if (selectedMember === "all") return true;
  const option = MEMBER_OPTIONS.find((member) => member.value === selectedMember);
  if (!option) return false;

  const explicitMembers = members(video.members);
  if (explicitMembers.some((member) => /^all members$/i.test(member))) return true;
  if (explicitMembers.some((member) => containsAlias(member, option.aliases))) return true;

  const content = `${video.description || ""} ${video.hashtags || ""}`;
  const contentAliases = option.contentAliases || option.aliases;
  return containsAlias(content, contentAliases) || hasHashtag(video.hashtags, option.hashtagAliases || []);
}

function filtered() {
  const list = VIDEOS.filter((video) =>
    (state.account === "all" || cleanAccount(video.account) === state.account)
    && memberMatches(video, state.member)
    && (state.year === "all" || String(video.year) === state.year)
  );
  return [...list].sort((a, b) => {
    const comparison = chronology(a).localeCompare(chronology(b));
    return state.sort === "oldest" ? comparison : -comparison;
  });
}

function headerStats() {
  const years = VIDEOS.map((video) => Number(video.year)).filter(Boolean);
  $("#totalVideos").textContent = VIDEOS.length.toLocaleString("en-US");
  $("#totalAccounts").textContent = String(new Set(VIDEOS.map((video) => cleanAccount(video.account)).filter(Boolean)).size || ACCOUNTS.length).padStart(2, "0");
  if (years.length) $("#yearRange").textContent = `${Math.min(...years)}—${Math.max(...years)}`;
}

function filterSummary() {
  const active = [];
  if (state.account !== "all") active.push(`@${state.account}`);
  if (state.member !== "all") active.push(MEMBER_OPTIONS.find((member) => member.value === state.member)?.value || state.member);
  if (state.year !== "all") active.push(state.year);
  return active.join(" / ");
}

function render() {
  const list = filtered();
  const visible = list.slice(0, state.shown);
  $("#resultsLabel").textContent = `${list.length.toLocaleString("en-US")} ${COPY.results}`;
  $("#activeFilters").textContent = filterSummary();
  $("#videoGrid").innerHTML = visible.map((video) => {
    const embed = youtubeEmbed(video);
    const fullTitle = title(video);
    const download = driveDownload(video.driveUrl);
    const tiktok = String(video.tiktokUrl || "").trim();
    return `<article class="video-card">
      <div class="video-embed">${embed ? `<iframe src="${esc(embed)}" title="${esc(fullTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<div class="video-unavailable">${esc(COPY.youtubeMissing)}</div>`}</div>
      <div class="video-info"><div class="eyebrow">@${esc(cleanAccount(video.account))}</div><h2 title="${esc(fullTitle)}">${esc(fullTitle)}</h2><div class="video-links">${tiktok ? `<a href="${esc(tiktok)}" target="_blank" rel="noopener noreferrer">${esc(COPY.original)}</a>` : ""}${download ? `<a href="${esc(download)}" target="_blank" rel="noopener noreferrer">${esc(COPY.download)}</a>` : ""}</div></div>
    </article>`;
  }).join("");
  $("#empty").hidden = list.length > 0;
  $("#loadMore").hidden = state.shown >= list.length;
  $("#loadMore").textContent = COPY.loadMore;
}

function applyEnglishInterface() {
  document.documentElement.lang = "en";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    if (COPY[element.dataset.i18n]) element.textContent = COPY[element.dataset.i18n];
  });
}

function resetPage() {
  state.shown = PAGE_SIZE;
  render();
}

$("#accountFilter").addEventListener("change", (event) => { state.account = event.target.value; resetPage(); });
$("#memberFilter").addEventListener("change", (event) => { state.member = event.target.value; resetPage(); });
$("#yearFilter").addEventListener("change", (event) => { state.year = event.target.value; resetPage(); });
$("#sortFilter").addEventListener("change", (event) => { state.sort = event.target.value; resetPage(); });
$("#resetFilters").addEventListener("click", () => {
  Object.assign(state, { account: "all", member: "all", year: "all", sort: "newest", shown: PAGE_SIZE });
  $("#accountFilter").value = "all";
  $("#memberFilter").value = "all";
  $("#yearFilter").value = "all";
  $("#sortFilter").value = "newest";
  render();
});
$("#loadMore").addEventListener("click", () => { state.shown += PAGE_SIZE; render(); });

applyEnglishInterface();
headerStats();
render();
