// 保存したプロフィールと、命式を表示する要素を取得します。
const personalContent = document.getElementById("personalContent");
const emptyState = document.getElementById("emptyState");
const profileStorageKey = "app07-profile";

// 五行の短い名前を、画面に表示するために用意します。
const elementLabels = { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" };

// プロフィールがなければ、登録ページへの案内を表示します。
let savedProfile = null;
try {
  savedProfile = JSON.parse(localStorage.getItem(profileStorageKey));
} catch (error) {
  savedProfile = null;
}

if (!savedProfile || !savedProfile.name || !savedProfile.birthday) {
  emptyState.hidden = false;
} else {
  // 共通の四柱計算を使って、命式を作ります。
  const profile = window.FourPillars.createProfile(
    savedProfile.name,
    savedProfile.birthday,
    savedProfile.birthTime || ""
  );
  personalContent.hidden = false;
  document.getElementById("personalName").textContent = `${profile.name}さん`;
  document.getElementById("personalBirthday").textContent = `生年月日：${profile.birthday}`;

  const dayMaster = document.getElementById("personalDayMaster");
  dayMaster.textContent = `日主：${profile.dayStem}（${profile.dayElement}）`;
  document.getElementById("personalReading").textContent = profile.reading;
  renderPillars(profile);
  renderElementBalance(profile);
}

// 年柱・月柱・日柱と、あれば時柱を表示します。
function renderPillars(profile) {
  const pillarContainer = document.getElementById("personalPillars");
  Object.values(profile.pillars).forEach((pillar) => {
    const item = document.createElement("article");
    item.className = "personal-pillar";
    const label = document.createElement("span");
    label.className = "personal-pillar-label";
    label.textContent = pillar.label;
    const value = document.createElement("strong");
    value.textContent = pillar.text;
    const elements = document.createElement("small");
    elements.textContent = `${pillar.element}・${pillar.branchElement}`;
    item.append(label, value, elements);
    pillarContainer.appendChild(item);
  });
}

// 五行の数と割合をバーで並べます。
function renderElementBalance(profile) {
  const container = document.getElementById("elementBalance");
  const counts = window.FourPillars.getElementBalance(profile);
  const largestCount = Math.max(...Object.values(counts));

  Object.entries(counts).forEach(([element, count]) => {
    const row = document.createElement("div");
    row.className = "balance-row";
    const label = document.createElement("span");
    label.className = `balance-label element-${element}`;
    label.textContent = elementLabels[element];
    const track = document.createElement("div");
    track.className = "balance-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `${element}の五行`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(largestCount));
    track.setAttribute("aria-valuenow", String(count));
    const fill = document.createElement("span");
    fill.className = `balance-fill element-${element}`;
    fill.style.width = `${largestCount === 0 ? 0 : (count / largestCount) * 100}%`;
    track.appendChild(fill);
    const value = document.createElement("span");
    value.className = "balance-count";
    value.textContent = String(count);
    row.append(label, track, value);
    container.appendChild(row);
  });
}