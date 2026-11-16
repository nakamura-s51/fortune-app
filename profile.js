// 登録ページの入力欄を取得します。
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileBirthday = document.getElementById("profileBirthday");
const profileTime = document.getElementById("profileTime");
const saveMessage = document.getElementById("saveMessage");
const profileStorageKey = "app07-profile";

// 今日より後の日付は選べないようにします。
const now = new Date();
const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
profileBirthday.max = localToday;

// 以前に登録した内容があれば、入力欄へ戻します。
try {
  const savedProfile = JSON.parse(localStorage.getItem(profileStorageKey));
  if (savedProfile) {
    profileName.value = savedProfile.name || "";
    profileBirthday.value = savedProfile.birthday || "";
    profileTime.value = savedProfile.birthTime || "";
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
});

// 登録を消すボタンで、入力内容と保存データを消します。
document.getElementById("deleteProfile").addEventListener("click", () => {
  localStorage.removeItem(profileStorageKey);
  profileForm.reset();
  saveMessage.textContent = "プロフィールを削除しました。";
});