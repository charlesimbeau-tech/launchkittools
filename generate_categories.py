import json
import os

categories = [
    {"id": "Writing", "icon": "\u270d\ufe0f", "desc": "AI writers, grammar tools, content generators"},
    {"id": "Design", "icon": "\U0001f3a8", "desc": "Image generation, editing, graphic design"},
    {"id": "Coding", "icon": "\U0001f4bb", "desc": "Code assistants, AI editors, dev tools"},
    {"id": "Marketing", "icon": "\U0001f4e3", "desc": "SEO, email, social media, analytics"},
    {"id": "Video", "icon": "\U0001f3ac", "desc": "Video generation, editing, avatars"},
    {"id": "Audio", "icon": "\U0001f3b5", "desc": "Voice synthesis, music, transcription"},
    {"id": "Productivity", "icon": "\u26a1", "desc": "Scheduling, notes, automation, meetings"},
    {"id": "Data", "icon": "\U0001f4ca", "desc": "Analytics, visualization, ML platforms"}
]

base_dir = r"C:\Users\Owner-CF.Owner-CF-PC\.openclaw\workspace\launchkitai"
template_path = os.path.join(base_dir, "category.html")

with open(template_path, "r", encoding="utf-8") as f:
    template = f.read()

for cat in categories:
    slug = cat["id"].lower()
    html = template
    html = html.replace("<title>Browse AI Tools", f"<title>{cat['id']} AI Tools")
    html = html.replace("Browse <span>AI Tools</span>", f"{cat['icon']} {cat['id']} <span>Tools</span>")
    html = html.replace("Search, filter, and sort 120+ curated AI tools across every category.", cat["desc"] + ". Browse the top " + cat["id"].lower() + " AI tools.")
    html = html.replace("https://launchkittools.com/browse", f"https://launchkittools.com/{slug}")
    
    script_injection = f"""
  <script>
    window.PRELOAD_CATEGORY = "{cat['id']}";
  </script>
    """
    html = html.replace("</head>", script_injection + "\n</head>")
    
    out_path = os.path.join(base_dir, f"{slug}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
        
print("Categories generated!")