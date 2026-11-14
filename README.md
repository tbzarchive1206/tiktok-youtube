## Odtwarzanie

Filmy są osadzane z YouTube. Skrypt rozpoznaje m.in.:

- `https://www.youtube.com/shorts/2Fcq2g-CEIc`
- `https://www.youtube.com/watch?v=2Fcq2g-CEIc`
- `https://youtu.be/2Fcq2g-CEIc`
- `https://www.youtube.com/embed/2Fcq2g-CEIc`

Do iframe używany jest `youtube-nocookie.com/embed/VIDEO_ID`. Niepubliczne (unlisted) filmy YouTube działają w embedzie, o ile osadzanie nie zostało wyłączone przez właściciela filmu.

## Arkusz Google

Źródło: `https://docs.google.com/spreadsheets/d/1C0DP7DKN5QCO5GXdNDWYmvuK8RtGEkYp/edit`

## Filtrowanie według członków

Filtr korzysta wyłącznie z kolumny `Członkowie THE BOYZ`, importowanej do pola `members` w `data.js`. Opisy i hashtagi nie wpływają na dopasowanie. Wartości `THE BOYZ` i `All members` oznaczają cały zespół i pasują do każdego członka. Puste pole nie pasuje do konkretnego członka.

Po zmianie arkusza uruchom synchronizację GitHub Actions lub poczekaj na harmonogram (co 6 godzin). Import przerywa działanie bez nadpisania danych, jeśli brakuje kolumny członków.

Testy: `node scripts/test_member_filter.cjs` oraz `python scripts/test_update_tiktok_data.py` (wymagane openpyxl).
