// 登録済みプロフィールと、月運を表示する場所を取得します。
const monthlyContent = document.getElementById("monthlyContent");
const emptyState = document.getElementById("emptyState");

// プロフィールがなければ、登録ページへの案内を表示します。
let savedProfile = null;
try {
  savedProfile = JSON.parse(localStorage.getItem("app07-profile"));
} catch (error) {
  savedProfile = null;
}

if (!savedProfile || !savedProfile.name || !savedProfile.birthday) {
  emptyState.hidden = false;
} else {
  // 本人の命式と今月の月柱から、今月の読み解きを作ります。
  const profile = window.FourPillars.createProfile(
    savedProfile.name,
    savedProfile.birthday,
    savedProfile.birthTime || ""
  );
  const fortune = window.FourPillars.getMonthlyFortune(profile);
  monthlyContent.hidden = false;
  document.getElementById("monthLabel").textContent = fortune.monthLabel;
  document.getElementById("monthPillar").textContent = `今月の月柱：${fortune.monthPillar.text}　五行：${fortune.monthlyElement}`;
  document.getElementById("fortuneTitle").textContent = fortune.title;
  document.getElementById("fortuneMessage").textContent = fortune.message;
  document.getElementById("fortuneAdvice").textContent = fortune.advice;
  // 分野ごとのくわしい運勢を表示します。
  window.FourPillars.renderDetails(document.getElementById("monthlyDetails"), fortune.details);
}