# News Diary — instructions for Claude

A personal news app for a beginner's class project. The user is new to coding,
Git, and GitHub: explain everything in plain language, no jargon, and work in
small steps they can check.

## Hard rules
- The app is a static website: `index.html`, `style.css`, `app.js`. Plain HTML/CSS/JS, no frameworks.
- No Python, no Node, no installs, no paid API keys. The app has no AI inside it.
  Claude does all the smart work (fetching, ranking, saving, writing the diary) when asked.
- Data lives in `data/*.js` files so the page works both when double-clicked and when hosted.
  Each file is exactly `window.<name> = <valid JSON>;` and must stay valid JSON after the `=`.
- Use only RSS headlines, summaries, and links. Never copy full or paywalled article text.
  Summaries should be at most ~2 sentences.
- Everything in this folder is public on GitHub Pages. Never put passwords, keys, tokens,
  emails, or other personal/secret info in any file here.
- Never touch the old `../news-app` folder (an earlier Python version).

## Files
- `preferences.md`: the user's interests. **Always read it before ranking.**
- `feedback.md`: the user's likes/dislikes. **Always read it before ranking.**
- `sources.md`: the RSS feeds to fetch.
- `data/picks.js`: `window.picks = { "date": "YYYY-MM-DD", "articles": [ {title, link, source, summary, published, kind, topic, reason} ] }`
  - `kind` is `"opinion"` or `"news"`; `reason` is ONE sentence on why it was picked for this user.
- `data/library.js`: `window.library = [ {title, link, source, summary, note, saved, topic} ]`, newest first. `note` may be `""`.
- `data/diary.js`: `window.diary = [ {date, intro, topics: [ {name, developing, disagree, changed, links: [ {title, link} ]} ]} ]`, newest first. Never delete past entries.
- `data/seen.js`: `window.seen = [ "link", ... ]`: every link ever shown in picks, used to skip duplicates.

## Commands

### "morning update"
1. Read `preferences.md`, `feedback.md`, `sources.md`, and `data/seen.js`.
2. Fetch every feed in `sources.md` and read it as XML, which handles all the feeds' formats:
   `[xml]$x = (Invoke-WebRequest <url> -UseBasicParsing).Content`, then for each `$x.rss.channel.item`
   use `.title.InnerText`, `.link`, `.description.InnerText` (strip HTML tags), `.pubDate`.
   (Plain `Invoke-RestMethod` loses BBC titles and Ars summaries.) If a feed fails, skip it and tell the user.
   Skip BBC "Tech Life"/"Tech Now" audio/video episodes.
3. Drop articles whose link is already in `seen.js`, and near-duplicates (same story from two feeds: keep the better one).
   Strip tracking bits like `?utm_...` from links before comparing.
4. Rank and pick the top 10: favor the user's main interests, mix opinion and news,
   no more than 4 from one source, avoid the "less interested" topics. Use feedback to adjust.
5. Write `data/picks.js` (today's date, each with a one-sentence `reason`), and add the 10 links to `data/seen.js`.
6. Publish (see below), then tell the user in 2-3 plain sentences what's in today's picks.

### "save this: [link], note: [note]"
1. Fetch the link to get the title, source, and a short summary (from the page's description/RSS-style metadata only,
   never the article body). If it's already in today's picks, reuse that info.
2. Add it to the TOP of `data/library.js` with today's date as `saved`, the note (or `""`), and a short `topic`.
   If the link is already in the library, update the note instead of adding a duplicate.
3. Publish.

### "update my diary"
1. Read `data/library.js`, recent `data/picks.js`, and the latest entry in `data/diary.js`.
2. Group what the user has been reading into topics. For each topic write:
   `developing` (what's unfolding), `disagree` (where sources or viewpoints differ; say "No clear disagreement yet" if none),
   and `changed` (what's new since the previous entry; for the first entry say so).
3. Add the new entry to the TOP of `data/diary.js` with today's date. Keep all old entries.
4. Publish.

### "I liked [article]" / "I disliked [article]"
1. Find the article in picks or the library (match by title words or link).
2. Add a line under Liked or Disliked in `feedback.md`: `- YYYY-MM-DD: Title (Source), topic`, plus a few words on why if the user gave a reason.
3. Confirm briefly. (No publish needed, since feedback isn't shown on the site, but it's fine if it goes out with the next publish.)

## Publishing
- Run Git commands from inside this `news-diary` folder: `git add -A`, `git commit -m "<short message>"`, `git push`.
- If `git` isn't recognized, run `$env:Path += ';C:\Program Files\Git\cmd'` first in the same command.
- Before committing, glance at what changed and make sure nothing secret is included.
- If Git is not set up yet, skip publishing and tell the user the site was updated on their computer only.
