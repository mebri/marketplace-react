export function extractCityAndSubcity(rawText: string): { city: string; subcity: string } {
  const lower = (rawText || '').toLowerCase();
  const subcityMap: Array<{ regex: RegExp; label: string }> = [
    { regex: /bole\s*bulbula|ቦሌ\s*ቡልቡላ/i, label: 'Bole Bulbula' },
    { regex: /bole\s*medhanialem|ቦሌ\s*መድሃኒያለም/i, label: 'Bole Medhanialem' },
    { regex: /bole\s*atlas|ቦሌ\s*አትላስ/i, label: 'Bole Atlas' },
    { regex: /bole\s*arabsa|ቦሌ\s*አራብሳ/i, label: 'Bole Arabsa' },
    { regex: /bole|ቦሌ/i, label: 'Bole' },
    { regex: /summit|ሰሚት/i, label: 'Summit' },
    { regex: /\bcmc\b|ሲኤምሲ/i, label: 'CMC' },
    { regex: /ayat|አያት/i, label: 'Ayat' },
    { regex: /kazanchis|ካዛንቺስ/i, label: 'Kazanchis' },
    { regex: /sarbet|ሳርቤት/i, label: 'Sarbet' },
    { regex: /gerji|ገርጂ/i, label: 'Gerji' },
    { regex: /megenagna|መገናኛ/i, label: 'Megenagna' },
    { regex: /piassa|piazza|ፒያሳ/i, label: 'Piassa' },
    { regex: /lebu|ለቡ/i, label: 'Lebu' },
    { regex: /jemo|ጀሞ/i, label: 'Jemo' },
    { regex: /figa|ፊጋ/i, label: 'Figa' },
    { regex: /hayahulet|22\s*mazoria|ሃያ\s*ሁለት|ሀያሁለት/i, label: 'Hayahulet' },
    { regex: /saris|ሳሪስ/i, label: 'Saris' },
    { regex: /kality|akaki|ቃሊቲ|አቃቂ/i, label: 'Akaki Kality' },
    { regex: /tulu\s*dimtu|ቱሉ\s*ዲምቱ/i, label: 'Tulu Dimtu' },
    { regex: /tafo|ጣፎ/i, label: 'Tafo' },
    { regex: /yeka|የካ/i, label: 'Yeka' },
    { regex: /lemi\s*kura|ለሚ\s*ኩራ/i, label: 'Lemi Kura' },
    { regex: /kirkos|ቂርቆስ/i, label: 'Kirkos' },
    { regex: /lideta|ልደታ/i, label: 'Lideta' },
    { regex: /merkato|መርካቶ/i, label: 'Merkato' },
    { regex: /mexico|ሜክሲኮ/i, label: 'Mexico' },
    { regex: /gotera|ጎተራ/i, label: 'Gotera' },
    { regex: /kera|ቄራ/i, label: 'Kera' },
    { regex: /4\s*kilo|አራት\s*ኪሎ/i, label: '4 Kilo' },
    { regex: /6\s*kilo|ስድስት\s*ኪሎ/i, label: '6 Kilo' }
  ];

  let subcity = '';
  for (const s of subcityMap) {
    if (s.regex.test(rawText)) {
      subcity = s.label;
      break;
    }
  }

  if (/(hawassa|awassa|ሀዋሳ|አዋሳ)/i.test(lower)) return { city: 'Hawassa', subcity };
  if (/(adama|nazret|nazreth|አዳማ|ናዝሬት)/i.test(lower)) return { city: 'Adama', subcity };
  if (/(bahir\s*dar|ባህር\s*ዳር|ባሕር\s*ዳር)/i.test(lower)) return { city: 'Bahir Dar', subcity };
  if (/(dire\s*dawa|ድሬዳዋ|ድሬ\s*ዳዋ)/i.test(lower)) return { city: 'Dire Dawa', subcity };
  if (/(mekelle|mekele|መቐለ|መቀሌ)/i.test(lower)) return { city: 'Mekelle', subcity };
  if (/(gondar|gonder|ጎንደር)/i.test(lower)) return { city: 'Gondar', subcity };
  if (/(jimma|ጅማ)/i.test(lower)) return { city: 'Jimma', subcity };
  if (/(dessie|desse|ደሴ)/i.test(lower)) return { city: 'Dessie', subcity };
  if (/(kombolcha|ኮምቦልቻ)/i.test(lower)) return { city: 'Kombolcha', subcity };
  if (/(bishoftu|debre\s*zeit|ቢሾፍቱ|ደብረ\s*ዘይት)/i.test(lower)) return { city: 'Bishoftu', subcity };
  if (/(shashemene|shashamane|ሻሸመኔ)/i.test(lower)) return { city: 'Shashemene', subcity };
  if (/(jigjiga|jijiga|ጅግጅጋ)/i.test(lower)) return { city: 'Jigjiga', subcity };
  if (/(harar|ሐረር|ሀረር)/i.test(lower)) return { city: 'Harar', subcity };
  if (/(arba\s*minch|arbaminch|አርባ\s*ምንጭ)/i.test(lower)) return { city: 'Arba Minch', subcity };
  if (/(hosanna|hosaena|ሆሳዕና)/i.test(lower)) return { city: 'Hosanna', subcity };
  if (/(wolaita|sodo|ወላይታ\s*ሶዶ)/i.test(lower)) return { city: 'Wolaita Sodo', subcity };
  if (/(nekemte|ነቀምቴ)/i.test(lower)) return { city: 'Nekemte', subcity };
  if (/(debre\s*birhan|debre\s*berhan|ደብረ\s*ብርሃን)/i.test(lower)) return { city: 'Debre Birhan', subcity };
  if (/(dilla|ዲላ)/i.test(lower)) return { city: 'Dilla', subcity };
  if (/(assosa|asosa|አሶሳ)/i.test(lower)) return { city: 'Assosa', subcity };
  if (/(semera|ሰመራ)/i.test(lower)) return { city: 'Semera', subcity };
  if (/(gambella|gambela|ጋምቤላ)/i.test(lower)) return { city: 'Gambella', subcity };
  return { city: 'Addis Ababa', subcity };
}
