# Hero backdrop reel — sources and how these files were made

Six clips play as a crossfading loop behind the hero. They are derived binaries:
this file is what makes them reproducible, so nobody has to guess where a frame
came from or re-derive the encoding settings.

## Licensing

| Source | Licence | Commercial use | Attribution |
| --- | --- | --- | --- |
| Pexels | [Pexels License](https://www.pexels.com/license/) | yes | not required |
| Mixkit | [Mixkit License](https://mixkit.co/license/) | yes | not required |

Neither licence permits redistributing the clips as stock footage. Using them as
a website backdrop is explicitly allowed.

## The clips

Reel order alternates shot scale and brightness, so no two neighbouring shots
read the same. Order is set in `src/lib/components/landing/Hero.svelte`.

| File | Shot | Source | Original |
| --- | --- | --- | --- |
| `crowd.mp4` | close, dark | Mixkit 48510 | [crowd close-up, slow motion](https://mixkit.co/free-stock-video/a-close-up-shot-in-slow-motion-captures-the-crowd-at-48510/) |
| `shoulders.mp4` | wide, bright | Pexels 30328826 | [on shoulders against the sky](https://www.pexels.com/video/excited-concert-crowd-with-attendees-on-shoulders-30328826/) |
| `singer.mp4` | stage | Mixkit 474 | [singer on stage](https://mixkit.co/free-stock-video/a-female-singer-on-the-stage-474/) |
| `phones.mp4` | wide, dark | Pexels 36499729 | [arena of phone lights](https://www.pexels.com/video/vibrant-auditorium-concert-with-cheering-crowd-36499729/) |
| `cheering.mp4` | close, bright | Pexels 3722009 | [faces cheering, daylight](https://www.pexels.com/video/group-of-happy-people-cheering-and-waving-their-hands-3722009/) |
| `confetti.mp4` | burst | Pexels 34636825 | [confetti over the stage](https://www.pexels.com/video/energetic-night-concert-with-confetti-34636825/) |

Each `.jpg` is frame one of its `.mp4`, used as the `poster` so the backdrop
paints before any video is fetched.

## Why the files are greyscale

The hero applies a CSS grade whose first step is `grayscale(1)` (see `--grade` in
`Hero.svelte`), then re-tints to brand gold. Colour in the source is therefore
discarded at render time. Encoding greyscale flattens the chroma planes and
halves the file size with no visible difference: **7.0 MB → 3.67 MB** across the
reel.

The trade-off: dialling the grade back toward the original venue colours is no
longer possible from these files. Re-encode from the sources above if that is
ever wanted.

## Reproducing a clip

Fetching a specific rendition from Pexels, without scraping the page:

```bash
# 720p landscape
curl -L -o src.mp4 "https://www.pexels.com/download/video/<ID>/?h=720&w=1280"
# the tall master used for confetti
curl -L -o src.mp4 "https://www.pexels.com/download/video/34636825/?h=3840&w=2160"
```

Mixkit serves fixed renditions directly:

```bash
curl -L -o src.mp4 "https://assets.mixkit.co/videos/<ID>/<ID>-720.mp4"
```

Encoding — six seconds, no audio, greyscale, `faststart` so playback can begin
before the file finishes downloading:

```bash
ffmpeg -ss <START> -t 6 -i src.mp4 -an \
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=25,format=gray,format=yuv420p" \
  -c:v libx264 -profile:v high -crf 31 -preset slow -pix_fmt yuv420p -movflags +faststart out.mp4
ffmpeg -i out.mp4 -frames:v 1 -q:v 5 out.jpg
```

Start offsets: crowd 2.0, shoulders 3.0, singer 3.0, phones 8.0, cheering 4.0,
confetti 1.0.

`confetti.mp4` is the exception twice over. Its source is vertical
(2160×3840), so a 16:9 band is cut from the tall master rather than scaled — at
2160×1215 that band *downsamples* into 720p and stays sharp, where the same crop
taken from the 720p rendition would have to be blown up almost 2×. It also
carries far more moving detail than the other clips, so it is encoded at
`-crf 33`:

```bash
-vf "crop=2160:1215:0:2450,scale=1280:720,fps=25,format=gray,format=yuv420p"
```

The `2450` offset places the band across the stage, catching the guitarist, the
screen, the confetti and the front row in one frame.
