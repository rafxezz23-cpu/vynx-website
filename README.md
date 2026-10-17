# ! vynx — strona profilowa

Osobista strona-wizytówka użytkownika Discorda **! vynx** (`1vynx`). Dane profilu (avatar, banner, nick, kolory nicku, tag serwera) są pobierane na żywo z Discorda na podstawie jego ID: `943108101492580362`.

---

## Technologie

| Warstwa | Technologia | Do czego |
|---|---|---|
| Bundler / dev server | [Vite 6](https://vite.dev) | uruchamianie lokalnie, hot reload, build produkcyjny |
| Język | [TypeScript 5](https://www.typescriptlang.org) | cała logika strony (`src/main.ts`) |
| Style | [Tailwind CSS 4](https://tailwindcss.com) (`@tailwindcss/vite`) | cały wygląd, własne kolory, animacje i komponenty |
| Ikony | [Lucide](https://lucide.dev) | ikonki UI (strzałki, kopiowanie, kalendarz…) |
| Logo marek | inline SVG | Discord, Spotify |
| Czcionki | [Fontsource](https://fontsource.org) (lokalnie, bez Google Fonts) | Pixelify Sans (nick), Space Grotesk (nagłówki), Inter (tekst), JetBrains Mono |
| Animacje | CSS + Canvas 2D + IntersectionObserver | intro, pojawianie się sekcji, spadające krzyże w tle |

### Frontend vs backend

- **Frontend** — wszystko w tym repo. Statyczna strona (HTML + CSS + JS) budowana przez Vite.
- **Backend** — **brak własnego backendu.** Strona korzysta z publicznych API bezpośrednio z przeglądarki:
  - [`japi.rest`](https://japi.rest) — profil Discorda (avatar, banner, nick, kolory, tag klanu),
  - [`api.lanyard.rest`](https://github.com/Phineas/lanyard) — status online/offline (działa tylko gdy user jest na serwerze `discord.gg/lanyard`),
  - `cdn.discordapp.com` — obrazki avatara, bannera i odznaki klanu,
  - Spotify — tylko linki do profilu.

Dzięki temu stronę można wrzucić na dowolny darmowy hosting statyczny.

---

## Struktura

```
VYNYX WEBSITE/
├─ index.html        # cały układ strony (klasy Tailwinda)
├─ src/
│  ├─ main.ts        # logika: pobieranie profilu, animacje, kursor, kopiowanie
│  └─ style.css      # Tailwind: motyw (kolory, czcionki), komponenty, keyframes
├─ public/
│  └─ kakobuy.ico    # ikonka KakoBuy
├─ vite.config.ts    # Vite + plugin Tailwind
├─ tsconfig.json
└─ package.json
```

---

## Jak to działa

1. **Profil** — `loadProfile()` w `main.ts` pobiera `https://japi.rest/discord/v1/user/<ID>` i podmienia avatar, banner, nick, tag `REP¥` z odznaką oraz favicon.
2. **Kolor nicku** — z pola `display_name_styles.colors` brane są 4 kolory (`#C4ED65 → #45BC66`) i ustawiane jako zmienne CSS `--n1..--n4`. Klasa `.name-grad` robi z nich przesuwający się gradient.
3. **Data konta** — wyliczana z samego ID (Discord snowflake: `(ID >> 22) + 1420070400000` = timestamp w ms).
4. **Animacje**
   - nick wjeżdża litera po literze (`[data-split]` + `.char`),
   - karta profilu przechyla się w 3D za kursorem,
   - sekcje pojawiają się z blurem przy scrollu (`.rv` + `IntersectionObserver`),
   - liczniki odliczają w górę,
   - przyciski „magnetyczne” przyciągają się do kursora,
   - w tle na `<canvas>` spadają zielone krzyże,
   - pasek postępu scrolla i chowające się menu.
5. **Dostępność** — przy `prefers-reduced-motion` animacje są wyłączane.

---

## Jak uruchomić

Wymagany [Node.js](https://nodejs.org) 18+.

```bash
npm install      # instalacja zależności
npm run dev      # serwer lokalny → http://localhost:5173
npm run build    # build produkcyjny do folderu dist/
npm run preview  # podgląd zbudowanej wersji
```

## Jak zrobić to od zera

```bash
npm init -y
npm i -D vite typescript tailwindcss @tailwindcss/vite
npm i lucide @fontsource-variable/inter @fontsource-variable/space-grotesk \
      @fontsource-variable/pixelify-sans @fontsource-variable/jetbrains-mono
```

1. `vite.config.ts` — dodaj plugin `tailwindcss()`.
2. `src/style.css` — `@import "tailwindcss";` + własny `@theme` (kolory, czcionki, animacje).
3. `index.html` — podepnij `/src/style.css` i `<script type="module" src="/src/main.ts">`.
4. `src/main.ts` — fetch do API, `createIcons({ icons })` z Lucide, animacje.

## Deploy

Folder `dist/` po `npm run build` wrzucasz na:
- **Vercel** / **Netlify** — podpinasz repo, build: `npm run build`, output: `dist`,
- **GitHub Pages** / **Cloudflare Pages** — tak samo.

---

## Co zmienić

- **Inna osoba** — zmień `DISCORD_ID` w `src/main.ts` oraz domyślne linki do avatara w `index.html`.
- **Linki** — sekcja `<!-- LINKI -->` w `index.html`.
- **Kolory** — `@theme` w `src/style.css` (`--color-acid`, `--color-acid2`).
- **Status online** — użytkownik musi dołączyć na `discord.gg/lanyard`.

© 2026 ! vynx
