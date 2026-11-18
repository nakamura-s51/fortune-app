// 登録ページの入力欄を取得します。
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileBirthday = document.getElementById("profileBirthday");
const profileTime = document.getElementById("profileTime");
const saveMessage = document.getElementById("saveMessage");
const registeredProfile = document.getElementById("registeredProfile");
const profileStorageKey = "app07-profile";
const { setupDateSelects, syncDateSelects, formatBirthday, createProfile } = window.FourPillars;

// 生年月日を「年・月・日」の3つの選択欄にします。
setupDateSelects();

// 登録している内容を、フォームの下に表示します。
function renderRegisteredProfile(profile) {
  if (!profile || !profile.name || !profile.birthday) {
    registeredProfile.hidden = true;
    return;
  }
  // 日主（生まれた日の十干）も一緒に表示します。
  const details = createProfile(profile.name, profile.birthday, profile.birthTime || "");
  document.getElementById("registeredName").textContent = `${profile.name}さん`;
  document.getElementById("registeredBirthday").textContent = formatBirthday(profile.birthday);
  document.getElementById("registeredTime").textContent = profile.birthTime || "未入力";
  document.getElementById("registeredDayMaster").textContent = `${details.dayStem}（${details.dayElement}）`;
  registeredProfile.hidden = false;
}

// 以前に登録した内容があれば、入力欄へ戻して、下にも表示します。
try {
  const savedProfile = JSON.parse(localStorage.getItem(profileStorageKey));
  if (savedProfile) {
    profileName.value = savedProfile.name || "";
    profileBirthday.value = savedProfile.birthday || "";
    profileTime.value = savedProfile.birthTime || "";
    syncDateSelects();
    renderRegisteredProfile(savedProfile);
  }
} catch (error) {
  saveMessage.textContent = "保存内容を読み込めませんでした。入力し直してください。";
}

// 登録ボタンを押したら、プロフィールをブラウザーに保存します。
profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = {
    name: profileName.value.trim(),
    birthday: profileBirthday.value,
    birthTime: profileTime.value
  };
  localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  saveMessage.textContent = `${profile.name}さんのプロフィールを保存しました。`;
  renderRegisteredProfile(profile);
});

// 登録を消すボタンで、入力内容と保存データを消します。
document.getElementById("deleteProfile").addEventListener("click", () => {
  localStorage.removeItem(profileStorageKey);
  profileForm.reset();
  saveMessage.textContent = "プロフィールを削除しました。";
  renderRegisteredProfile(null);
});
