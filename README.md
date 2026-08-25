# 📇 Kontakty & Poznávání | VOŠ a SPŠ Šumperk

Webová aplikace pro snadné zapamatování kolegů a žáků, evidenci **Tykání / Vykání**, vytváření paměťových poznámek a výuku pomocí **Kvízů (4 možnosti)** a **Flashcards (se Spaced Repetition)**.

## 🌟 Hlavní funkce
- 📇 **63 kontaktů vedení a učitelů**: Načteno z oficiálního webu školy s fotkami, funkcemi a čísly kabinetů (např. 204, D16, 239).
- 🤝 **Evidence Tykání / Vykání**: Sledování stavu s kým si týkáte s možností přenosu na telefon.
- 🎓 **Správa tříd a žáků**: Založení tříd, ruční přidávání žáků.
- ✂️ **Vizuální ořez ze společných fotek**: Interaktivní výřez obličejů žáků ze společné fotky třídy přímo v prohlížeči.
- 🎯 **Kvíz 4 možnosti**: Hra na poznávání jmen a fotek se skóre a sériemi.
- 🃏 **Flashcards (Série po 10 kartách)**: Kartičky s pevnými tlačítky, odhalením jména a okamžitým procvičením chybných kontaktů.
- 🔍 **Velký náhled fotky**: Kliknutím na fotku otevřete detail ve velkém rozlišení.
- 📱 **Multi-profilové ukládání**: Ukládání v mezipaměti prohlížeče (`localStorage`) nezávisle pro každé zařízení/profil.

## 🚀 Jak spustit lokálně

1. **Nainstalujte závislosti**:
   ```bash
   npm install
   ```

2. **Spusťte vývojový server**:
   ```bash
   npm run dev
   ```
   Aplikace poběží na `http://localhost:3000`.

3. **Vytvoření produkční verze**:
   ```bash
   npm run build
   ```

## 🛠️ Technologie
- **React 18** + **Vite**
- **Lucide React** (Ikony)
- **Canvas Confetti** & **Web Audio API**
- **Vanilla CSS Design System** (Dark / Light mode)
