# THE BOYZ TikTok Archive — YouTube player version

Jedna galeria dla pięciu kont TikTok. Metadane są synchronizowane z publicznego arkusza Google co 6 godzin.

## Odtwarzanie

Filmy są osadzane z YouTube. Skrypt rozpoznaje m.in.:

- `https://www.youtube.com/shorts/2Fcq2g-CEIc`
- `https://www.youtube.com/watch?v=2Fcq2g-CEIc`
- `https://youtu.be/2Fcq2g-CEIc`
- `https://www.youtube.com/embed/2Fcq2g-CEIc`

Do iframe używany jest `youtube-nocookie.com/embed/VIDEO_ID`. Niepubliczne (unlisted) filmy YouTube działają w embedzie, o ile osadzanie nie zostało wyłączone przez właściciela filmu.

## Arkusz Google

Źródło: `https://docs.google.com/spreadsheets/d/1C0DP7DKN5QCO5GXdNDWYmvuK8RtGEkYp/edit`

Rozpoznawane kolumny:

- `Data`
- `Opis TikToka`
- `Hashtagi`
- `Członkowie`
- `Link TikTok`
- `Link Youtube`
- `Link Google Drive`

`Link TikTok` jest wymagany. `Link Youtube` odpowiada za odtwarzacz. `Link Google Drive` odpowiada wyłącznie za tekstowy link do pobrania.

Arkusz musi być udostępniony jako **Anyone with the link / Viewer**.

## Automatyczna aktualizacja

`.github/workflows/update-tiktok.yml` uruchamia synchronizację co 6 godzin i może być też uruchomiony ręcznie przez `Run workflow`.

## Filtrowanie członków

Filtr korzysta przede wszystkim z kolumny `Members` / `Członkowie` w arkuszu. Jeżeli komórka jest pusta, członkowie są rozpoznawani z opisu i hashtagów filmu. `Q` obejmuje również nazwę `Changmin`, a `NEW` obejmuje również `Chanhee`; aliasy nie są wyświetlane w nazwach opcji. Interfejs strony jest dostępny wyłącznie po angielsku.
