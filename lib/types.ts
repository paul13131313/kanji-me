export interface Character {
  kanji: string;
  reading: string;
  meaning: string;
  description: string;
}

export interface KanjiResult {
  katakana: string;
  kanji: string;
  story: string;
  characters: Character[];
}
