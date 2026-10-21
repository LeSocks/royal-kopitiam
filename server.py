#!/usr/bin/env python3
"""
Royal Kopitiam — Local Development & CMS Persistence Server (Port 8080)
Serves static files with zero-cache headers and provides REST endpoints so the
built-in CMS Studio can save changes directly to siteData.js, cms-history.json,
and upload dish/gallery/brand images directly into assets/.
"""

import base64
import datetime
import http.server
import json
import os
import re
import urllib.parse

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_DATA_PATH = os.path.join(ROOT_DIR, "siteData.js")
HISTORY_PATH = os.path.join(ROOT_DIR, "cms-history.json")
ASSETS_DIR = os.path.join(ROOT_DIR, "assets")


def list_project_assets():
    assets = []
    if not os.path.isdir(ASSETS_DIR):
        return assets
    for root, _, files in os.walk(ASSETS_DIR):
        for fname in sorted(files):
            if fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif")):
                full_path = os.path.join(root, fname)
                rel_path = os.path.relpath(full_path, ROOT_DIR).replace("\\", "/")
                folder = os.path.relpath(root, ASSETS_DIR).replace("\\", "/")
                assets.append({
                    "path": rel_path,
                    "name": fname,
                    "folder": folder
                })
    return assets


def load_history():
    if not os.path.isfile(HISTORY_PATH):
        return []
    try:
        with open(HISTORY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def save_history(history_list):
    try:
        with open(HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump(history_list[:30], f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Warning: could not write cms-history.json:", e)


class RoyalKopitiamCMSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/cms/status":
            self._send_json(200, {
                "ok": True,
                "mode": "local-disk",
                "assets": list_project_assets(),
                "historyCount": len(load_history())
            })
            return

        if parsed.path == "/api/cms/history":
            self._send_json(200, {
                "ok": True,
                "history": load_history()
            })
            return

        # Strip conditional caching headers so updated images/scripts always load fresh
        if "If-Modified-Since" in self.headers:
            del self.headers["If-Modified-Since"]
        if "If-None-Match" in self.headers:
            del self.headers["If-None-Match"]
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_len = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except Exception as e:
            self._send_json(400, {"ok": False, "error": f"Invalid JSON: {e}"})
            return

        if parsed.path == "/api/cms/save-data":
            site_data = payload.get("data")
            note = payload.get("note", "Saved via CMS Studio")
            save_snapshot = payload.get("saveSnapshot", True)

            if not isinstance(site_data, dict) or "menuItems" not in site_data:
                self._send_json(400, {"ok": False, "error": "Invalid siteData payload"})
                return

            js_content = (
                "/**\n"
                " * ============================================================================\n"
                " * ROYAL KOPITIAM (KEDAI KOPITIAM • 东方皇家 • ROYAL ORIENTAL)\n"
                " * Central Website Configuration, Header-to-Footer Template Content & 61-Item Menu\n"
                " * ============================================================================\n"
                " */\n\n"
                "window.ROYAL_KOPITIAM_DATA = "
                + json.dumps(site_data, indent=2, ensure_ascii=False)
                + ";\n"
            )

            try:
                with open(SITE_DATA_PATH, "w", encoding="utf-8") as f:
                    f.write(js_content)
            except Exception as e:
                self._send_json(500, {"ok": False, "error": f"Failed writing siteData.js: {e}"})
                return

            history = load_history()
            if save_snapshot:
                entry = {
                    "id": "snap-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S-%f")[:19],
                    "timestamp": datetime.datetime.now().isoformat(timespec="seconds"),
                    "note": note,
                    "menuCount": len(site_data.get("menuItems", [])),
                    "packageCount": len(site_data.get("curatedPackages", [])),
                    "data": site_data
                }
                history.insert(0, entry)
                save_history(history)

            self._send_json(200, {
                "ok": True,
                "message": "Saved directly to siteData.js on disk",
                "historyCount": len(history)
            })
            return

        if parsed.path == "/api/cms/upload-image":
            folder = payload.get("folder", "food")
            if folder not in ("food", "gallery", "brand"):
                folder = "food"

            filename = payload.get("filename", "uploaded-image.jpg")
            filename = re.sub(r"[^a-zA-Z0-9._-]", "-", os.path.basename(filename))
            if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg")):
                filename += ".jpg"

            data_url = payload.get("dataUrl", "")
            if "," in data_url:
                _, b64_part = data_url.split(",", 1)
            else:
                b64_part = data_url

            try:
                binary_data = base64.b64decode(b64_part)
                target_dir = os.path.join(ASSETS_DIR, folder)
                os.makedirs(target_dir, exist_ok=True)
                target_path = os.path.join(target_dir, filename)
                with open(target_path, "wb") as f:
                    f.write(binary_data)

                rel_path = f"assets/{folder}/{filename}"
                self._send_json(200, {
                    "ok": True,
                    "path": rel_path,
                    "assets": list_project_assets()
                })
            except Exception as e:
                self._send_json(500, {"ok": False, "error": f"Failed saving image: {e}"})
            return

        if parsed.path == "/api/cms/delete-history":
            snap_id = payload.get("id")
            history = [h for h in load_history() if h.get("id") != snap_id]
            save_history(history)
            self._send_json(200, {"ok": True, "history": history})
            return

        self._send_json(404, {"ok": False, "error": "Unknown endpoint"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    server = http.server.ThreadingHTTPServer(("0.0.0.0", port), RoyalKopitiamCMSHandler)
    print(f"Royal Kopitiam Server + CMS API running at http://localhost:{port}")
    server.serve_forever()
