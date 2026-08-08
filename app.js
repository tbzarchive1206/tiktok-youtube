const VIDEOS = Array.isArray(window.TIKTOK_ARCHIVE_DATA?.videos) ? window.TIKTOK_ARCHIVE_DATA.videos : [];
const PAGE_SIZE = 16;
const ACCOUNTS = ["istent_theboyz","theboyz_officl","jakeybaee2","kebean.moon","eric.sohn22"];

const copy={
  en:{videos:"VIDEOS",accounts:"ACCOUNTS",years:"YEARS",mainPage:"MAIN PAGE",filters:"FILTERS",account:"ACCOUNT",member:"MEMBER",year:"YEAR",sort:"SORT",allAccounts:"ALL ACCOUNTS",allMembers:"ALL MEMBERS",allYears:"ALL YEARS",newest:"NEWEST FIRST",oldest:"OLDEST FIRST",reset:"RESET",empty:"TRY CHANGING THE FILTERS.",loadMore:"LOAD MORE ↓",original:"Original on TikTok →",download:"Download from Google Drive ↓",youtubeMissing:"YouTube upload pending",mainArchive:"MAIN ARCHIVE",backTop:"BACK TO TOP",results:"VIDEOS"},
  ko:{videos:"영상",accounts:"계정",years:"연도",mainPage:"메인 페이지",filters:"필터",account:"계정",member:"멤버",year:"연도",sort:"정렬",allAccounts:"전체 계정",allMembers:"전체 멤버",allYears:"전체 연도",newest:"최신순",oldest:"오래된순",reset:"초기화",empty:"필터를 변경해 보세요.",loadMore:"더 보기 ↓",original:"TikTok 원본 보기 →",download:"Google Drive에서 다운로드 ↓",youtubeMissing:"YouTube 업로드 대기 중",mainArchive:"메인 아카이브",backTop:"맨 위로",results:"영상"}
};

const state={lang:localStorage.getItem("tbzTikTokLang")||"en",account:"all",member:"all",year:"all",sort:"newest",shown:PAGE_SIZE};
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cleanAccount=v=>String(v||"").replace(/^@/,"").trim();
const members=v=>Array.isArray(v)?v.map(String):String(v||"").split(/[,;/|]+/).map(x=>x.trim()).filter(Boolean);

function youtubeId(url){
  const s=String(url||"").trim(); if(!s)return "";
  const patterns=[/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,/youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/i,/youtu\.be\/([A-Za-z0-9_-]{11})/i,/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/i];
  for(const p of patterns){const m=s.match(p);if(m)return m[1]}
  return /^[A-Za-z0-9_-]{11}$/.test(s)?s:"";
}
function youtubeEmbed(video){const id=youtubeId(video.youtubeUrl);return id?`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`:""}
function compactDate(v){const s=String(v.dateCode||String(v.date||"").replaceAll("-","").slice(-6));return /^\d{6}$/.test(s)?s:"------"}
function chronology(v){return `${String(v.date||"").replaceAll("-","")}|${v.tiktokId||""}`}
function title(v){return `${compactDate(v)} ${String(v.description||"").replace(/\s+/g," ").trim()}`.trim()}
function driveDownload(url){const s=String(url||"").trim();if(!s)return"";const m=s.match(/\/d\/([A-Za-z0-9_-]+)/)||s.match(/[?&]id=([A-Za-z0-9_-]+)/);return m?`https://drive.google.com/uc?export=download&id=${encodeURIComponent(m[1])}`:s}

function filtered(){
  let list=VIDEOS.filter(v=>(state.account==="all"||cleanAccount(v.account)===state.account)&&(state.member==="all"||members(v.members).some(x=>x.toLowerCase()===state.member.toLowerCase()))&&(state.year==="all"||String(v.year)===state.year));
  return [...list].sort((a,b)=>{const c=chronology(a).localeCompare(chronology(b));return state.sort==="oldest"?c:-c});
}
function headerStats(){const ys=VIDEOS.map(v=>Number(v.year)).filter(Boolean);$("#totalVideos").textContent=VIDEOS.length.toLocaleString("en-US");$("#totalAccounts").textContent=String(new Set(VIDEOS.map(v=>cleanAccount(v.account)).filter(Boolean)).size||ACCOUNTS.length).padStart(2,"0");if(ys.length)$("#yearRange").textContent=`${Math.min(...ys)}—${Math.max(...ys)}`}
function filterSummary(){const a=[];if(state.account!=="all")a.push(`@${state.account}`);if(state.member!=="all")a.push(state.member);if(state.year!=="all")a.push(state.year);return a.join(" / ")}
function render(){
  const L=copy[state.lang], list=filtered(), visible=list.slice(0,state.shown);
  $("#resultsLabel").textContent=`${list.length.toLocaleString("en-US")} ${L.results}`; $("#activeFilters").textContent=filterSummary();
  $("#videoGrid").innerHTML=visible.map(v=>{const embed=youtubeEmbed(v),fullTitle=title(v),dl=driveDownload(v.driveUrl),tt=String(v.tiktokUrl||"").trim();return `<article class="video-card">
    <div class="video-embed">${embed?`<iframe src="${esc(embed)}" title="${esc(fullTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`:`<div class="video-unavailable">${esc(L.youtubeMissing)}</div>`}</div>
    <div class="video-info"><div class="eyebrow">@${esc(cleanAccount(v.account))}</div><h2 title="${esc(fullTitle)}">${esc(fullTitle)}</h2><div class="video-links">${tt?`<a href="${esc(tt)}" target="_blank" rel="noopener noreferrer">${esc(L.original)}</a>`:""}${dl?`<a href="${esc(dl)}" target="_blank" rel="noopener noreferrer">${esc(L.download)}</a>`:""}</div></div>
  </article>`}).join("");
  $("#empty").hidden=list.length>0;$("#loadMore").hidden=state.shown>=list.length;$("#loadMore").textContent=L.loadMore;
}
function language(){const L=copy[state.lang];document.documentElement.lang=state.lang==="ko"?"ko":"en";$("#langToggle").textContent=state.lang==="ko"?"KOR":"EN";document.querySelectorAll("[data-i18n]").forEach(el=>{if(L[el.dataset.i18n])el.textContent=L[el.dataset.i18n]});render()}
function resetPage(){state.shown=PAGE_SIZE;render()}
$("#accountFilter").addEventListener("change",e=>{state.account=e.target.value;resetPage()});
$("#memberFilter").addEventListener("change",e=>{state.member=e.target.value;resetPage()});
$("#yearFilter").addEventListener("change",e=>{state.year=e.target.value;resetPage()});
$("#sortFilter").addEventListener("change",e=>{state.sort=e.target.value;resetPage()});
$("#resetFilters").addEventListener("click",()=>{Object.assign(state,{account:"all",member:"all",year:"all",sort:"newest",shown:PAGE_SIZE});$("#accountFilter").value="all";$("#memberFilter").value="all";$("#yearFilter").value="all";$("#sortFilter").value="newest";render()});
$("#loadMore").addEventListener("click",()=>{state.shown+=PAGE_SIZE;render()});
$("#langToggle").addEventListener("click",()=>{state.lang=state.lang==="en"?"ko":"en";localStorage.setItem("tbzTikTokLang",state.lang);language()});
headerStats();language();
