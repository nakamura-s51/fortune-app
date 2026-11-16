// 四柱計算と、命式を使った簡易メッセージを各ページで共有します。
(function () {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const stemElements = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
  const branchElements = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];
  const generates = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const controls = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

  // 節入り日を目安に、その年の干支を切り替えます。
  function getSolarYear(year, month, day) {
    return month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  }

  // 生年月日と、入力されていれば出生時刻から柱を計算します。
  function calculatePillars(birthday, birthTime) {
    const [year, month, day] = birthday.split("-").map(Number);
    const solarYear = getSolarYear(year, month, day);
    const yearCycle = (solarYear - 1984 + 6000) % 60;
    const yearStem = yearCycle % 10;
    const yearBranch = yearCycle % 12;
    const monthBranch = getMonthBranch(month, day);
    const firstMonthStem = (yearStem % 5) * 2 + 2;
    const monthOffset = (monthBranch - 2 + 12) % 12;
    const monthStem = (firstMonthStem + monthOffset) % 10;
    const dayCycle = (getJulianDay(year, month, day) + 49) % 60;
    const dayStem = dayCycle % 10;
    const dayBranch = dayCycle % 12;
    const pillars = {
      year: createPillar("年柱", yearStem, yearBranch),
      month: createPillar("月柱", monthStem, monthBranch),
      day: createPillar("日柱", dayStem, dayBranch)
    };

    // 出生時刻が分かる場合だけ時柱も追加します。
    if (birthTime) {
      const hour = Number(birthTime.split(":")[0]);
      const hourBranch = Math.floor((hour + 1) / 2) % 12;
      const firstHourStem = (dayStem % 5) * 2;
      const hourStem = (firstHourStem + hourBranch) % 10;
      pillars.hour = createPillar("時柱", hourStem, hourBranch);
    }

    return {
      pillars,
      dayStem: stems[dayStem],
      dayElement: stemElements[dayStem],
      yearElement: stemElements[yearStem],
      dayBranch
    };
  }

  // 簡易的な節入り日表から、月柱の十二支を選びます。
  function getMonthBranch(month, day) {
    const boundaries = [
      { month: 1, day: 6, branch: 1 }, { month: 2, day: 4, branch: 2 },
      { month: 3, day: 6, branch: 3 }, { month: 4, day: 5, branch: 4 },
      { month: 5, day: 6, branch: 5 }, { month: 6, day: 6, branch: 6 },
      { month: 7, day: 7, branch: 7 }, { month: 8, day: 8, branch: 8 },
      { month: 9, day: 8, branch: 9 }, { month: 10, day: 8, branch: 10 },
      { month: 11, day: 7, branch: 11 }, { month: 12, day: 7, branch: 0 }
    ];
    const currentDate = month * 100 + day;
    let selectedBranch = 0;

    boundaries.forEach((boundary) => {
      if (currentDate >= boundary.month * 100 + boundary.day) {
        selectedBranch = boundary.branch;
      }
    });
    return selectedBranch;
  }

  // グレゴリオ暦の日付をユリウス通日に変換します。
  function getJulianDay(year, month, day) {
    const adjustment = Math.floor((14 - month) / 12);
    const adjustedYear = year + 4800 - adjustment;
    const adjustedMonth = month + 12 * adjustment - 3;
    return day
      + Math.floor((153 * adjustedMonth + 2) / 5)
      + 365 * adjustedYear
      + Math.floor(adjustedYear / 4)
      - Math.floor(adjustedYear / 100)
      + Math.floor(adjustedYear / 400)
      - 32045;
  }

  // 十干と十二支を組み合わせて、1つの柱を作ります。
  function createPillar(label, stemIndex, branchIndex) {
    return {
      label,
      stemIndex,
      branchIndex,
      stem: stems[stemIndex],
      branch: branches[branchIndex],
      text: `${stems[stemIndex]}${branches[branchIndex]}`,
      element: stemElements[stemIndex],
      branchElement: branchElements[branchIndex]
    };
  }

  // ひとり分の命式と、日主の個性をまとめます。
  function createProfile(name, birthday, birthTime = "") {
    const details = calculatePillars(birthday, birthTime);
    const profile = {
      name: name.trim(),
      birthday,
      birthTime,
      pillars: details.pillars,
      dayStem: details.dayStem,
      dayElement: details.dayElement,
      yearElement: details.yearElement,
      dayBranch: details.dayBranch
    };
    profile.reading = createPersonalReading(profile);
    profile.elementBalance = getElementBalance(profile);
    return profile;
  }

  // 日主と、柱に含まれる五行から個人向けの一言を作ります。
  function createPersonalReading(profile) {
    const dayMasterMessages = {
      甲: "まっすぐ伸びる木のように、目標へ向かって着実に進む力が持ち味です。",
      乙: "草花のようにしなやかで、周囲を見ながら自分らしい道を探すのが得意です。",
      丙: "太陽のような明るさで、場を前向きにする雰囲気があります。",
      丁: "灯火のような細やかな気配りで、身近な人をあたためる力があります。",
      戊: "大地のような落ち着きで人を受け止め、物事の土台を整えるのが得意です。",
      己: "畑の土のように、人やアイデアを育てる工夫を見つける力があります。",
      庚: "鍛えた金属のような決断力で、物事の要点をはっきりさせるのが得意です。",
      辛: "宝石のような繊細な感性で、細部の美しさや質に気づく力があります。",
      壬: "大きな水のような柔軟さで、広い視点から可能性を見つけられます。",
      癸: "雨やしずくのような観察力で、小さな変化に気づく力があります。"
    };
    const balance = getElementBalance(profile);
    const strongest = Object.entries(balance).filter(([, count]) => count === Math.max(...Object.values(balance))).map(([element]) => element);
    const balanceText = strongest.length === 5
      ? "柱の五行は全体にバランスよく表れています。"
      : `柱の五行では「${strongest.join("・")}」が比較的よく表れています。`;
    return `${dayMasterMessages[profile.dayStem]} ${balanceText}`;
  }

  // 4つの柱に表れる五行を数えます。時柱がなければ3つの柱で見ます。
  function getElementBalance(profile) {
    const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    Object.values(profile.pillars).forEach((pillar) => {
      counts[pillar.element] += 1;
      counts[pillar.branchElement] += 1;
    });
    return counts;
  }

  // 日主の五行の関係から、ふたりの簡易相性を出します。
  function calculateCompatibility(first, second) {
    const firstElement = first.dayElement;
    const secondElement = second.dayElement;
    let score;
    let title;
    let message;

    if (firstElement === secondElement) {
      score = 82;
      title = "似た感覚で通じ合うふたり";
      message = "大切にするものが似ていて、自然と安心できる関係。考え方が重なる分、相手の気持ちを決めつけずに聞いてみると、理解がもっと深まりそうです。";
    } else if (generates[firstElement] === secondElement || generates[secondElement] === firstElement) {
      score = 90;
      title = "力を分け合えるふたり";
      message = "五行がめぐるように、お互いの良さを引き出しやすい組み合わせ。助け合いが自然に生まれそうです。感謝を言葉にすると、あたたかな関係が育ちます。";
    } else if (controls[firstElement] === secondElement || controls[secondElement] === firstElement) {
      score = 72;
      title = "違いが成長の種になるふたり";
      message = "ものの見方に違いが出やすいぶん、新しい視点をもらえる関係。意見が分かれたときは、結論を急がず「どうしてそう思う？」と聞くのがよさそうです。";
    } else {
      score = 78;
      title = "個性が響き合うふたり";
      message = "それぞれの得意なことを持ち寄れる組み合わせ。相手に合わせすぎず、自分らしさも大切にすると、心地よい距離感を見つけられそうです。";
    }

    if (first.yearElement === second.yearElement) {
      score += 2;
    } else if (generates[first.yearElement] === second.yearElement || generates[second.yearElement] === first.yearElement) {
      score += 3;
    }
    score = Math.min(96, score);

    const traits = [
      { name: "会話", value: clampScore(score + ((first.dayBranch + second.dayBranch) % 7) - 3) },
      { name: "歩幅", value: clampScore(score + ((first.pillars.month.branchIndex + second.pillars.month.branchIndex) % 7) - 3) },
      { name: "支え合い", value: clampScore(score + ((first.pillars.year.branchIndex + second.pillars.year.branchIndex) % 7) - 3) }
    ];

    return {
      score,
      title,
      message,
      elementPair: `日主の五行　${firstElement} × ${secondElement}`,
      traits
    };
  }

  // 相性の各項目を、読みやすい範囲の数値に収めます。
  function clampScore(value) {
    return Math.max(55, Math.min(98, value));
  }

  // 本人の日主と今月の月柱から、今月の簡単な読み解きを作ります。
  function getMonthlyFortune(profile, date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateText = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const monthPillar = calculatePillars(dateText).pillars.month;
    const personalElement = profile.dayElement;
    const monthlyElement = monthPillar.element;
    let title;
    let message;
    let advice;

    if (personalElement === monthlyElement) {
      title = "自分らしさを育てる月";
      message = `今月の「${monthlyElement}」は、あなたの日主と同じ五行。得意なことや大切にしたい考えが表に出やすい時期です。`;
      advice = "いつものやり方を大切にしつつ、周りの声にも耳を傾けてみて。";
    } else if (generates[personalElement] === monthlyElement) {
      title = "アイデアを形にする月";
      message = `あなたの「${personalElement}」が今月の「${monthlyElement}」を生み出す関係。考えていたことを行動に移すきっかけが見つかりそうです。`;
      advice = "小さな目標をひとつ決めて、できたことを振り返るのがおすすめ。";
    } else if (generates[monthlyElement] === personalElement) {
      title = "ヒントを受け取る月";
      message = `今月の「${monthlyElement}」が、あなたの「${personalElement}」を支える関係。人との会話や学びから、次の一歩のヒントを得られそうです。`;
      advice = "ひとりで抱えず、信頼できる人に相談してみて。";
    } else if (controls[personalElement] === monthlyElement) {
      title = "整える力が光る月";
      message = `あなたの「${personalElement}」が今月の流れを整える関係。予定や身の回りを見直すと、気持ちよく進めそうです。`;
      advice = "やることを詰め込みすぎず、優先順位をつけてみましょう。";
    } else if (controls[monthlyElement] === personalElement) {
      title = "柔軟さが助けになる月";
      message = `今月の「${monthlyElement}」が、あなたの「${personalElement}」に働きかける関係。予定外の変化から、新しい視点が見つかりそうです。`;
      advice = "すぐに答えを出さず、少し時間をおいて考えるのもよさそう。";
    } else {
      title = "好奇心を広げる月";
      message = `今月の「${monthlyElement}」は、あなたの「${personalElement}」と違う性質。普段と違う人や考えに触れることで、視野が広がりそうです。`;
      advice = "気になったことをひとつ試して、自分に合うか確かめてみて。";
    }

    return {
      monthLabel: new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" }).format(date),
      monthPillar,
      monthlyElement,
      title,
      message,
      advice
    };
  }

  window.FourPillars = {
    calculatePillars,
    createProfile,
    createPersonalReading,
    getElementBalance,
    calculateCompatibility,
    getMonthlyFortune
  };
})();