/**
 * Smart Khmer Anime & Donghua Title Translator & Helper
 * Maps well-known Donghua and Anime titles to natural Khmer names
 * and intelligently transliterates titles that lack explicit translations.
 */

const KNOWN_KHMER_TITLES: Record<string, string> = {
  // Major Donghua
  'tales of herding gods': 'និទានព្រះបុរាណ',
  'mu shen ji': 'និទានព្រះបុរាណ',
  'king of casual cultivators': 'ស្ដេចហាត់ក្បាច់គុណសេរី',
  'battle through the heavens': 'យុទ្ធសិល្ប៍ផ្ដាច់មេឃ (BTTH)',
  'fights break sphere': 'យុទ្ធសិល្ប៍ផ្ដាច់មេឃ',
  'doupo cangqiong': 'យុទ្ធសិល្ប៍ផ្ដាច់មេឃ',
  'soul land': 'ដីគោកដូឡូ',
  'douluo dalu': 'ដីគោកដូឡូ',
  'perfect world': 'ពិភពលោកឥតខ្ចោះ',
  'wanmei shijie': 'ពិភពលោកឥតខ្ចោះ',
  'swallowed star': 'ផ្កាយលេបត្របាក់',
  'tunshi xingkong': 'ផ្កាយលេបត្របាក់',
  'renegade immortal': 'ស៊ាននី អមតៈឧទ្ទាម',
  'xian ni': 'ស៊ាននី អមតៈឧទ្ទាម',
  'a record of a mortals journey to immortality': 'ដំណើរមនុស្សសាមញ្ញក្លាយជាអមតៈ',
  'a record of a mortal journey to immortality': 'ដំណើរមនុស្សសាមញ្ញក្លាយជាអមតៈ',
  'fanren xiu xian zhuan': 'ដំណើរមនុស្សសាមញ្ញក្លាយជាអមតៈ',
  'the great ruler': 'អ្នកគ្រប់គ្រងដ៏អស្ចារ្យ',
  'da zhu zai': 'អ្នកគ្រប់គ្រងដ៏អស្ចារ្យ',
  'martial universe': 'ចក្រវាលយុទ្ធសិល្ប៍ (Wu Dong Qian Kun)',
  'wu dong qian kun': 'ចក្រវាលយុទ្ធសិល្ប៍',
  'shrouding the heavens': 'គ្របដណ្ដប់ផ្ទៃមេឃ (Zhe Tian)',
  'zhe tian': 'គ្របដណ្ដប់ផ្ទៃមេឃ',
  'against the gods': 'ប្រឆាំងនឹងព្រះ (Ni Tian Xie Shen)',
  'ni tian xie shen': 'ប្រឆាំងនឹងព្រះ',
  'apotheosis': 'ការឡើងជាព្រះ',
  'bai lian cheng shen': 'ការឡើងជាព្រះ',
  'stellar transformations': 'ការប្រែប្រួលផ្កាយ',
  'xing chen bian': 'ការប្រែប្រួលផ្កាយ',
  'tomb of fallen gods': 'ផ្នូរទេវតា (Shen Mu)',
  'shen mu': 'ផ្នូរទេវតា',
  'the demon hunter': 'អ្នកប្រមាញ់បិសាច',
  'cang yuan tu': 'អ្នកប្រមាញ់បិសាច',
  'immortality': 'ជីវិតអមតៈ (Yong Sheng)',
  'yong sheng': 'ជីវិតអមតៈ',
  'lord of the mysteries': 'ម្ចាស់នៃអាថ៌កំបាំង',
  'dragons triumph in the celestial realm': 'ជ័យជំនះនាគរាជលើឋានសួគ៌',
  'girl will teach you': 'នារីបង្រៀនអ្នក',
  'the ultimate wantless godly rich system': 'ប្រព័ន្ធព្រះអ្នកមានកំពូល',
  '10000x return': 'ផលចំណេញ ១០,០០០ ដង',
  '100 million lives rewarded at the': 'រង្វាន់ជីវិត ១០០ លាន',
  '100000 years of qi refining': 'មួយសែនឆ្នាំនៃការបន្សុទ្ធឈី',
  '100000 years of refining qi': 'មួយសែនឆ្នាំនៃការបន្សុទ្ធឈី',
  '10000x cashback when goddesses spend': 'ទទួលបានប្រាក់ត្រឡប់មកវិញ ១០,០០០ ដង',
  '10 years of hard work': '១០ ឆ្នាំនៃការខិតខំ',
  '20000 years of physical cultivation': 'ពីរម៉ឺនឆ្នាំនៃការហាត់ក្បាច់គុណកាយ',
  'refine it directly': 'បន្សុទ្ធភ្លាមៗ',
  'peerless martial spirit': 'វិញ្ញាណយុទ្ធគុនឥតគូប្រៀប',
  'supreme god emperor': 'ស្ដេចអធិរាជព្រះកំពូល',
  'spirit sword sovereign': 'ម្ចាស់ដាវវិញ្ញាណ',
  'martial master': 'មេដឹកនាំយុទ្ធសិល្ប៍',
  'ten thousand worlds': 'មួយម៉ឺនពិភពលោក',
  'tales of demons and gods': 'ដំណើរផ្សងព្រេងបិសាចនិងព្រះ',
  'full-time magister': 'មន្តអាគមពេញម៉ោង (Versatile Mage)',
  'versatile mage': 'មន្តអាគមពេញម៉ោង',
  'quanzhi fashi': 'មន្តអាគមពេញម៉ោង',
  'the kings avatar': 'រូបតំណាងស្ដេច (The King\'s Avatar)',
  'quanzhi gaoshou': 'កំពូលអ្នកជំនាញ (The King\'s Avatar)',
  'scumbag system': 'ប្រព័ន្ធមនុស្សកំណាច',
  'grandmaster of demonic cultivation': 'មេដឹកនាំមន្តខ្មៅ (Mo Dao Zu Shi)',
  'mo dao zu shi': 'មេដឹកនាំមន្តខ្មៅ',
  'heaven officials blessing': 'ពរជ័យមន្ត្រីឋានសួគ៌',
  'tian guan ci fu': 'ពរជ័យមន្ត្រីឋានសួគ៌',
  'link click': 'ចុចភ្ជាប់ពេលវេលា (Shiguang Dailiren)',
  'shiguang dailiren': 'ចុចភ្ជាប់ពេលវេលា',
  'solo leveling': 'ការឡើងកម្រិតតែម្នាក់ឯង',
  'jujutsu kaisen': 'មន្តអាគមបិសាច',
  'demon slayer': 'អ្នកកម្ចាត់បិសាច (Kimetsu no Yaiba)',
  'attack on titan': 'ការវាយលុកនៃយក្ស',
  'naruto': 'ណារូតូ',
  'one piece': 'វ៉ាន់ភីស (ស្ដេចចោរសមុទ្រ)',
  'bleach': 'ប្ល៊ិច (ទេវតាការពារព្រលឹង)',
  'dragon ball': 'ដ្រាហ្គនបល (គ្រាប់ឃ្លីនាគ)',
}

const WORD_DICTIONARY: [RegExp, string][] = [
  [/\bking of\b/gi, 'ស្ដេចនៃ'],
  [/\bgod of\b/gi, 'ព្រះនៃ'],
  [/\blord of\b/gi, 'ម្ចាស់នៃ'],
  [/\btales of\b/gi, 'និទាន'],
  [/\brecord of\b/gi, 'កំណត់ត្រា'],
  [/\bimmortal\b/gi, 'អមតៈ'],
  [/\bcultivation\b/gi, 'ហាត់ក្បាច់គុណ'],
  [/\bcultivator\b/gi, 'អ្នកហាត់ក្បាច់គុណ'],
  [/\bcultivators\b/gi, 'អ្នកហាត់ក្បាច់គុណ'],
  [/\bdragon('s)?\b/gi, 'នាគ'],
  [/\bdemon\b/gi, 'បិសាច'],
  [/\bdemons\b/gi, 'បិសាច'],
  [/\bgodly\b/gi, 'ទេវៈ'],
  [/\bgod\b/gi, 'ព្រះ'],
  [/\bheavenly\b/gi, 'ឋានសួគ៌'],
  [/\bheavens\b/gi, 'ផ្ទៃមេឃ'],
  [/\bheaven\b/gi, 'ឋានសួគ៌'],
  [/\bcelestial\b/gi, 'ឋានសួគ៌'],
  [/\bmartial\b/gi, 'យុទ្ធសិល្ប៍'],
  [/\bspirit\b/gi, 'វិញ្ញាណ'],
  [/\bsword\b/gi, 'ដាវ'],
  [/\bsupreme\b/gi, 'កំពូល'],
  [/\bpeerless\b/gi, 'ឥតគូប្រៀប'],
  [/\bsovereign\b/gi, 'អធិបតី'],
  [/\bemperor\b/gi, 'អធិរាជ'],
  [/\bsystem\b/gi, 'ប្រព័ន្ធ'],
  [/\brich\b/gi, 'អ្នកមាន'],
  [/\bworld\b/gi, 'ពិភពលោក'],
  [/\bworlds\b/gi, 'ពិភពលោក'],
  [/\breturn\b/gi, 'ត្រឡប់មកវិញ'],
  [/\brebirth\b/gi, 'ចាប់កំណើតឡើងវិញ'],
  [/\breincarnation\b/gi, 'ចាប់កំណើតថ្មី'],
  [/\bmaster\b/gi, 'គ្រូកំពូល'],
  [/\bhunter\b/gi, 'អ្នកប្រមាញ់'],
  [/\bmagic\b/gi, 'មន្តអាគម'],
  [/\bmage\b/gi, 'អ្នកវេទមន្ត'],
  [/\bavatar\b/gi, 'រូបតំណាង'],
  [/\bjourney\b/gi, 'ដំណើរផ្សងព្រេង'],
  [/\badventure\b/gi, 'ដំណើរផ្សងព្រេង'],
  [/\bstar\b/gi, 'ផ្កាយ'],
  [/\blegend of\b/gi, 'រឿងព្រេងនៃ'],
  [/\bsecret\b/gi, 'អាថ៌កំបាំង'],
  [/\bmystery\b/gi, 'អាថ៌កំបាំង'],
  [/\bmovie\b/gi, 'ភាពយន្ត'],
  [/\bspecial\b/gi, 'វគ្គពិសេស'],
]

/**
 * Return a clean Khmer title for any English or Chinese anime/donghua title.
 */
export function getKhmerTitle(name: string, synonyms?: string | null): string {
  if (!name) return ''
  const clean = name.toLowerCase().trim()

  // 1. Direct match in dictionary
  if (KNOWN_KHMER_TITLES[clean]) {
    return KNOWN_KHMER_TITLES[clean]
  }

  // 2. Match without punctuation
  const stripped = clean.replace(/[^a-z0-9\s]/g, '').trim()
  if (KNOWN_KHMER_TITLES[stripped]) {
    return KNOWN_KHMER_TITLES[stripped]
  }

  // 3. Check partial keys
  for (const [key, km] of Object.entries(KNOWN_KHMER_TITLES)) {
    if (clean.startsWith(key) || clean.includes(key)) {
      return km
    }
  }

  // 4. Check synonyms
  if (synonyms) {
    const synList = synonyms.split(',').map((s) => s.trim().toLowerCase())
    for (const s of synList) {
      if (KNOWN_KHMER_TITLES[s]) return KNOWN_KHMER_TITLES[s]
    }
  }

  // 5. Intelligent phrase replacement
  let translated = name
  let matched = false
  for (const [regex, kmWord] of WORD_DICTIONARY) {
    if (regex.test(translated)) {
      matched = true
      translated = translated.replace(regex, kmWord)
    }
  }

  if (matched) {
    return translated
  }

  // Fallback: Return original name
  return name
}
