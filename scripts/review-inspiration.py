"""Read-only analysis of the UI concept supplied in issue #13.
References are not game assets and are never included in release packaging.
"""
import base64
import io
import json
import pathlib
import subprocess
import urllib.request
from PIL import Image, ImageDraw

URLS = ["https://github.com/user-attachments/assets/a711aca4-4670-40d3-87e8-0330a4a63c8b"]
out = pathlib.Path("inspiration-review")
out.mkdir(exist_ok=True)

def report(name, im):
    im = im.convert("RGB")
    target = out / (name + ".jpg")
    im.save(target, quality=85)
    print(name.upper().replace("-", "_") + "_BASE64:" + base64.b64encode(target.read_bytes()).decode(), flush=True)

for index, url in enumerate(URLS):
    suffix = ".jpeg" if index < 2 else ".mp4"
    source = out / ("source-" + str(index + 1) + suffix)
    request = urllib.request.Request(url, headers={"User-Agent": "Megawatt-Valley-reference-review"})
    size = 0
    with urllib.request.urlopen(request, timeout=90) as response, source.open("wb") as dest:
        while chunk := response.read(1024 * 1024):
            size += len(chunk)
            if size > 200 * 1024 * 1024:
                raise ValueError("Reference exceeds review size limit")
            dest.write(chunk)
    print("REFERENCE_METADATA:" + json.dumps({"index": index + 1, "bytes": size, "url": url}), flush=True)
    if index < 2:
        report("reference-" + str(index + 1), Image.open(source))
        continue
    duration = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(source)], text=True).strip())
    print("VIDEO_DURATION:" + json.dumps({"index": index + 1, "seconds": duration}), flush=True)
    sheet = Image.new("RGB", (1600, 1440), "#203b35")
    draw = ImageDraw.Draw(sheet)
    for n, fraction in enumerate([0.02, 0.20, 0.40, 0.60, 0.80, 0.98]):
        timestamp = min(duration - 0.1, max(0, duration * fraction))
        jpg = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", str(timestamp), "-i", str(source), "-frames:v", "1", "-f", "image2pipe", "-vcodec", "mjpeg", "-q:v", "3", "-"])
        frame = Image.open(io.BytesIO(jpg)).convert("RGB")
        frame.save(out / ("clip-" + str(index + 1) + "-frame-" + str(n) + ".jpg"), quality=88)
        frame.thumbnail((800, 450))
        x, y = (n % 2) * 800, (n // 2) * 480
        sheet.paste(frame, (x, y + 25))
        draw.text((x + 12, y + 6), "Clip %d - %.2f seconds" % (index + 1, timestamp), fill="white")
    report("clip-" + str(index + 1) + "-sheet", sheet)
