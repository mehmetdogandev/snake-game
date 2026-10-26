import { GameMode, Language, SkinId } from './types';

export interface Translations {
  // General & Navigation
  appName: string;
  appSubtitle: string;
  play: string;
  resume: string;
  restart: string;
  mainMenu: string;
  pause: string;
  paused: string;
  settings: string;
  skins: string;
  missions: string;
  stats: string;
  challenges: string;
  close: string;
  back: string;
  claim: string;
  claimed: string;
  equip: string;
  equipped: string;
  unlock: string;
  locked: string;
  completed: string;
  level: string;
  xp: string;
  coins: string;
  best: string;
  score: string;
  length: string;
  speed: string;
  combo: string;
  timeLeft: string;
  newRecord: string;
  gameOver: string;
  victory: string;
  stageCleared: string;
  playAgain: string;
  nextStage: string;
  shareScore: string;
  scoreCopied: string;

  // Modes
  modeClassic: string;
  modeZen: string;
  modeChallenge: string;
  modeClassicDesc: string;
  modeZenDesc: string;
  modeChallengeDesc: string;
  selectMode: string;

  // Gameplay HUD & Prompts
  controlsPrompt: string;
  powerupShield: string;
  powerupBonus2x: string;
  powerupSlow: string;
  powerupGolden: string;
  shieldAbsorbed: string;

  // End Screen Summary
  summaryTitle: string;
  statFoodCollected: string;
  statMaxCombo: string;
  statRunTime: string;
  statEarnedXp: string;
  statEarnedCoins: string;
  levelUpNotice: string;
  achievementsUnlocked: string;

  // Wardrobe / Skins
  wardrobeTitle: string;
  wardrobeSubtitle: string;
  ownedSkinsCount: string;
  rarityCommon: string;
  rarityRare: string;
  rarityEpic: string;
  rarityLegendary: string;

  // Missions & Trophies
  missionsTabDaily: string;
  missionsTabAchievements: string;
  dailyResetsIn: string;
  missionsCompletedCount: string;
  achievementsCompletedCount: string;

  // Player Stats
  statsTitle: string;
  statsSubtitle: string;
  statTotalRuns: string;
  statTotalFood: string;
  statHighestScore: string;
  statLongestSnake: string;
  statTotalPlayTime: string;
  statTotalCoins: string;
  statGoldenFood: string;
  statChallengesDone: string;

  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  sectionAudio: string;
  soundFx: string;
  soundFxDesc: string;
  music: string;
  musicDesc: string;
  haptics: string;
  hapticsDesc: string;
  sectionControls: string;
  controlsType: string;
  controlsSwipe: string;
  controlsDpad: string;
  controlsBoth: string;
  sectionAccessibility: string;
  reducedMotion: string;
  reducedMotionDesc: string;
  highContrast: string;
  highContrastDesc: string;
  sectionLanguage: string;
  languageSelect: string;
  sectionData: string;
  resetProgress: string;
  resetConfirm: string;
  resetSuccess: string;

  // Challenges
  challengesTitle: string;
  challengesSubtitle: string;
  stageTargetScore: string;
  stageTargetLength: string;
  stageTimeLimit: string;
  startChallenge: string;
}

const TR: Translations = {
  // General & Navigation
  appName: 'SNAKE EVOLUTION',
  appSubtitle: 'Yeni Nesil Mobil Yılan Arcade Deneyimi',
  play: 'OYNA',
  resume: 'DEVAM ET',
  restart: 'YENİDEN BAŞLAT',
  mainMenu: 'ANA MENÜ',
  pause: 'Duraklat',
  paused: 'OYUN DURAKLATILDI',
  settings: 'Ayarlar',
  skins: 'Kostümler',
  missions: 'Görevler',
  stats: 'İstatistik',
  challenges: 'Bölümler',
  close: 'Kapat',
  back: 'Geri',
  claim: 'Ödülü Al',
  claimed: 'Alındı',
  equip: 'Kuşan',
  equipped: 'Kuşanıldı',
  unlock: 'Kilidi Aç',
  locked: 'Kilitli',
  completed: 'Tamamlandı',
  level: 'Seviye',
  xp: 'DP',
  coins: 'Altın',
  best: 'Rekor',
  score: 'Skor',
  length: 'Uzunluk',
  speed: 'Hız',
  combo: 'Kombo',
  timeLeft: 'Kalan Süre',
  newRecord: 'YENİ REKOR!',
  gameOver: 'OYUN BİTTİ',
  victory: 'BÖLÜM GEÇİLDİ!',
  stageCleared: 'GÖREV BAŞARILI',
  playAgain: 'TEKRAR OYNA',
  nextStage: 'SONRAKİ BÖLÜM',
  shareScore: 'Skoru Paylaş',
  scoreCopied: 'Skor kopyalandı!',

  // Modes
  modeClassic: 'KLASİK',
  modeZen: 'ZEN',
  modeChallenge: 'MEYDAN OKUMA',
  modeClassicDesc: 'Duvarlara ve kendine çarpmadan en yüksek skoru topla.',
  modeZenDesc: 'Duvar veya çarpışma yok. Sonsuz, rahatlatıcı akış deneyimi.',
  modeChallengeDesc: 'Özel engeller, hedefler ve zaman sınırlarına karşı yarış.',
  selectMode: 'Oyun Modu',

  // Gameplay HUD & Prompts
  controlsPrompt: 'Yönlendirmek için ekranda kaydırın veya D-Pad kullanın',
  powerupShield: 'Kalkan Aktif',
  powerupBonus2x: '2X Puan',
  powerupSlow: 'Ağır Çekim',
  powerupGolden: 'Altın Avı',
  shieldAbsorbed: 'Kalkan darbeyi engelledi!',

  // End Screen Summary
  summaryTitle: 'Oyun Sonu Özeti',
  statFoodCollected: 'Toplanan Yem',
  statMaxCombo: 'En Yüksek Kombo',
  statRunTime: 'Oyun Süresi',
  statEarnedXp: 'Kazanılan DP',
  statEarnedCoins: 'Kazanılan Altın',
  levelUpNotice: 'TEBRİKLER! SEVİYE ATLADIN!',
  achievementsUnlocked: 'Açılan Başarımlar',

  // Wardrobe / Skins
  wardrobeTitle: 'Yılan Kostümleri',
  wardrobeSubtitle: 'Karakterini benzersiz renk paletleri ve efektlerle özelleştir',
  ownedSkinsCount: 'Sahip Olunan',
  rarityCommon: 'Yaygın',
  rarityRare: 'Nadir',
  rarityEpic: 'Destansı',
  rarityLegendary: 'Efsanevi',

  // Missions & Trophies
  missionsTabDaily: 'Günlük Görevler',
  missionsTabAchievements: 'Başarımlar',
  dailyResetsIn: 'Sıfırlanma Süresi',
  missionsCompletedCount: 'Tamamlanan',
  achievementsCompletedCount: 'Açılan Kupa',

  // Player Stats
  statsTitle: 'Oyuncu İstatistikleri',
  statsSubtitle: 'Kariyeriniz boyunca ulaştığınız tüm oyun verileri',
  statTotalRuns: 'Toplam Oyun',
  statTotalFood: 'Toplanan Toplam Yem',
  statHighestScore: 'En Yüksek Skor',
  statLongestSnake: 'En Uzun Yılan',
  statTotalPlayTime: 'Toplam Oyun Süresi',
  statTotalCoins: 'Toplam Kazanılan Altın',
  statGoldenFood: 'Toplanan Altın Elma',
  statChallengesDone: 'Tamamlanan Meydan Okuma',

  // Settings
  settingsTitle: 'Oyun Ayarları',
  settingsSubtitle: 'Görsel, ses ve kontrol tercihlerini özelleştir',
  sectionAudio: 'Ses & Titreşim',
  soundFx: 'Ses Efektleri',
  soundFxDesc: 'Yem yeme, çarpma ve arayüz etkileşim sesleri',
  music: 'Arka Plan Müziği',
  musicDesc: 'Retro synthwave arcade melodisi',
  haptics: 'Dokunsal Titreşim',
  hapticsDesc: 'Dönüş ve çarpışmalarda dokunsal titreşim geri bildirimi',
  sectionControls: 'Kontrol Şeması',
  controlsType: 'Oynanış Kontrolleri',
  controlsSwipe: 'Sadece Kaydırma (Swipe)',
  controlsDpad: 'Sanal D-Pad',
  controlsBoth: 'Her İkisi Birden (Hibrit)',
  sectionAccessibility: 'Erişilebilirlik',
  reducedMotion: 'Azaltılmış Hareket',
  reducedMotionDesc: 'Hızlı titreşimler ve arka plan parçacık efektlerini yumuşatır',
  highContrast: 'Yüksek Karşıtlık',
  highContrastDesc: 'Yılanı, engelleri ve yemleri daha belirgin hale getirir',
  sectionLanguage: 'Dil Seçeneği / Language',
  languageSelect: 'Uygulama Dili',
  sectionData: 'Veri Yönetimi',
  resetProgress: 'Tüm İlerlemeyi Sıfırla',
  resetConfirm: 'Tüm skorlar, kostümler ve kayıtlı ilerleme silinecek. Emin misiniz?',
  resetSuccess: 'İlerleme sıfırlandı.',

  // Challenges
  challengesTitle: 'Meydan Okuma Bölümleri',
  challengesSubtitle: 'Taktiksel labirentleri ve özel görevleri tamamlayarak ödül kazan',
  stageTargetScore: 'Hedef Skor',
  stageTargetLength: 'Hedef Uzunluk',
  stageTimeLimit: 'Süre Sınırı',
  startChallenge: 'BÖLÜME BAŞLA',
};

const EN: Translations = {
  // General & Navigation
  appName: 'SNAKE EVOLUTION',
  appSubtitle: 'Next-Gen Mobile Arcade Snake Experience',
  play: 'PLAY',
  resume: 'RESUME',
  restart: 'RESTART',
  mainMenu: 'MAIN MENU',
  pause: 'Pause',
  paused: 'GAME PAUSED',
  settings: 'Settings',
  skins: 'Skins',
  missions: 'Missions',
  stats: 'Stats',
  challenges: 'Stages',
  close: 'Close',
  back: 'Back',
  claim: 'Claim',
  claimed: 'Claimed',
  equip: 'Equip',
  equipped: 'Equipped',
  unlock: 'Unlock',
  locked: 'Locked',
  completed: 'Completed',
  level: 'Level',
  xp: 'XP',
  coins: 'Coins',
  best: 'Best',
  score: 'Score',
  length: 'Length',
  speed: 'Speed',
  combo: 'Combo',
  timeLeft: 'Time Left',
  newRecord: 'NEW HIGH SCORE!',
  gameOver: 'GAME OVER',
  victory: 'STAGE CLEARED!',
  stageCleared: 'OBJECTIVE ACHIEVED',
  playAgain: 'PLAY AGAIN',
  nextStage: 'NEXT STAGE',
  shareScore: 'Share Score',
  scoreCopied: 'Score copied to clipboard!',

  // Modes
  modeClassic: 'CLASSIC',
  modeZen: 'ZEN',
  modeChallenge: 'CHALLENGE',
  modeClassicDesc: 'Eat energy orbs, survive walls, and set all-time records.',
  modeZenDesc: 'No borders or self-collisions. Pure infinite relaxation flow.',
  modeChallengeDesc: 'Tactical maze puzzles with timers and unique objectives.',
  selectMode: 'Game Mode',

  // Gameplay HUD & Prompts
  controlsPrompt: 'Swipe anywhere or use the D-Pad to maneuver',
  powerupShield: 'Shield Active',
  powerupBonus2x: '2X Score',
  powerupSlow: 'Slow Motion',
  powerupGolden: 'Golden Rush',
  shieldAbsorbed: 'Shield deflected collision!',

  // End Screen Summary
  summaryTitle: 'Run Summary',
  statFoodCollected: 'Energy Orbs',
  statMaxCombo: 'Peak Combo',
  statRunTime: 'Time Survived',
  statEarnedXp: 'XP Earned',
  statEarnedCoins: 'Coins Earned',
  levelUpNotice: 'CONGRATULATIONS! LEVEL UP!',
  achievementsUnlocked: 'Achievements Unlocked',

  // Wardrobe / Skins
  wardrobeTitle: 'Serpent Skins',
  wardrobeSubtitle: 'Customize your snake with vibrant palettes and particle glows',
  ownedSkinsCount: 'Unlocked',
  rarityCommon: 'Common',
  rarityRare: 'Rare',
  rarityEpic: 'Epic',
  rarityLegendary: 'Legendary',

  // Missions & Trophies
  missionsTabDaily: 'Daily Missions',
  missionsTabAchievements: 'Achievements',
  dailyResetsIn: 'Resets in',
  missionsCompletedCount: 'Completed',
  achievementsCompletedCount: 'Trophies Won',

  // Player Stats
  statsTitle: 'Player Statistics',
  statsSubtitle: 'Lifetime career gameplay records and achievements',
  statTotalRuns: 'Total Runs',
  statTotalFood: 'Total Orbs Eaten',
  statHighestScore: 'High Score',
  statLongestSnake: 'Longest Snake',
  statTotalPlayTime: 'Total Play Time',
  statTotalCoins: 'Total Coins Won',
  statGoldenFood: 'Golden Apples',
  statChallengesDone: 'Challenges Won',

  // Settings
  settingsTitle: 'Settings',
  settingsSubtitle: 'Configure audiovisuals, controls, and accessibility',
  sectionAudio: 'Audio & Haptics',
  soundFx: 'Sound Effects',
  soundFxDesc: 'Crunch, collision, and interface feedback sounds',
  music: 'Background Music',
  musicDesc: 'Energizing retro synthwave soundtrack',
  haptics: 'Haptic Feedback',
  hapticsDesc: 'Tactile vibration feedback on turns and collisions',
  sectionControls: 'Control Setup',
  controlsType: 'Primary Controls',
  controlsSwipe: 'Swipe Gestures',
  controlsDpad: 'Virtual D-Pad',
  controlsBoth: 'Hybrid (Swipe + D-Pad)',
  sectionAccessibility: 'Accessibility',
  reducedMotion: 'Reduced Motion',
  reducedMotionDesc: 'Softens screen shakes, intense flashes, and particles',
  highContrast: 'High Contrast Mode',
  highContrastDesc: 'Boosts outline visibility on snake, walls, and food items',
  sectionLanguage: 'Language / Dil',
  languageSelect: 'App Language',
  sectionData: 'Data Management',
  resetProgress: 'Reset Progress',
  resetConfirm: 'All high scores, unlocked skins, and coins will be permanently reset. Proceed?',
  resetSuccess: 'Progress reset.',

  // Challenges
  challengesTitle: 'Challenge Mazes',
  challengesSubtitle: 'Conquer tactical obstacle courses and time trials for rich rewards',
  stageTargetScore: 'Target Score',
  stageTargetLength: 'Target Length',
  stageTimeLimit: 'Time Limit',
  startChallenge: 'START STAGE',
};

export function getTranslations(lang: Language = 'tr'): Translations {
  return lang === 'en' ? EN : TR;
}

// Localized Skin Details
export const LOCALIZED_SKINS: Record<
  Language,
  Record<SkinId, { name: string; description: string }>
> = {
  tr: {
    emerald: {
      name: 'Zümrüt Çekirdek',
      description: 'Klasik parlak yeşim ve zümrüt ışıltılı ikonik yılan kostümü.',
    },
    neon_lime: {
      name: 'Neon Yeşil',
      description: 'Yüksek voltajlı radyoaktif parlaklığa sahip enerjik kostüm.',
    },
    cyber_cyan: {
      name: 'Siber Camgöbeği',
      description: 'Gelişmiş optik devre hatları ve dijital parıltılarla donatılmış siber görünüm.',
    },
    solar_gold: {
      name: 'Güneş Altını',
      description: 'Yoğunlaştırılmış güneş ışığından dövülmüş ışıltılı altın zırh.',
    },
    violet_pulse: {
      name: 'Mor Dalga',
      description: 'Ritmik morötesi dalgalar yayan manyetik kozmik kostüm.',
    },
    arctic_ice: {
      name: 'Kutup Ayazı',
      description: 'Buz kristallerinden örülmüş dondurucu ve keskin kutup zırhı.',
    },
    crimson: {
      name: 'Kızıl Öfke',
      description: 'Yeraltının erimiş lavlarını ve akkor közlerini barındıran alevli kostüm.',
    },
    ocean: {
      name: 'Derin Okyanus',
      description: 'Biyolüminesan deniz canlılarının ışıltısını taşıyan su altı kostümü.',
    },
    galaxy: {
      name: 'Kozmik Galaksi',
      description: 'İçinde dönen uzak yıldız kümelerini ve nebulaları barındıran göksel tasarım.',
    },
    retro_pixel: {
      name: 'Retro 8-Bit',
      description: 'Nostaljik atari salonlarına saygı duruşu niteliğinde pikselli arcade kostümü.',
    },
    prism: {
      name: 'Prizma Spektrumu',
      description: 'Işığı tüm gökkuşağı tonlarına ayıran büyüleyici kristal yılan.',
    },
    shadow: {
      name: 'Hayalet Gölge',
      description: 'Karanlıkta görünmez olan gizemli karbon nanotüp tasarımı.',
    },
  },
  en: {
    emerald: {
      name: 'Emerald Core',
      description: 'The iconic sleek jade and radiant emerald serpentine skin.',
    },
    neon_lime: {
      name: 'Neon Lime',
      description: 'Electric radioactive lime with a high-voltage luminous aura.',
    },
    cyber_cyan: {
      name: 'Cyber Cyan',
      description: 'High-tech fiber optics with glowing computational circuit traces.',
    },
    solar_gold: {
      name: 'Solar Gold',
      description: 'Forged from concentrated sunlight with a shimmering metallic gleam.',
    },
    violet_pulse: {
      name: 'Violet Pulse',
      description: 'Deep ultraviolet wavelengths with rhythmic magenta phase waves.',
    },
    arctic_ice: {
      name: 'Arctic Ice',
      description: 'Glacial blue crystal scales trailing sub-zero frost particles.',
    },
    crimson: {
      name: 'Crimson Fury',
      description: 'Infernal volcanic scales radiating glowing molten magma heat.',
    },
    ocean: {
      name: 'Abyssal Ocean',
      description: 'Bioluminescent deep-sea voyager with flowing aquatic currents.',
    },
    galaxy: {
      name: 'Cosmic Galaxy',
      description: 'Starlight nebula embedded in a deep space event horizon.',
    },
    retro_pixel: {
      name: 'Retro 8-Bit',
      description: 'Classic arcade tribute with sharp pixel borders and nostalgic charm.',
    },
    prism: {
      name: 'Prism Spectrum',
      description: 'Living crystalline lattice refracting light into dynamic rainbow hues.',
    },
    shadow: {
      name: 'Phantom Shadow',
      description: 'Stealth obsidian phantom with ethereal smoke trails.',
    },
  },
};

// Localized Achievements
export const LOCALIZED_ACHIEVEMENTS: Record<
  Language,
  Record<string, { title: string; description: string }>
> = {
  tr: {
    first_food: {
      title: 'İlk Lokma',
      description: 'İlk enerji küresini afiyetle tüket.',
    },
    length_20: {
      title: 'Kırkayak',
      description: 'Yılanının boyunu 20 parçaya ulaştır.',
    },
    length_35: {
      title: 'Mistik Ejder',
      description: '35 parça uzunluğa eriş.',
    },
    length_50: {
      title: 'Dünya Yılanı',
      description: '50 parçalık efsanevi boyuta ulaş.',
    },
    score_500: {
      title: 'Yüksek Uçuş',
      description: 'Tek bir oyunda 500 veya üzeri skor yap.',
    },
    score_1000: {
      title: 'Arcade Efsanesi',
      description: 'Klasik modda 1.000 skora ulaş.',
    },
    golden_10: {
      title: 'Altın Hazinesi',
      description: 'Toplamda 10 adet altın elma topla.',
    },
    combo_5: {
      title: 'Kombo Ustası',
      description: 'Hızlıca yem toplayarak 5x kombo yap.',
    },
    combo_10: {
      title: 'Durmaksızın',
      description: 'Muhteşem bir seriyle 10x kombo yap.',
    },
    challenges_all: {
      title: 'Bölüm Şampiyonu',
      description: 'Tüm meydan okuma bölümlerini başarıyla tamamla.',
    },
    speed_demon: {
      title: 'Hız Canavarı',
      description: 'Hızlandırma gücü etkinken 5 yem topla.',
    },
    shield_save: {
      title: 'Mucizevi Kurtuluş',
      description: 'Kalkan kullanarak ölümcül bir çarpmadan sağ çık.',
    },
  },
  en: {
    first_food: {
      title: 'First Bite',
      description: 'Consume your very first energy orb.',
    },
    length_20: {
      title: 'Centipede',
      description: 'Grow your serpent to a length of 20 segments.',
    },
    length_35: {
      title: 'Mythic Drake',
      description: 'Reach a length of 35 segments.',
    },
    length_50: {
      title: 'World Serpent',
      description: 'Attain the legendary length of 50 segments.',
    },
    score_500: {
      title: 'High Roller',
      description: 'Achieve a score of 500 or more in a single run.',
    },
    score_1000: {
      title: 'Arcade Legend',
      description: 'Score 1,000 points in Classic mode.',
    },
    golden_10: {
      title: 'Golden Hoard',
      description: 'Collect a cumulative total of 10 golden energy orbs.',
    },
    combo_5: {
      title: 'Combo Master',
      description: 'Maintain a 5x combo multiplier by feeding quickly.',
    },
    combo_10: {
      title: 'Unstoppable Flow',
      description: 'Execute an electrifying 10x chain combo.',
    },
    challenges_all: {
      title: 'Gauntlet Conqueror',
      description: 'Triumph over all handcrafted challenge stages.',
    },
    speed_demon: {
      title: 'Speed Demon',
      description: 'Eat 5 food items while speed-boosted.',
    },
    shield_save: {
      title: 'Aegis Guardian',
      description: 'Survive a lethal impact with an active energy shield.',
    },
  },
};

// Localized Daily Missions
export const LOCALIZED_MISSIONS: Record<
  Language,
  Record<string, { title: string; description: string }>
> = {
  tr: {
    daily_eat_20: {
      title: 'Günün Ziyafeti',
      description: 'Herhangi bir modda 20 enerji küresi topla.',
    },
    daily_score_300: {
      title: 'Skor Avcısı',
      description: 'Tek bir oyunda 300 puana ulaş.',
    },
    daily_zen_60s: {
      title: 'Zen Meditasyonu',
      description: 'Zen modunda en az 60 saniye sakin bir uçuş yap.',
    },
    daily_combo_4: {
      title: 'Seri Hareket',
      description: 'Bir oyunda 4x veya daha yüksek kombo yakala.',
    },
    daily_challenge_win: {
      title: 'Taktiksel Zafer',
      description: 'Herhangi bir meydan okuma bölümünü tamamla.',
    },
  },
  en: {
    daily_eat_20: {
      title: 'Daily Harvest',
      description: 'Consume 20 energy orbs in any game mode.',
    },
    daily_score_300: {
      title: 'Score Climber',
      description: 'Reach a score of 300 points in one match.',
    },
    daily_zen_60s: {
      title: 'Zen Serenity',
      description: 'Slither peacefully in Zen mode for at least 60 seconds.',
    },
    daily_combo_4: {
      title: 'Chain Reaction',
      description: 'Achieve a 4x combo multiplier.',
    },
    daily_challenge_win: {
      title: 'Tactical Triumph',
      description: 'Complete any challenge stage successfully.',
    },
  },
};

// Localized Challenge Stages
export const LOCALIZED_CHALLENGES: Record<
  Language,
  Record<number, { title: string; description: string }>
> = {
  tr: {
    1: {
      title: 'Aşama 1: Neon Koridor',
      description: 'İki paralel engele çarpmadan 120 skora ulaş.',
    },
    2: {
      title: 'Aşama 2: Kutu Labirenti',
      description: 'Köşe koruganlarından kaçın ve 2x çarpanlı elmaları toplayarak 220 skora ulaş.',
    },
    3: {
      title: 'Aşama 3: Kavşak Koşusu',
      description: '75 saniyelik süre bitmeden 300 skoru yakala!',
    },
    4: {
      title: 'Aşama 4: Spiral Akıntı',
      description: 'Daralan sarmal duvarlar arasında 350 skor ve 25 uzunluğa ulaş.',
    },
    5: {
      title: 'Aşama 5: Kalkan Kalesi',
      description: 'Sıkışık pilonlar arasında kalkanları toplayarak 400 skora ulaş.',
    },
  },
  en: {
    1: {
      title: 'Stage 1: Neon Corridor',
      description: 'Navigate two parallel dividing barriers to reach a score of 120.',
    },
    2: {
      title: 'Stage 2: The Box Maze',
      description: 'Four fortified corner bunkers protect bonus 2X multiplier apples.',
    },
    3: {
      title: 'Stage 3: Crossroads Rush',
      description: 'Score 300 points before the 75-second timer runs out!',
    },
    4: {
      title: 'Stage 4: Spiral Vortex',
      description: 'Inward spiral barriers demand sharp turns. Reach 350 points and length 25.',
    },
    5: {
      title: 'Stage 5: Shield Bastion',
      description: 'Dense hazard posts safeguard emergency shields. Conquer 400 points.',
    },
  },
};
