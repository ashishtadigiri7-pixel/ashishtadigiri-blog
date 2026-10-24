#!/usr/bin/env python3
"""Static generator for ashishtadigiri.com/blog.

  python3 _build/build.py            -> production build into the repo root (served at /blog/)
  python3 _build/build.py --preview DIR  -> self-contained preview (Google Fonts, drafts + planned shown)
"""
import json, os, re, sys, html, datetime
from email.utils import format_datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SITE = "https://ashishtadigiri.com"
BASE = SITE + "/blog/"

PREVIEW = "--preview" in sys.argv
OUT = sys.argv[sys.argv.index("--preview") + 1] if PREVIEW else REPO

data = json.load(open(os.path.join(HERE, "posts.json")))
CSS = open(os.path.join(HERE, "templates", "blog.css")).read()
JS = open(os.path.join(HERE, "templates", "blog.js")).read()
PILLARS = data["pillars"]

def esc(s): return html.escape(s, quote=True)
def nice_date(iso): return datetime.date.fromisoformat(iso).strftime("%-d %b %Y")
def site(path): return SITE + path if PREVIEW else path
def post_href(slug, from_post=False):
    if PREVIEW: return ("../" if from_post else "") + slug + "/index.html"
    return "/blog/" + slug + "/"
def index_href(from_post=False):
    if PREVIEW: return "../index.html" if from_post else "index.html"
    return "/blog/"
EXT = ' target="_blank" rel="noopener"' if PREVIEW else ""

def visible(p): return PREVIEW or p.get("status") == "live"
posts = sorted([p for p in data["posts"] if visible(p)], key=lambda p: p["date"], reverse=True)

ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
ARROW_SM = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
MONO = '<span class="mk" aria-hidden="true">AT</span>' if PREVIEW else '<img src="/assets/img/at-holo-160.webp" width="160" height="90" alt="AT monogram">'
MONO_AUTHOR = '<span class="mk" aria-hidden="true">AT</span>'

def fonts():
    if PREVIEW:
        return ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
                '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Martian+Mono:wght@400;500&family=Sora:wght@500;600;700&display=swap">')
    faces = [("Sora", 500, "sora-latin-500-normal"), ("Sora", 600, "sora-latin-600-normal"), ("Sora", 700, "sora-latin-700-normal"),
             ("Instrument Sans", 400, "instrument-sans-latin-400-normal"), ("Instrument Sans", 500, "instrument-sans-latin-500-normal"),
             ("Instrument Sans", 600, "instrument-sans-latin-600-normal"), ("Martian Mono", 400, "martian-mono-latin-400-normal"),
             ("Martian Mono", 500, "martian-mono-latin-500-normal")]
    ff = "".join('@font-face{font-family:"%s";font-style:normal;font-weight:%d;font-display:swap;src:url(/assets/fonts/%s.woff2) format("woff2")}' % f for f in faces)
    return ('<link rel="preload" href="/assets/fonts/sora-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>'
            '<link rel="preload" href="/assets/fonts/instrument-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>'
            "<style>" + ff + "</style>")

def head(title, desc, url, og_img, extra="", og_title=None):
    og_title = og_title or title
    icons = "" if PREVIEW else '<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="alternate" type="application/rss+xml" title="Ashish Tadigiri · Lab notes" href="/blog/feed.xml">'
    return f'''<title>{esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#05060B">
<meta name="author" content="Ashish Tadigiri">
<meta property="og:site_name" content="Ashish Tadigiri">
<meta property="og:title" content="{esc(og_title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og_img}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@ashishtadigiri">
<meta name="twitter:title" content="{esc(og_title)}"><meta name="twitter:description" content="{esc(desc)}"><meta name="twitter:image" content="{og_img}">
{icons}
{fonts()}
<style>{CSS}</style>
{extra}'''

def header(from_post=False):
    nav = [("Services", site("/#services")), ("Work", site("/#work")), ("Process", site("/#process")), ("Story", site("/story/")), ("Blog", index_href(from_post))]
    links = "".join(f'<a class="nl" href="{h}"{EXT if n != "Blog" else ""}{" aria-current=\"page\"" if n == "Blog" else ""}>{n}</a>' for n, h in nav)
    mlinks = "".join(f'<a class="mlink" href="{h}"{EXT if n != "Blog" else ""}{" aria-current=\"page\"" if n == "Blog" else ""}>{n}{ARROW_SM}</a>' for n, h in nav + [("Contact", site("/#contact"))])
    return f'''<div class="prog" aria-hidden="true"></div><div class="glow" aria-hidden="true"></div>
<svg class="noise" aria-hidden="true"><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#gn)"/></svg>
<header class="hdr"><nav class="nav" aria-label="Main">
<a class="brand" href="{site('/')}"{EXT}>{MONO}<span class="brand-name">ASHISH <span class="grad">TADIGIRI</span></span></a>
<div class="links">{links}</div>
<a class="btn btn-p" href="{site('/#contact')}"{EXT}>Get a free plan {ARROW}</a>
<button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><i></i><i></i></button>
</nav></header>
<nav class="mnav" id="mobile-menu" aria-label="Mobile">{mlinks}
<a class="btn btn-p" style="margin-top:24px;min-height:54px" href="{site('/#contact')}"{EXT}>Get your free project plan</a></nav>'''

def footer():
    soc = [("LinkedIn", "https://www.linkedin.com/in/ashishtadigiri/", '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'),
           ("X", "https://x.com/ashishtadigiri", None),
           ("Instagram", "https://www.instagram.com/ashishtadigiri", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>')]
    def ic(p):
        if p is None:
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5z"/></svg>'
        return f'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p}</svg>'
    s = "".join(f'<a class="icon-btn" href="{u}" target="_blank" rel="noopener" aria-label="{n}">{ic(p)}</a>' for n, u, p in soc)
    return f'''<footer class="ftr"><div class="wrap"><div class="brand">{MONO}<span class="copy-r">© 2026 Ashish Infotech &amp; Finance Solutions. All rights reserved.</span></div>
<span class="hubs">HYD · DXB · AUS</span><div class="soc">{s}</div></div></footer><div class="toast" role="status" aria-live="polite"></div>'''

def art(pillar):
    """Featured-card artwork drawn per pillar (no stock images, faceless)."""
    if pillar == "prop":
        pts = [(40,120),(90,96),(130,110),(180,70),(220,88),(270,60),(310,104),(350,132),(400,150),(440,138),(490,176),(540,190)]
        path = "M" + " L".join(f"{x},{y}" for x, y in pts)
        return f'''<svg viewBox="0 0 580 340" preserveAspectRatio="xMinYMid slice" aria-hidden="true">
<defs><linearGradient id="fa" x1="0" x2="1"><stop offset="0" stop-color="#19c3ff"/><stop offset="1" stop-color="#b23cff"/></linearGradient>
<linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#19c3ff" stop-opacity=".22"/><stop offset="1" stop-color="#19c3ff" stop-opacity="0"/></linearGradient></defs>
<g stroke="rgba(255,255,255,.06)">{"".join(f'<line x1="0" y1="{y}" x2="580" y2="{y}"/>' for y in range(40, 340, 40))}</g>
<path d="{path} L540,340 L40,340 Z" fill="url(#ff)"/>
<path d="{path}" fill="none" stroke="url(#fa)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<line x1="0" y1="250" x2="580" y2="250" stroke="#ff6b81" stroke-width="1.5" stroke-dasharray="6 6"/>
<text x="24" y="274" font-family="Martian Mono, monospace" font-size="11" fill="#ff6b81" letter-spacing="1.5">FLOOR · $97,000</text>
<line x1="400" y1="150" x2="400" y2="250" stroke="#eef1fa" stroke-width="1" stroke-dasharray="2 4"/>
<text x="390" y="206" text-anchor="end" font-family="Martian Mono, monospace" font-size="11" fill="#eef1fa" letter-spacing="1.5">ROOM</text>
<circle cx="400" cy="150" r="5" fill="#eef1fa"/></svg>'''
    if pillar == "ai":
        tiers = [("T0 · READ", "#3ddc97", 70), ("T1 · WRITE", "#19c3ff", 130), ("T2 · APPROVE", "#ffc46b", 190), ("T3 · NEVER", "#ff6b81", 250)]
        nodes = "".join(f'<rect x="300" y="{y-20}" width="230" height="40" rx="10" fill="{c}" fill-opacity=".1" stroke="{c}" stroke-opacity=".6"/><text x="318" y="{y+4}" font-family="Martian Mono, monospace" font-size="12" letter-spacing="1.5" fill="{c}">{t}</text><path d="M150 160 C 220 160, 230 {y}, 300 {y}" fill="none" stroke="{c}" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="{"0" if i < 3 else "4 5"}"/>' for i, (t, c, y) in enumerate(tiers))
        return f'''<svg viewBox="0 0 580 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<g stroke="rgba(255,255,255,.05)">{"".join(f'<line x1="{x}" y1="0" x2="{x}" y2="340"/>' for x in range(0, 580, 40))}</g>{nodes}
<circle cx="110" cy="160" r="42" fill="#0b0d16" stroke="url(#ag)" stroke-width="2"/><defs><linearGradient id="ag" x1="0" x2="1"><stop offset="0" stop-color="#19c3ff"/><stop offset="1" stop-color="#b23cff"/></linearGradient></defs>
<text x="110" y="166" text-anchor="middle" font-family="Sora, sans-serif" font-weight="600" font-size="18" fill="#eef1fa">AGENT</text></svg>'''
    return '<svg viewBox="0 0 580 340" aria-hidden="true"></svg>'

def card(p, planned=False):
    tag = f'<span class="tag" data-p="{p["pillar"]}">{PILLARS[p["pillar"]]}</span>'
    if planned:
        return f'''<div class="card is-planned spot" data-pillar="{p["pillar"]}">{tag}<h3>{esc(p["title"])}</h3><p>{esc(p["excerpt"])}</p>
<div class="foot"><span>Planned</span><span class="status">In the queue</span></div></div>'''
    has_body = os.path.exists(os.path.join(HERE, "posts", p["slug"] + ".html"))
    status = f'<span class="status">Draft · {nice_date(p["date"])}</span>' if p.get("status") != "live" else f'<span>{p["read"]} min read</span>'
    inner = f'''{tag}<h3>{esc(p["title"])}</h3><p>{esc(p["excerpt"])}</p><div class="foot"><span>{nice_date(p["date"])}</span>{status}</div>'''
    if has_body:
        return f'<a class="card spot" data-pillar="{p["pillar"]}" href="{post_href(p["slug"])}">{inner}</a>'
    return f'<div class="card spot" data-pillar="{p["pillar"]}">{inner}</div>'

def make_og(p):
    """1200x630 share image in the site's look: dark ground, cyan/violet glow, AT tile, Sora title."""
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    F = os.path.join(HERE, "fonts")
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), (5, 6, 11))
    glow = Image.new("RGB", (W, H), (0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse((-260, -320, 520, 420), fill=(14, 92, 122)); gd.ellipse((760, 260, 1460, 900), fill=(84, 28, 122))
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    img = Image.blend(img, glow, 0.85)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60): d.line([(x, 0), (x, H)], fill=(14, 16, 26))
    # AT tile with horizontal gradient
    tile = Image.new("RGB", (84, 68)); td = ImageDraw.Draw(tile)
    for x in range(84):
        t = x / 83; c = (int(25 + (178 - 25) * t), int(195 + (60 - 195) * t), 255)
        td.line([(x, 0), (x, 68)], fill=c)
    mask = Image.new("L", (84, 68), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, 83, 67), 16, fill=255)
    img.paste(tile, (72, 64), mask)
    sora7 = ImageFont.truetype(os.path.join(F, "Sora-700.ttf"), 30)
    d.text((114, 98), "AT", font=sora7, fill=(5, 6, 11), anchor="mm")
    d.text((176, 98), "ASHISH TADIGIRI", font=ImageFont.truetype(os.path.join(F, "Sora-600.ttf"), 24), fill=(238, 241, 250), anchor="lm")
    mono = ImageFont.truetype(os.path.join(F, "Martian-500.ttf"), 20)
    d.text((72, 186), ("LAB NOTES  ·  " + PILLARS[p["pillar"]]).upper(), font=mono, fill=(25, 195, 255))
    size = 64
    while True:
        f = ImageFont.truetype(os.path.join(F, "Sora-600.ttf"), size)
        words, lines, cur = p["title"].split(), [], ""
        for w in words:
            t = (cur + " " + w).strip()
            if d.textlength(t, font=f) <= W - 144: cur = t
            else: lines.append(cur); cur = w
        lines.append(cur)
        if len(lines) * size * 1.12 <= 300 or size <= 44: break
        size -= 4
    y = 236
    for ln in lines:
        d.text((72, y), ln, font=f, fill=(238, 241, 250)); y += int(size * 1.12)
    d.line([(72, 548), (W - 72, 548)], fill=(30, 34, 50), width=1)
    d.text((72, 572), "ashishtadigiri.com/blog", font=mono, fill=(174, 182, 202), anchor="lm")
    d.text((W - 72, 572), "HYD · DXB · AUS", font=mono, fill=(111, 120, 144), anchor="rm")
    out_dir = os.path.join(OUT, p["slug"]); os.makedirs(out_dir, exist_ok=True)
    img.save(os.path.join(out_dir, "og.png"), optimize=True)

def calc_component():
    S = [("Bulenox Momentum 100K · new", 3000, 4000, 120), ("Bulenox Momentum 50K · new", 2000, 2250, 70), ("Bulenox Momentum 150K · new", 4500, 5500, 150),
         ("Lucid LucidFlex 50K", 2000, 0, 40), ("Lucid LucidFlex 100K", 3000, 0, 60), ("Lucid LucidFlex 150K", 4500, 0, 100)]
    opts = "".join(f'<option data-room="{r}" data-old="{o}" data-cap="{c}">{n} (${r:,})</option>' for n, r, o, c in S) + '<option data-room="" data-old="0" data-cap="0">Custom</option>'
    inst = [("MNQ · $2/pt", 2, "MNQ", 0), ("MES · $5/pt", 5, "MES", 0), ("MGC · $10/pt", 10, "MGC", 0), ("NQ · $20/pt", 20, "NQ", 1), ("ES · $50/pt", 50, "ES", 1), ("GC · $100/pt", 100, "GC", 1)]
    iopts = "".join(f'<option value="{v}" data-sym="{s}" data-mini="{m}">{n}</option>' for n, v, s, m in inst)
    return f'''<div class="calc" data-calc>
<div class="calc-head"><span class="lbl">Risk calculator</span>
<div class="tabs" role="tablist"><button class="tab" role="tab" type="button" data-tab="size" aria-selected="true">Position size</button><button class="tab" role="tab" type="button" data-tab="cons" aria-selected="false">Consistency</button></div></div>
<div class="calc-body" data-pane="size">
<div class="inputs">
<div class="field"><label for="s-preset">Account</label><select id="s-preset">{opts}</select></div>
<div class="field"><label for="s-room">Room to the floor ($)</label><input id="s-room" type="number" inputmode="decimal" min="0" step="50" value="3000"></div>
<div class="field"><label for="s-inst">Instrument</label><select id="s-inst">{iopts}</select></div>
<div class="row2"><div class="field"><label for="s-stop">Stop (points)</label><input id="s-stop" type="number" inputmode="decimal" min="0" step="0.25" value="20"></div>
<div class="field"><label for="s-loss">Losses to survive</label><input id="s-loss" type="number" inputmode="numeric" min="1" step="1" value="5"></div></div>
</div>
<div class="out" aria-live="polite">
<span class="lbl">Max size</span>
<div class="big"><span class="v" id="s-out">15</span><span class="u" id="s-unit">MNQ contracts</span></div>
<div class="meter" title="Share of the firm's contract cap"><i id="s-meter"></i></div>
<ul class="lines"><li>Loss per contract per stop <b id="s-each">$40</b></li><li>Room each contract needs <b id="s-per">$200</b></li><li>Firm contract cap <b id="s-cap">120 MNQ</b></li><li id="s-oldrow">Before the change <b id="s-old">20 at $4,000</b></li></ul>
<div class="verdict" id="s-verdict"></div>
</div></div>
<div class="calc-body" data-pane="cons" hidden>
<div class="inputs">
<div class="field"><label for="c-preset">LucidFlex account</label><select id="c-preset"><option value="3000">50K · $3,000 target</option><option value="1250">25K · $1,250 target</option><option value="6000">100K · $6,000 target</option><option value="9000">150K · $9,000 target</option></select></div>
<div class="field"><label for="c-target">Profit target ($)</label><input id="c-target" type="number" inputmode="decimal" min="0" step="50" value="3000"></div>
<div class="field"><label for="c-best">Your best day so far ($)</label><input id="c-best" type="number" inputmode="decimal" min="0" step="50" value="1800"></div>
<div class="field"><label>Consistency cap</label><div class="seg"><button type="button" data-cap-pct="0.4" aria-pressed="true">40% · standard</button><button type="button" data-cap-pct="0.5" aria-pressed="false">50% · add-on</button></div></div>
</div>
<div class="out" aria-live="polite">
<span class="lbl">Profit you need</span>
<div class="big"><span class="v" id="c-out">$4,500</span><span class="u">to qualify</span></div>
<ul class="lines"><li>Extra beyond target <b id="c-extra">$1,500</b></li><li>Daily stop-win at <span id="c-pctl">40%</span> <b id="c-stop">$1,200</b></li><li>Minimum winning days <b id="c-days">3</b></li></ul>
<div class="verdict" id="c-verdict"></div>
</div></div>
</div>
<p class="note">Educational calculator. It sizes from the room you enter and does not know your firm's intraday rules; check your dashboard before trading.</p>'''

def planner_component():
    rows = [("read_timesheets",0,0,0,0),("read_rate_card",0,0,0,0),("create_invoice_draft",1,1,0,0),("render_invoice_pdf",1,1,0,0),
            ("email_invoice_to_client",1,0,1,0),("mark_invoice_paid",1,0,0,0),("issue_refund",1,0,1,1),("delete_client_record",1,0,0,1)]
    import json as _j
    return f"""<div class="planner" data-planner data-example='{_j.dumps(rows)}'>
<div class="calc-head"><span class="lbl">Agent permission planner</span>
<div class="acts-sm"><button class="chip" type="button" data-act="add">Add tool</button><button class="chip" type="button" data-act="reset">Reset example</button><button class="chip" type="button" data-act="copy">Copy policy</button></div></div>
<div class="tiers-sum" aria-live="polite"><div data-t="0"><b>0</b><span>Tier 0 · runs alone</span></div><div data-t="1"><b>0</b><span>Tier 1 · runs alone, logged</span></div><div data-t="2"><b>0</b><span>Tier 2 · needs approval</span></div><div data-t="3"><b>0</b><span>Tier 3 · agent never holds</span></div></div>
<div class="tablewrap pl-wrap"><table class="data pl"><colgroup><col class="c-name"><col class="c-q"><col class="c-q"><col class="c-q"><col class="c-q"><col class="c-t"><col class="c-x"></colgroup><thead><tr><th>Tool</th><th>Writes data?</th><th>Undo in 5 min?</th><th>Leaves company?</th><th>Money, keys or delete?</th><th>Tier</th><th><span class="sr">Remove</span></th></tr></thead><tbody></tbody></table></div>
<p class="pl-hint">Swipe the table sideways to see each tool's tier.</p><p class="pl-note" id="pl-note"></p>
</div>
<p class="note">Rule: money, credentials, deletion or permission changes are Tier 3; read-only is Tier 0; anything that leaves the company or takes over 5 minutes to undo is Tier 2; everything else is Tier 1.</p>"""

def cta_component(c, from_post=True):
    bullets = "".join(f"<li>{esc(b)}</li>" for b in c["bullets"])
    sec_label, sec_href = c["secondary"]
    return f'''<aside class="cta spot" aria-label="Work with Ashish"><span class="lbl">{esc(c["eyebrow"])}</span>
<h3>{esc(c["heading"])}</h3><p>{esc(c["body"])}</p><ul>{bullets}</ul>
<p>Tell me what you want to build, fix or automate. Within 24 hours I'll send you a free plan with the approach, timeline and a fixed price.</p>
<div class="acts"><a class="btn btn-p" href="{site('/#contact')}"{EXT}>Get your free project plan {ARROW}</a><a class="btn btn-g" href="{site(sec_href)}"{EXT}>{esc(sec_label)}</a></div></aside>'''

def doc(head_html, body_html, full=True):
    if full:
        return f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n{head_html}\n</head>\n<body>\n{body_html}\n<script>{JS}</script>\n</body>\n</html>\n'
    return f"{head_html}\n{body_html}\n<script>{JS}</script>\n"

def build_post(p):
    body = open(os.path.join(HERE, "posts", p["slug"] + ".html")).read()
    body = body.replace("{{CALC}}", calc_component() if "calc" in p.get("components", []) else "")
    body = body.replace("{{PLANNER}}", planner_component() if "planner" in p.get("components", []) else "")
    body = body.replace("{{CTA}}", cta_component(p["cta"]))
    body = body.replace("{{SITE}}", SITE if PREVIEW else "")
    faq = p.get("faq", [])
    faq_html = ""
    if faq:
        items = "".join(f'<details class="qa"{" open" if i == 0 else ""}><summary>{esc(q)}<span class="pm" aria-hidden="true"></span></summary><p>{esc(a)}</p></details>' for i, (q, a) in enumerate(faq))
        faq_html = f'<h2 id="faq"><span class="no">FAQ</span>Frequently asked questions</h2><div class="faq">{items}</div>'
    body = body.replace("{{FAQ}}", faq_html)
    url = BASE + p["slug"] + "/"
    og = BASE + p["slug"] + "/og.png"
    make_og(p)
    ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "description": p.get("meta", p["excerpt"]),
          "datePublished": p["date"], "dateModified": p["date"], "mainEntityOfPage": url, "image": og,
          "author": {"@type": "Person", "@id": SITE + "/#ashish", "name": "Ashish Tadigiri", "url": SITE + "/story/"},
          "publisher": {"@type": "Organization", "@id": SITE + "/#org", "name": "Ashish Infotech & Finance Solutions", "logo": {"@type": "ImageObject", "url": SITE + "/assets/img/icon-512.png"}},
          "articleSection": PILLARS[p["pillar"]], "inLanguage": "en-GB"}
    crumbs_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": BASE},
        {"@type": "ListItem", "position": 3, "name": p["title"], "item": url}]}
    if p.get("keywords"): ld["keywords"] = ", ".join([p["keyword"]] + p["keywords"])
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]} if faq else None
    extra = (f'<script type="application/ld+json">{json.dumps(faq_ld)}</script>' if faq_ld else "") + f'<script type="application/ld+json">{json.dumps(ld)}</script><script type="application/ld+json">{json.dumps(crumbs_ld)}</script><meta property="og:type" content="article"><meta property="article:published_time" content="{p["date"]}"><meta property="article:author" content="Ashish Tadigiri">'
    toc = "".join(f'<li><a href="#{i}">{esc(t)}</a></li>' for i, t in p["toc"])
    ret = f' <span class="ret">· retrieved {p["retrieved"]}</span>' if p.get("retrieved") else ""
    sources = "".join(f'<li><a href="{u}" target="_blank" rel="noopener">{esc(t)}</a>{ret}</li>' for t, u in p["sources"])
    related = [q for q in posts if q["slug"] != p["slug"]][:2]
    rel_html = "".join(card(q).replace(f'href="{post_href(q["slug"])}"', f'href="{post_href(q["slug"], True)}"') for q in related)
    status_note = '<span class="status" style="padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.14)">Draft preview</span>' if p.get("status") != "live" else ""
    page = f'''{header(True)}
<main>
<section class="post-hero"><div class="orb" style="left:-8%;top:-30%;width:560px;height:560px;background:rgba(25,195,255,.14)"></div><div class="orb" style="right:-10%;top:10%;width:420px;height:420px;background:rgba(178,60,255,.12)"></div>
<div class="wrap" style="position:relative">
<div class="crumbs"><a href="{site('/')}"{EXT}>Home</a><span>/</span><a href="{index_href(True)}">Blog</a><span>/</span><span>{PILLARS[p["pillar"]]}</span></div>
<h1>{p["title_html"]}</h1>
<p class="dek">{esc(p["dek"])}</p>
<div class="byline">
<div class="who">{MONO_AUTHOR}<div><b>Ashish Tadigiri</b><span>Founder · Ashish Infotech &amp; Finance Solutions</span></div></div>
<div class="facts"><span><b>{nice_date(p["date"])}</b></span><span><b>{p["read"]} min</b> read</span><span class="tag" data-p="{p["pillar"]}">{PILLARS[p["pillar"]]}</span>{status_note}</div>
<div class="share">
<button class="icon-btn" type="button" data-copy-link="{url}" aria-label="Copy link"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1"/></svg></button>
<a class="icon-btn" href="https://www.linkedin.com/sharing/share-offsite/?url={url}" target="_blank" rel="noopener" aria-label="Share on LinkedIn"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg></a>
<a class="icon-btn" href="https://x.com/intent/post?url={url}&amp;text={esc(p["title"])}" target="_blank" rel="noopener" aria-label="Share on X"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5z"/></svg></a>
</div></div></div></section>
<div class="wrap layout">
<article class="prose">
{body}
<div class="author">{MONO_AUTHOR}<div><b>Ashish Tadigiri</b><p>Founder of Ashish Infotech &amp; Finance Solutions. I engineer algorithmic trading systems, AI agents and fintech platforms. 250+ projects since 2014, including work for teams at Yahoo, Adobe and Nike.</p></div></div>
<h3 id="sources">Sources</h3>
<ol class="sources">{sources}</ol>
<p class="disc">{esc(p["disclaimer"])}</p>
</article>
<aside class="rail">
<nav class="toc" aria-label="Contents"><h4>Contents</h4><ol>{toc}</ol></nav>
<div class="mini-cta spot"><span class="lbl">Free project plan</span><p>Send me the problem. A plan, timeline and fixed price within 24 hours.</p><a class="btn btn-p" style="width:100%" href="{site('/#contact')}"{EXT}>Get my plan {ARROW}</a></div>
</aside>
</div>
<section class="related"><div class="wrap"><span class="lbl">Keep reading</span><h2>More lab notes</h2><div class="grid">{rel_html}</div></div></section>
</main>
{footer()}'''
    out_dir = os.path.join(OUT, p["slug"])
    os.makedirs(out_dir, exist_ok=True)
    open(os.path.join(out_dir, "index.html"), "w").write(doc(head(p.get("seo_title", p["title"]), p.get("meta", p["excerpt"]), url, og, extra, og_title=p["title"]), page, full=True))

def build_index():
    feat, rest = (posts[0], posts[1:]) if posts else (None, [])
    counts = {}
    for p in posts + (data["planned"] if PREVIEW else []):
        counts[p["pillar"]] = counts.get(p["pillar"], 0) + 1
    total = sum(counts.values())
    chips = f'<button class="chip" type="button" data-f="all" aria-pressed="true">All<span class="n">{total}</span></button>' + "".join(
        f'<button class="chip" type="button" data-f="{k}" aria-pressed="false">{v}<span class="n">{counts.get(k, 0)}</span></button>' for k, v in PILLARS.items() if counts.get(k))
    feat_html = ""
    if feat:
        status = f'<span class="status">Draft · {nice_date(feat["date"])}</span>' if feat.get("status") != "live" else f'<span>{feat["read"]} min read</span>'
        feat_html = f'''<a class="feat spot" data-pillar="{feat["pillar"]}" href="{post_href(feat["slug"])}"><div class="feat-art">{art(feat["pillar"])}</div>
<div class="feat-body"><span class="tag" data-p="{feat["pillar"]}">Latest · {PILLARS[feat["pillar"]]}</span><h2>{esc(feat["title"])}</h2><p>{esc(feat["excerpt"])}</p>
<div class="facts"><span><b>{nice_date(feat["date"])}</b></span>{status}</div><span class="btn btn-g" style="width:max-content">Read the note {ARROW}</span></div></a>'''
    cards = "".join(card(p) for p in rest) + ("".join(card(p, planned=True) for p in data["planned"]) if PREVIEW else "")
    url = BASE
    desc = "Lab notes from Ashish Tadigiri: this week's news in AI agents, algorithmic trading, prop firms, fintech and web performance, with the method and numbers to act on it."
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Lab notes · Ashish Tadigiri", "url": url, "description": desc,
          "author": {"@id": SITE + "/#ashish"}, "publisher": {"@id": SITE + "/#org"},
          "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": BASE + p["slug"] + "/", "datePublished": p["date"]} for p in posts if not PREVIEW]}
    extra = f'<script type="application/ld+json">{json.dumps(ld)}</script><meta property="og:type" content="website">'
    page = f'''{header()}
<main>
<section class="hero"><div class="orb" style="left:-6%;top:-20%;width:560px;height:560px;background:rgba(25,195,255,.16)"></div><div class="orb" style="right:-8%;top:20%;width:440px;height:440px;background:rgba(178,60,255,.14)"></div>
<div class="wrap" style="position:relative">
<span class="lbl">Blog · Lab notes</span>
<h1>The news, then<br><span class="grad">what to do about it.</span></h1>
<p>Twice a week I take one development in AI agents, algorithmic trading, prop firms, fintech or the web, and turn it into a method you can apply: the numbers, the formula and the decision rule. No jargon, no fluff.</p>
<div class="hero-meta"><span><b>Tue &amp; Fri</b> · new notes</span><span><b>{len(posts)}</b> published</span><span>By <b>Ashish Tadigiri</b></span></div>
</div></section>
<div class="wrap">
<div class="tools"><div class="chips" role="group" aria-label="Filter by topic">{chips}</div>
<label class="search" for="q"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Search notes" autocomplete="off"></label></div>
{feat_html}
<div class="grid">{cards}<div class="empty" hidden>No notes match that yet. Try another topic or clear the search.</div></div>
<section class="nl-box spot"><div><span class="lbl">Have a problem like this?</span><h2>Get a free plan in 24 hours.</h2><p>Tell me what you want to build, fix or automate. You get the approach, the timeline and a fixed price, from me directly.</p></div>
<a class="btn btn-p" href="{site('/#contact')}"{EXT}>Get your free project plan {ARROW}</a></section>
</div>
</main>
{footer()}'''
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, "index.html"), "w").write(doc(head("Blog | Ashish Tadigiri", desc, url, SITE + "/assets/img/og-image.jpg", extra), page, full=not PREVIEW))

def build_feeds():
    items = "".join(f'''<item><title>{esc(p["title"])}</title><link>{BASE}{p["slug"]}/</link><guid>{BASE}{p["slug"]}/</guid>
<pubDate>{format_datetime(datetime.datetime.fromisoformat(p["date"] + "T08:30:00+05:30"))}</pubDate><description>{esc(p["excerpt"])}</description><author>info@ashishtadigiri.in (Ashish Tadigiri)</author></item>''' for p in posts)
    open(os.path.join(OUT, "feed.xml"), "w").write(f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Ashish Tadigiri · Lab notes</title><link>{BASE}</link><description>The news, then what to do about it.</description><language>en-gb</language>{items}</channel></rss>
''')
    urls = [(BASE, posts[0]["date"] if posts else None)] + [(BASE + p["slug"] + "/", p["date"]) for p in posts]
    body = "".join(f"<url><loc>{u}</loc>" + (f"<lastmod>{d}</lastmod>" if d else "") + "</url>" for u, d in urls)
    open(os.path.join(OUT, "sitemap.xml"), "w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n')

for p in posts:
    if os.path.exists(os.path.join(HERE, "posts", p["slug"] + ".html")):
        build_post(p)
build_index()
if not PREVIEW:
    build_feeds()
print("built", len(posts), "posts ->", OUT)
