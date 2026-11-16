// 入力欄や結果表示に使うHTML要素を取得します。
const fortuneForm = document.getElementById("fortuneForm");
const resultSection = document.getElementById("resultSection");
const scoreRing = document.getElementById("scoreRing");
const scoreValue = document.getElementById("scoreValue");
const elementPair = document.getElementById("elementPair");
const readingTitle = document.getElementById("readingTitle");
const readingMessage = document.getElementById("readingMessage");
const traitsList = document.getElementById("traitsList");
const storageKey = "app07-four-pillars-pairing";
const { createProfile, createPersonalReading, calculateCompatibility } = window.FourPillars;

// 保存済みデータがあれば、読み込み直した画面に戻します。
let savedState = null;
try {
  const savedText = localStorage.getItem(storageKey);
  savedState = savedText ? JSON.parse(savedText) : null;
} catch (error) {
  savedState = null;
}

// 今日より後の日付を選べないように設定します。
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
document.getElementById("birthdayOne").max = localToday;
document.getElementById("birthdayTwo").max = localToday;

// 登録済みの本人情報があれば、ひとり目の欄に入れます。
let registeredProfile = null;
try {
  registeredProfile = JSON.parse(localStorage.getItem("app07-profile"));
  if (registeredProfile) {
    document.getElementById("nameOne").value = registeredProfile.name || "";
    document.getElementById("birthdayOne").value = registeredProfile.birthday || "";
    document.getElementById("timeOne").value = registeredProfile.birthTime || "";
  }
} catch (error) {
  // 保存データが読めない場合は、空欄のまま入力できます。
}

// 占い結果を画面へ表示します。
function renderResult(result) {
  scoreValue.textContent = String(result.compatibility.score);
  scoreRing.style.setProperty("--score-angle", `${result.compatibility.score * 3.6}deg`);
  scoreRing.setAttribute("aria-label", `相性スコア ${result.compatibility.score}点`);
  elementPair.textContent = result.compatibility.elementPair;
  readingTitle.textContent = result.compatibility.title;
  readingMessage.textContent = result.compatibility.message;
  renderProfile(result.first, "One");
  renderProfile(result.second, "Two");
  renderTraits(result.compatibility.traits);
  resultSection.hidden = false;
}

// 命式メモに、日主と計算できた柱を並べます。
function renderProfile(profile, suffix) {
  document.getElementById(`outputName${suffix}`).textContent = profile.name;
  document.getElementById(`dayMaster${suffix}`).innerHTML = "";

  const dayMasterLabel = document.createElement("span");
  dayMasterLabel.textContent = "日主：";
  const dayMasterValue = document.createElement("strong");
  dayMasterValue.textContent = `${profile.dayStem}（${profile.dayElement}）`;
  document.getElementById(`dayMaster${suffix}`).append(dayMasterLabel, dayMasterValue);
  document.getElementById(`personalReading${suffix}`).textContent = profile.reading || createPersonalReading(profile);

  const pillarList = document.getElementById(`pillars${suffix}`);
  pillarList.innerHTML = "";
  Object.values(profile.pillars).forEach((pillar) => {
    const chip = document.createElement("span");
    chip.className = "pillar-chip";
    const label = document.createElement("small");
    label.textContent = pillar.label;
    const value = document.createElement("strong");
    value.textContent = pillar.text;
    chip.append(label, value);
    pillarList.appendChild(chip);
  });
}

// 3つの相性ポイントを、数値とバーで表示します。
function renderTraits(traits) {
  traitsList.innerHTML = "";
  traits.forEach((trait) => {
    const item = document.createElement("div");
    item.className = "trait-item";

    const label = document.createElement("div");
    label.className = "trait-label";
    const name = document.createElement("span");
    name.textContent = trait.name;
    const value = document.createElement("strong");
    value.textContent = `${trait.value}%`;
    label.append(name, value);

    const track = document.createElement("div");
    track.className = "trait-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `${trait.name}の相性`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(trait.value));
    const fill = document.createElement("span");
    fill.className = "trait-fill";
    fill.style.width = `${trait.value}%`;
    track.appendChild(fill);
    item.append(label, track);
    traitsList.appendChild(item);
  });
}

// 「占う」ボタンを押したら、結果を計算して保存します。
fortuneForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const first = createProfile(
    document.getElementById("nameOne").value,
    document.getElementById("birthdayOne").value,
    document.getElementById("timeOne").value
  );
  const second = createProfile(
    document.getElementById("nameTwo").value,
    document.getElementById("birthdayTwo").value,
    document.getElementById("timeTwo").value
  );
  const result = {
    first,
    second,
    compatibility: calculateCompatibility(first, second)
  };

  // 入力内容と結果を、ブラウザーの中に保存します。
  localStorage.setItem(storageKey, JSON.stringify({
    inputs: {
      nameOne: first.name,
      birthdayOne: first.birthday,
      timeOne: document.getElementById("timeOne").value,
      nameTwo: second.name,
      birthdayTwo: second.birthday,
      timeTwo: document.getElementById("timeTwo").value
    },
    result
  }));
  renderResult(result);
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

// クリアボタンで、入力・保存内容・結果を消します。
document.getElementById("clearButton").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  fortuneForm.reset();
  resultSection.hidden = true;
});

// 保存内容を入力欄と結果表示に戻します。
if (savedState && savedState.inputs && savedState.result) {
  Object.entries(savedState.inputs).forEach(([id, value]) => {
    if (registeredProfile && ["nameOne", "birthdayOne", "timeOne"].includes(id)) {
      return;
    }
    const input = document.getElementById(id);
    if (input) {
      input.value = value;
    }
  });

  const savedPairMatchesProfile = !registeredProfile || (
    savedState.inputs.nameOne === registeredProfile.name
    && savedState.inputs.birthdayOne === registeredProfile.birthday
    && (savedState.inputs.timeOne || "") === (registeredProfile.birthTime || "")
  );
  if (savedPairMatchesProfile) {
    renderResult(savedState.result);
  }
}
