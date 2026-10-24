# Blog operations: ashishtadigiri.com/blog

How the twice-weekly blog is produced and published. Read this first in every scheduled run.

## Schedule
- Posts go live **Tuesday and Friday, 08:30 IST**.
- Drafting runs fire **Monday and Thursday** (the day before), write the next post and send Ash a preview.
- **Review mode until 1 Nov 2026 (inclusive):** a draft only goes live after Ash replies OK in the drafting run's chat. On OK, schedule the publish for 08:30 IST on the publish day with `send_later` in the same session (or publish straight away if that time has passed).
- **From 2 Nov 2026: auto mode.** Draft, run every check, send Ash the preview for information, and schedule the publish for 08:30 IST the next day. If Ash replies "hold" or asks for changes before then, cancel the scheduled publish (`delete_trigger`) and follow his instructions. Ash can ask to switch back to review mode at any time.

## Sources of truth
- Content Generation project docs (Projects tool): `claude/01-engine-rules.md`, `02-brand-positioning-and-proof.md`, `03-platform-specs-and-idea-bank.md`, `04-quality-standard.md`, `05-blog-seo-standard.md`. Every post must pass 04 and 05.
- Writing skills (MIT, Infrasity): `_build/skills/`. Use `blog/templates/news-analysis.md` (or the template that fits), `blog-write`, `stop-slop`, `blog-factcheck`, `blog-geo`, `blog-seo-check`. Ash's project rules win where they conflict: no stock photos, no YouTube embeds, code-drawn charts and diagrams only, no invented experience.

## Repo and generator
- Repo: `ashishtadigiri7-pixel/ashishtadigiri-blog` (public). Attach with `add_repo` (access: push) and clone to `/home/claude/ashishtadigiri-blog`.
- `_build/posts.json`: one object per post (slug, status draft|live, date, title, title_html, dek, excerpt, pillar, read, keyword, keywords, seo_title 50-60 chars, meta 140-155 chars, toc, components, faq, cta, sources, retrieved, disclaimer). Pillars: prop, ai, lab, web, founder.
- `_build/posts/<slug>.html`: article body fragment. Placeholders: `{{CALC}}` (prop-firm risk calculator), `{{PLANNER}}` (agent permission planner), `{{FAQ}}`, `{{CTA}}`, `{{SITE}}` (site origin for internal links). New interactive components go in `build.py` + `templates/blog.js` + `templates/blog.css`, matching the existing design tokens.
- Preview: `python3 _build/build.py --preview <scratchpad>/preview` then publish `<preview>/index.html` with the post page as a supporting file via the Artifact tool (one preview artifact per run).
- Production: `python3 _build/build.py` writes `index.html`, `<slug>/index.html`, `<slug>/og.png`, `feed.xml`, `sitemap.xml` at the repo root. Only `status: live` posts are built.
- **Drafts stay out of GitHub until approved** (the repo is public): keep the draft fragment and posts.json change local; commit only at publish time.

## Publishing
1. Set the post `status` to `live` and `date` to the publish date. Run the production build.
2. Commit (author "Ashish Tadigiri" <ashishtadigiri7@gmail.com>) and push to `main`.
3. Hostinger MCP: `hosting_git_deploy-website-repository` with username `u925201857`, domain `ashishtadigiri.com`, repository_url `https://github.com/ashishtadigiri7-pixel/ashishtadigiri-blog.git`, branch `main`, directory `blog`.
4. Verify with WebFetch that `https://ashishtadigiri.com/blog/<slug>/` shows the new title, then tell Ash it is live with the link.
5. The site's main menu, root sitemap and robots.txt already include the blog. Don't edit root files.

## Editorial rules (summary)
- One real news item from the last 7 days in Ash's fields, cited to primary sources, turned into a method the reader can apply (formula, worked example, decision rule, checklist or tool).
- Rotate pillars; never reuse a primary keyword (check posts.json).
- CTA matches the service (Build / Automate / Scale / Consult) and names a proof-bank project. Free 24-hour project plan at `/#contact`.
- Never invent results, clients, numbers or experience. Mark gaps as [NEED FROM ASHISH: ...] and ask.
- Indian markets: educational only, data at least 3 months old, no trade calls. Prop firms: no affiliate links.
- British spelling. No em dashes, adverbs or stock AI phrases (stop-slop).
- Show Ash under each draft: the quality scores line (04) and the SEO line (05).

## Editorial calendar
| Publish | Pillar | Working topic |
|---|---|---|
| 24 Oct 2026 | prop | Bulenox drawdown cut and Lucid 40% rule (live) |
| 24 Oct 2026 | ai | AI agent permissions after Microsoft's insider guidance (live) |
| Tue 27 Oct | web | Google ranking volatility in October: algorithm update or site problem? A 10-minute triage. Proof: Atlas, Savour, Beacon. CTA: Scale |
| Fri 30 Oct | lab | CME record Q3 volume as hook; "The 7 checks I run before trusting any backtest". Proof: Quant Lab, Oracle. CTA: Build/Consult |
| Following weeks | rotate | Pick from the idea bank (03) where a fresh news hook exists; prefer pillars not used in the previous two posts |
