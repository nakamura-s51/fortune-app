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


  // ===== くわしい結果に使う文章 =====
  // 日主（生まれた日の十干）ごとの、もう少し詳しい性格です。
  const dayMasterDetails = {
    甲: { strength: "目標を決めたら、コツコツ積み重ねて大きく育てる粘り強さがあります。頼られるとさらに力を発揮するタイプです。", caution: "まっすぐな分、予定どおりに進まないと気持ちが固くなりがち。回り道も成長のうちと考えると楽になります。", work: "長期的な目標を立てて、毎日少しずつ進める学び方が合っています。リーダー役や後輩の面倒を見る場面でも活躍できそうです。", love: "誠実で頼りがいのある付き合い方をします。相手のペースも聞きながら進むと、より安心感のある関係に。" },
    乙: { strength: "人の気持ちや場の空気を読むのが上手で、どんな環境にも自然となじめる柔らかさがあります。", caution: "周りに合わせすぎて、自分の本音を後回しにしがち。ときどき「自分はどうしたい？」と確かめてみて。", work: "チームの中で人と人をつなぐ役割や、細かな調整が得意です。少人数で教え合う学び方も向いています。", love: "相手を思いやる、やさしい付き合い方をします。遠慮しすぎず、してほしいことも伝えてみましょう。" },
    丙: { strength: "明るく前向きで、そこにいるだけで周りを元気にする存在です。思い立ったらすぐ動ける行動力もあります。", caution: "勢いがある分、熱しやすく冷めやすい面も。始めたことを一度区切りまで続けると自信につながります。", work: "人前で話す・発表する・場を盛り上げる場面で輝きます。短い時間で集中して取り組む学び方が合っています。", love: "気持ちをまっすぐ表現する、あたたかい付き合い方。相手の話をじっくり聞く時間も大切にすると◎。" },
    丁: { strength: "細やかな気配りと、ひとつのことを深く掘り下げる集中力があります。身近な人を静かに支える力の持ち主です。", caution: "人の気持ちに敏感な分、疲れをため込みやすいところも。ひとりで落ち着ける時間を意識してつくりましょう。", work: "丁寧さが求められる仕事や、専門的な知識を深める学びが向いています。手順を整えるのも得意です。", love: "相手のちょっとした変化に気づける、思いやりのある付き合い方。自分の気持ちも言葉にすると伝わりやすくなります。" },
    戊: { strength: "どっしりとした安定感があり、周りから信頼されやすいタイプ。困ったときに頼られる、まとめ役の素質があります。", caution: "慎重さゆえに、新しいことへの一歩が遅れがち。小さく試してみる気持ちで動くとチャンスが広がります。", work: "全体を見渡して計画を立てたり、土台を整えたりする役割が得意。基礎から順番に積み上げる学び方が合っています。", love: "包容力があり、相手を安心させる付き合い方をします。ときには自分の弱さも見せると、距離がぐっと縮まります。" },
    己: { strength: "人やアイデアを育てるのが上手で、身近なところから工夫を見つける力があります。面倒見のよさも魅力です。", caution: "あれこれ気を回しすぎて、自分のことが後回しになりがち。できることとできないことを分けて考えてみて。", work: "サポート役や、人の成長に関わる場面で力を発揮します。復習ノートを作るなど、整理しながら学ぶ方法が向いています。", love: "相手に尽くす、あたたかな付き合い方。してもらったことを素直に受け取ることも、関係を育てるコツです。" },
    庚: { strength: "決断が早く、物事の要点をすっきり整理できる力があります。困難にも正面から向き合える強さが持ち味です。", caution: "はっきりした物言いが、ときに強く伝わることも。結論の前に、相手の考えをひと言聞いてみるとスムーズです。", work: "問題を見つけて解決する仕事や、ルールを整える役割が得意。目標と期限を決めて取り組む学び方が合っています。", love: "裏表のない、まっすぐな付き合い方。やさしい言葉をひとつ添えるだけで、気持ちがより伝わります。" },
    辛: { strength: "繊細な感性と美意識があり、物事の質や細部の美しさに気づける人です。こだわりを形にする力があります。", caution: "完璧を目指すあまり、自分にも人にも厳しくなりがち。「8割できたら上出来」と考えると気持ちが軽くなります。", work: "仕上がりの美しさが大切な作業や、デザイン・品質に関わることが得意。きれいにまとめながら学ぶと身につきやすいです。", love: "相手を大切に扱う、丁寧な付き合い方。思っていることを少し早めに伝えると、すれ違いが減ります。" },
    壬: { strength: "視野が広く、自由な発想で新しい可能性を見つけられる人です。人や情報を集めてつなげる力もあります。", caution: "興味が広い分、ひとつに絞るのが苦手なことも。やることを3つまでに決めると、力を集中しやすくなります。", work: "企画やアイデア出し、たくさんの情報を整理する場面で活躍します。いろいろな教材を比べながら学ぶのも向いています。", love: "おおらかで、相手を自由にさせてあげる付き合い方。ときには一緒に過ごす時間をしっかり約束すると安心されます。" },
    癸: { strength: "観察力と想像力が豊かで、小さな変化や人の本音に気づける人です。静かに周りをうるおす、やさしい存在です。", caution: "考えすぎて動けなくなることも。迷ったら「まず5分だけやってみる」と決めると前に進みやすくなります。", work: "調べ物や分析、人の話をじっくり聞く仕事が向いています。毎日短い時間でも続ける学び方が力になります。", love: "相手の気持ちに寄り添う、繊細でやさしい付き合い方。不安なときは、ひとりで抱えずに言葉にしてみて。" }
  };

  // 五行ごとの色や、取り入れ方のヒントです。
  const elementInfo = {
    木: { color: "緑・若草色", action: "散歩をする、観葉植物の世話をする", lack: "新しいことを少し始めてみると、前に進む力が育ちます" },
    火: { color: "赤・オレンジ", action: "日の光を浴びる、好きな人と話す", lack: "人と会って話したり、気持ちを表に出したりすると元気が湧きます" },
    土: { color: "黄色・ベージュ", action: "部屋を片付ける、あたたかい食事をとる", lack: "生活リズムを整えると、気持ちが安定しやすくなります" },
    金: { color: "白・シルバー", action: "持ち物を整理する、予定を書き出す", lack: "やることを決めて区切りをつけると、すっきり進めます" },
    水: { color: "紺・黒", action: "お風呂でゆっくりする、本を読む", lack: "ひとりで考える静かな時間をつくると、アイデアが浮かびやすくなります" }
  };

  // ふたりの関係（4種類）ごとの、くわしいヒントです。
  const compatibilityDetails = {
    same: { good: "価値観や「心地よい」と感じることが近く、一緒にいて気をつかいすぎない関係です。言葉にしなくても分かり合える場面が多いでしょう。", caution: "似ているからこそ、同じところでつまずいたり、お互いに甘えすぎたりすることも。ときどき違う意見も歓迎すると、関係が新鮮に保てます。", tip: "ふたりとも初めてのことに一緒に挑戦すると、新しい一面を発見できそうです。" },
    generate: { good: "一方が力を与え、もう一方がそれを受け取って育てる、自然な助け合いが生まれやすい関係です。一緒にいると前向きな気持ちになれます。", caution: "支える側ばかりが頑張りすぎないように注意。ときどき役割を入れ替えてみると、バランスがとれます。", tip: "「ありがとう」「助かった」をこまめに伝え合うと、よい流れがさらに強まります。" },
    control: { good: "考え方や得意なことが違うので、自分にはない視点をもらえる関係です。うまくかみ合うと、ひとりではできないことも実現できます。", caution: "意見がぶつかったときに、どちらかが我慢しがち。勝ち負けではなく「ふたりにとって一番いい方法」を一緒に探してみて。", tip: "大事なことは、落ち着いているときに話し合うのがおすすめです。" },
    other: { good: "それぞれの個性がはっきりしていて、ほどよい距離感で付き合える関係です。お互いの得意なことを持ち寄れます。", caution: "干渉しすぎない分、気持ちのすれ違いに気づきにくいことも。近況をこまめに伝え合うと安心です。", tip: "共通の趣味や目標をひとつ持つと、ふたりの間に自然な会話が増えそうです。" }
  };

  // 今月の運勢（6種類）ごとの、くわしい内容です。
  const monthlyDetails = {
    same: { work: "得意分野で力を発揮しやすい月。今まで続けてきた勉強や仕事の成果を、形にまとめてみるとよさそうです。", people: "考えの近い人と気持ちよく過ごせます。ただし自分の意見を押し通しすぎないよう、聞き役も意識して。", health: "頑張りすぎて疲れがたまりやすい時期。早めに休むことも予定に入れておきましょう。" },
    output: { work: "アイデアを行動に移しやすい月。資料を作る、発表する、作品を仕上げるなど「アウトプット」に向いています。", people: "あなたの行動が周りによい刺激を与えそう。誘いや提案は、思い切って自分から声をかけてみて。", health: "エネルギーを使う分、食事と睡眠はしっかりと。好きなものを食べてごほうびを。" },
    input: { work: "学びやインプットに向いた月。本を読む、講座を受けるなど、新しい知識を取り入れるのにぴったりです。", people: "目上の人や信頼できる人から、よいアドバイスをもらえそう。素直に耳を傾けてみましょう。", health: "心も体も回復しやすい時期。ゆっくりお風呂に入るなど、自分をいたわる時間を増やして。" },
    manage: { work: "計画を立てる・整理するのに向いた月。やることリストを見直し、優先順位をつけると効率が上がります。", people: "まとめ役を頼まれることがありそう。全部を引き受けず、得意な人に任せるのも大切です。", health: "予定を詰め込みすぎると疲れやすくなります。何もしない日を1日つくってみて。" },
    pressure: { work: "予定外のことが起きやすい月。焦らず一つずつ対応すれば、経験が力になります。", people: "厳しい意見をもらうことがあっても、成長のヒントとして受け止めて。ひとりで抱えず相談を。", health: "緊張で肩や首がこりやすい時期。ストレッチや深呼吸で、体をゆるめましょう。" },
    other: { work: "いつもと違う方法を試すのに向いた月。新しい道具や勉強法を取り入れてみると発見がありそうです。", people: "新しい出会いや、普段話さない人との会話から刺激をもらえそう。", health: "気分転換が大切な月。行ったことのない場所に出かけると、気持ちがリフレッシュします。" }
  };

  // 五行どうしの関係を名前にします。
  function getRelation(firstElement, secondElement) {
    if (firstElement === secondElement) {
      return "same";
    }
    if (generates[firstElement] === secondElement || generates[secondElement] === firstElement) {
      return "generate";
    }
    if (controls[firstElement] === secondElement || controls[secondElement] === firstElement) {
      return "control";
    }
    return "other";
  }

  // 「見出し」と「文章」の組を、カードのように並べて表示します。
  function renderDetails(container, details) {
    container.innerHTML = "";
    details.forEach((detail) => {
      const item = document.createElement("article");
      item.className = "detail-item";
      const heading = document.createElement("h4");
      heading.textContent = detail.heading;
      const text = document.createElement("p");
      text.textContent = detail.text;
      item.append(heading, text);
      container.appendChild(item);
    });
  }

  // 個人の命式から、くわしい読み解きを作ります。
  function getPersonalDetails(profile) {
    const info = dayMasterDetails[profile.dayStem];
    const balance = getElementBalance(profile);
    const values = Object.values(balance);
    const weakest = Object.entries(balance).filter(([, count]) => count === Math.min(...values)).map(([element]) => element);
    const own = elementInfo[profile.dayElement];
    const weakText = Math.min(...values) === Math.max(...values)
      ? "五行がバランスよくそろっています。今のペースを大切にしましょう。"
      : `命式の中で少なめなのは「${weakest.join("・")}」。${weakest.map((element) => elementInfo[element].lack).join("。")}。`;
    return [
      { heading: "あなたの長所", text: info.strength },
      { heading: "気をつけたいこと", text: info.caution },
      { heading: "仕事・勉強のヒント", text: info.work },
      { heading: "人との関わり方", text: info.love },
      { heading: "五行から見たバランス", text: weakText },
      { heading: "ラッキーカラーと開運アクション", text: `あなたの五行「${profile.dayElement}」の色は ${own.color}。${own.action}と、気持ちが整いやすくなります。` }
    ];
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
      traits,
      details: getCompatibilityDetails(first, second, traits)
    };
  }

  // ふたりの相性の、くわしい読み解きを作ります。
  function getCompatibilityDetails(first, second, traits) {
    const relation = getRelation(first.dayElement, second.dayElement);
    const info = compatibilityDetails[relation];
    const firstName = first.name || "ひとり目";
    const secondName = second.name || "ふたり目";
    let role;
    if (generates[first.dayElement] === second.dayElement) {
      role = `${firstName}さんが「${first.dayElement}」で${secondName}さんの「${second.dayElement}」を生み出す関係。${firstName}さんが応援役、${secondName}さんがその力を形にする役になりやすいでしょう。`;
    } else if (generates[second.dayElement] === first.dayElement) {
      role = `${secondName}さんが「${second.dayElement}」で${firstName}さんの「${first.dayElement}」を生み出す関係。${secondName}さんが応援役、${firstName}さんがその力を形にする役になりやすいでしょう。`;
    } else if (controls[first.dayElement] === second.dayElement) {
      role = `${firstName}さんの「${first.dayElement}」が、${secondName}さんの「${second.dayElement}」を整える関係。${firstName}さんが引っぱり役になりやすいので、${secondName}さんの意見も大切に。`;
    } else if (controls[second.dayElement] === first.dayElement) {
      role = `${secondName}さんの「${second.dayElement}」が、${firstName}さんの「${first.dayElement}」を整える関係。${secondName}さんが引っぱり役になりやすいので、${firstName}さんの意見も大切に。`;
    } else if (relation === "same") {
      role = `ふたりとも「${first.dayElement}」の性質。役割を決めすぎず、その時々で得意なほうがリードすると上手くいきます。`;
    } else {
      role = "決まった役割にとらわれず、その場面ごとに得意なほうがリードするとうまくいきます。";
    }
    const best = [...traits].sort((a, b) => b.value - a.value)[0];
    const bestText = {
      会話: "話していて楽しい、会話のテンポが合うふたりです。気になることは、気軽に話題にしてみて。",
      歩幅: "物事を進めるペースが合いやすいふたり。一緒に計画を立てると、スムーズに進みそうです。",
      支え合い: "困ったときに自然と助け合えるふたり。小さなことでも頼り合うと、きずなが深まります。"
    }[best.name];
    return [
      { heading: "ふたりの良いところ", text: info.good },
      { heading: "ふたりの役割", text: role },
      { heading: `いちばん高いのは「${best.name}」`, text: bestText },
      { heading: "気をつけたいこと", text: info.caution },
      { heading: "仲良くなるヒント", text: info.tip }
    ];
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
    let type;

    if (personalElement === monthlyElement) {
      type = "same";
      title = "自分らしさを育てる月";
      message = `今月の「${monthlyElement}」は、あなたの日主と同じ五行。得意なことや大切にしたい考えが表に出やすい時期です。`;
      advice = "いつものやり方を大切にしつつ、周りの声にも耳を傾けてみて。";
    } else if (generates[personalElement] === monthlyElement) {
      type = "output";
      title = "アイデアを形にする月";
      message = `あなたの「${personalElement}」が今月の「${monthlyElement}」を生み出す関係。考えていたことを行動に移すきっかけが見つかりそうです。`;
      advice = "小さな目標をひとつ決めて、できたことを振り返るのがおすすめ。";
    } else if (generates[monthlyElement] === personalElement) {
      type = "input";
      title = "ヒントを受け取る月";
      message = `今月の「${monthlyElement}」が、あなたの「${personalElement}」を支える関係。人との会話や学びから、次の一歩のヒントを得られそうです。`;
      advice = "ひとりで抱えず、信頼できる人に相談してみて。";
    } else if (controls[personalElement] === monthlyElement) {
      type = "manage";
      title = "整える力が光る月";
      message = `あなたの「${personalElement}」が今月の流れを整える関係。予定や身の回りを見直すと、気持ちよく進めそうです。`;
      advice = "やることを詰め込みすぎず、優先順位をつけてみましょう。";
    } else if (controls[monthlyElement] === personalElement) {
      type = "pressure";
      title = "柔軟さが助けになる月";
      message = `今月の「${monthlyElement}」が、あなたの「${personalElement}」に働きかける関係。予定外の変化から、新しい視点が見つかりそうです。`;
      advice = "すぐに答えを出さず、少し時間をおいて考えるのもよさそう。";
    } else {
      type = "other";
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
      advice,
      details: [
        { heading: "仕事・勉強運", text: monthlyDetails[type].work },
        { heading: "人間関係運", text: monthlyDetails[type].people },
        { heading: "体と心のケア", text: monthlyDetails[type].health },
        { heading: "今月のラッキーカラー", text: `今月の五行「${monthlyElement}」の色は ${elementInfo[monthlyElement].color}。${elementInfo[monthlyElement].action}、などもおすすめです。` }
      ]
    };
  }

  // ===== 生年月日を「年・月・日」の3つの選択欄で入力する仕組み =====
  // HTML には <input type="hidden" data-date-select> を置いておきます。
  // その横に 年・月・日 の選択欄を作り、選んだ日付を「1990-05-20」の形で hidden に入れます。
  // （ほかのプログラムは、今までどおり hidden の value を読むだけで使えます）
  function setupDateSelects() {
    const now = new Date();
    const thisYear = now.getFullYear();
    const todayText = `${thisYear}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    document.querySelectorAll("input[data-date-select]").forEach((hidden) => {
      const wrapper = document.createElement("div");
      wrapper.className = "date-selects";

      // 年・月・日 の3つの選択欄を作ります。
      const makeSelect = (key, unit) => {
        const select = document.createElement("select");
        select.id = `${hidden.id}${key}`;
        select.required = true;
        select.setAttribute("aria-label", `生年月日の${unit}`);
        select.appendChild(new Option(unit, ""));
        wrapper.appendChild(select);
        return select;
      };
      const yearSelect = makeSelect("Year", "年");
      const monthSelect = makeSelect("Month", "月");
      const daySelect = makeSelect("Day", "日");

      for (let year = thisYear; year >= 1920; year -= 1) {
        yearSelect.appendChild(new Option(`${year}年`, String(year)));
      }
      for (let month = 1; month <= 12; month += 1) {
        monthSelect.appendChild(new Option(`${month}月`, String(month)));
      }

      // 日の選択肢を、その月の日数（28〜31日）に合わせて作り直します。
      const renderDays = () => {
        const selectedDay = daySelect.value;
        const year = Number(yearSelect.value) || 2000;
        const month = Number(monthSelect.value) || 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        daySelect.length = 1;
        for (let day = 1; day <= daysInMonth; day += 1) {
          daySelect.appendChild(new Option(`${day}日`, String(day)));
        }
        if (Number(selectedDay) <= daysInMonth) {
          daySelect.value = selectedDay;
        }
      };

      // 3つとも選ばれたら、hidden に「1990-05-20」の形で入れます。
      const updateHidden = () => {
        if (yearSelect.value && monthSelect.value && daySelect.value) {
          hidden.value = `${yearSelect.value}-${monthSelect.value.padStart(2, "0")}-${daySelect.value.padStart(2, "0")}`;
        } else {
          hidden.value = "";
        }
        daySelect.setCustomValidity(hidden.value > todayText ? "未来の日付は選べません" : "");
      };

      yearSelect.addEventListener("change", () => { renderDays(); updateHidden(); });
      monthSelect.addEventListener("change", () => { renderDays(); updateHidden(); });
      daySelect.addEventListener("change", updateHidden);

      // フォームをリセットしたら、hidden も空っぽに戻します。
      if (hidden.form) {
        hidden.form.addEventListener("reset", () => {
          window.setTimeout(() => { renderDays(); updateHidden(); }, 0);
        });
      }

      // プログラムで hidden に日付を入れたあと、選択欄をそれに合わせるための関数です。
      hidden.syncDateSelects = () => {
        const [year, month, day] = (hidden.value || "").split("-");
        yearSelect.value = year ? String(Number(year)) : "";
        monthSelect.value = month ? String(Number(month)) : "";
        renderDays();
        daySelect.value = day ? String(Number(day)) : "";
        updateHidden();
      };

      renderDays();
      hidden.after(wrapper);
    });
  }

  // すべての日付の選択欄を、hidden の値に合わせます。
  function syncDateSelects() {
    document.querySelectorAll("input[data-date-select]").forEach((hidden) => {
      if (hidden.syncDateSelects) {
        hidden.syncDateSelects();
      }
    });
  }

  // 「1990-05-20」を「1990年5月20日」の形にします。
  function formatBirthday(dateText) {
    const [year, month, day] = dateText.split("-").map(Number);
    return `${year}年${month}月${day}日`;
  }

  window.FourPillars = {
    setupDateSelects,
    syncDateSelects,
    formatBirthday,
    calculatePillars,
    createProfile,
    createPersonalReading,
    getElementBalance,
    calculateCompatibility,
    getMonthlyFortune,
    getPersonalDetails,
    getCompatibilityDetails,
    renderDetails
  };
})();