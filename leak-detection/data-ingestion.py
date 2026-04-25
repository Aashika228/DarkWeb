#!/usr/bin/env python3
"""
leak_pipeline.py — Data Ingestion Pipeline for Leak Detection
=============================================================
Fetches mock (and optionally real) leaked data, normalises each record,
classifies the content, and forwards it to a backend /scan endpoint.
Runs continuously in streaming mode (interval-based).

Usage:
    python leak_pipeline.py                    # mock data only
    python leak_pipeline.py --apify            # include Apify source
    python leak_pipeline.py --github           # include GitHub search
    python leak_pipeline.py --interval 10      # custom poll interval (seconds)
    python leak_pipeline.py --backend http://localhost:8000/scan
"""

import re
import json
import time
import uuid
import random
import hashlib
import logging
import argparse
import datetime
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("leak-pipeline")

# ── Regex patterns for classification ────────────────────────────────────────
PATTERNS = {
    "email": re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"),
    "password_label": re.compile(
        r"(?:password|passwd|pwd|pass)\s*[=:|]\s*\S+", re.IGNORECASE
    ),
    "aws_key": re.compile(r"AKIA[0-9A-Z]{16}"),
    "aws_secret": re.compile(r"(?:AWS_SECRET|aws_secret)[^\n]*"),
    "github_token": re.compile(r"ghp_[A-Za-z0-9]{36}"),
    "stripe_key": re.compile(r"(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{24,}"),
    "sendgrid_key": re.compile(r"SG\.[A-Za-z0-9_\-]{22,}\.[A-Za-z0-9_\-]{43}"),
    "twilio_sid": re.compile(r"AC[a-f0-9]{32}"),
    "openai_key": re.compile(r"sk-(?:proj-)?[A-Za-z0-9]{32,}"),
    "jwt": re.compile(r"eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+"),
    "database_url": re.compile(
        r"(?:postgres|mysql|mongodb|redis)://[^\s\"']+", re.IGNORECASE
    ),
    "bearer_token": re.compile(r"Bearer\s+[A-Za-z0-9\-._~+/]+=*", re.IGNORECASE),
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "ip_address": re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
}

SEVERITY_MAP = {
    "aws_key": "CRITICAL",
    "aws_secret": "CRITICAL",
    "stripe_key": "CRITICAL",
    "openai_key": "HIGH",
    "github_token": "HIGH",
    "sendgrid_key": "HIGH",
    "twilio_sid": "HIGH",
    "database_url": "HIGH",
    "jwt": "MEDIUM",
    "bearer_token": "MEDIUM",
    "password_label": "MEDIUM",
    "ssn": "HIGH",
    "email": "LOW",
    "ip_address": "LOW",
}


# ── Normaliser ────────────────────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """Strip extra whitespace and non-printable characters."""
    text = re.sub(r"[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]", "", text)
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def classify(content: str) -> dict:
    """Return matched pattern names, extracted values, and overall severity."""
    matches = {}
    for name, pattern in PATTERNS.items():
        found = pattern.findall(content)
        if found:
            matches[name] = found

    severity = "INFO"
    for match_type in matches:
        s = SEVERITY_MAP.get(match_type, "LOW")
        if ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"].index(s) > \
           ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"].index(severity):
            severity = s

    return {"types": list(matches.keys()), "matches": matches, "severity": severity}


def fingerprint(content: str) -> str:
    """SHA-256 fingerprint for deduplication."""
    return hashlib.sha256(content.encode()).hexdigest()


def normalize(raw: dict) -> dict:
    """Convert a raw ingested record into a canonical normalised record."""
    content = clean_text(raw.get("content", ""))
    classification = classify(content)

    return {
        "record_id": raw.get("id") or str(uuid.uuid4()),
        "ingested_at": datetime.datetime.utcnow().isoformat() + "Z",
        "source": raw.get("source", "unknown"),
        "original_timestamp": raw.get("timestamp"),
        "content": content,
        "fingerprint": fingerprint(content),
        "classification": classification,
        "word_count": len(content.split()),
        "pipeline_version": "1.0.0",
    }


# ── Data sources ──────────────────────────────────────────────────────────────

def load_mock_dataset(path: str = "mock_leak_dataset.json") -> list[dict]:
    """Load the bundled mock JSON dataset."""
    try:
        with open(path, "r") as f:
            data = json.load(f)
        log.info(f"[mock] Loaded {len(data)} records from {path}")
        return data
    except FileNotFoundError:
        log.warning(f"[mock] {path} not found — using inline fallback records")
        return [
            {
                "id": "fallback_001",
                "source": "paste_site",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "content": "email: test@example.com password: Fallback#1",
            }
        ]


def fetch_apify(api_token: str, actor_id: str = "apify/web-scraper") -> list[dict]:
    """
    Fetch results from an Apify actor run.
    Requires a valid APIFY_API_TOKEN and a configured actor.

    Docs: https://docs.apify.com/api/v2#/reference/actors/run-collection/run-actor
    """
    url = (
        f"https://api.apify.com/v2/acts/{actor_id}/runs/last/dataset/items"
        f"?token={api_token}&clean=true&format=json"
    )
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            items = json.loads(resp.read())
        log.info(f"[apify] Fetched {len(items)} items from actor {actor_id}")
        return [
            {
                "id": item.get("id", str(uuid.uuid4())),
                "source": "apify",
                "timestamp": item.get("createdAt", datetime.datetime.utcnow().isoformat() + "Z"),
                "content": json.dumps(item),
            }
            for item in items
        ]
    except Exception as exc:
        log.error(f"[apify] Fetch failed: {exc}")
        return []


def search_github(token: str, query: str = "API_KEY filename:.env") -> list[dict]:
    """
    Search GitHub code for exposed secrets.
    Requires a GitHub personal access token with public_repo scope.

    Docs: https://docs.github.com/en/rest/search/search#search-code
    """
    encoded = urllib.parse.quote(query)
    url = f"https://api.github.com/search/code?q={encoded}&per_page=10"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        items = data.get("items", [])
        log.info(f"[github] Found {len(items)} code results for '{query}'")
        return [
            {
                "id": f"gh_{item['sha']}",
                "source": "github_search",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "content": (
                    f"repo: {item['repository']['full_name']} "
                    f"file: {item['path']} "
                    f"url: {item['html_url']}"
                ),
            }
            for item in items
        ]
    except Exception as exc:
        log.error(f"[github] Search failed: {exc}")
        return []


# ── Backend sender ────────────────────────────────────────────────────────────

def send_to_backend(record: dict, endpoint: str) -> bool:
    """POST a normalised record to the backend /scan endpoint."""
    payload = json.dumps(record).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            log.info(
                f"[backend] Sent {record['record_id']} → HTTP {status}"
            )
            return status in (200, 201, 202)
    except urllib.error.URLError as exc:
        log.warning(f"[backend] Could not reach {endpoint}: {exc.reason}")
        return False


# ── Streaming pipeline ────────────────────────────────────────────────────────

def run_pipeline(
    interval: int = 15,
    backend: Optional[str] = None,
    use_apify: bool = False,
    apify_token: Optional[str] = None,
    use_github: bool = False,
    github_token: Optional[str] = None,
    dataset_path: str = "mock_leak_dataset.json",
    dry_run: bool = True,
):
    """
    Main streaming loop.

    Each iteration:
      1. Collect raw records from all enabled sources
      2. Normalise + classify each record
      3. Deduplicate within the batch (by fingerprint)
      4. Print a summary table to stdout
      5. Optionally POST to the backend
    """
    seen_fingerprints: set[str] = set()
    cycle = 0

    log.info("=" * 60)
    log.info("  LEAK DETECTION PIPELINE  —  STARTING")
    log.info(f"  Interval : {interval}s")
    log.info(f"  Backend  : {backend or '(dry run — no POST)'}")
    log.info(f"  Sources  : mock" + (" + apify" if use_apify else "") + (" + github" if use_github else ""))
    log.info("=" * 60)

    mock_records = load_mock_dataset(dataset_path)

    while True:
        cycle += 1
        log.info(f"\n── Cycle {cycle} ─────────────────────────────────────────")

        # ── Gather raw records ────────────────────────────────────────────────
        raw_batch: list[dict] = []

        # Simulate "live" feed by randomly sampling from the mock dataset
        sample_size = random.randint(1, min(4, len(mock_records)))
        sampled = random.sample(mock_records, sample_size)
        # Mutate timestamps so each cycle looks fresh
        for r in sampled:
            r = dict(r)
            r["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
            r["id"] = r.get("id", "") + f"_c{cycle}"
            raw_batch.append(r)

        if use_apify and apify_token:
            raw_batch.extend(fetch_apify(apify_token))

        if use_github and github_token:
            raw_batch.extend(
                search_github(github_token, query="password OR API_KEY filename:.env")
            )

        # ── Normalise + classify ──────────────────────────────────────────────
        normalised: list[dict] = []
        for raw in raw_batch:
            record = normalize(raw)
            fp = record["fingerprint"]
            if fp in seen_fingerprints:
                log.debug(f"  [dedup] Skipping duplicate {record['record_id']}")
                continue
            seen_fingerprints.add(fp)
            normalised.append(record)

        if not normalised:
            log.info("  No new records this cycle.")
        else:
            # ── Print summary ─────────────────────────────────────────────────
            print("\n  ┌─────────────────────────────────────────────────────────────┐")
            print(f"  │  Cycle {cycle:>3}  │  {len(normalised)} new record(s)  │  {datetime.datetime.utcnow().strftime('%H:%M:%S')} UTC   │")
            print("  ├────────────┬──────────────────┬──────────┬─────────────────┤")
            print("  │ Record ID  │ Source           │ Severity │ Types           │")
            print("  ├────────────┼──────────────────┼──────────┼─────────────────┤")
            for rec in normalised:
                rid = rec["record_id"][:10]
                src = rec["source"][:16].ljust(16)
                sev = rec["classification"]["severity"].ljust(8)
                types = ", ".join(rec["classification"]["types"])[:30] or "none"
                print(f"  │ {rid} │ {src} │ {sev} │ {types:<15} │")
            print("  └────────────┴──────────────────┴──────────┴─────────────────┘\n")

            # ── Send to backend ───────────────────────────────────────────────
            if backend:
                for rec in normalised:
                    ok = send_to_backend(rec, backend)
                    status = "✓" if ok else "✗"
                    log.info(f"  {status} {rec['record_id']} → {backend}")
            else:
                log.info("  [dry-run] Skipping backend POST. Pass --backend URL to enable.")
                # Pretty-print first record as sample output
                if normalised:
                    log.info("  Sample normalised record:")
                    sample_json = json.dumps(normalised[0], indent=4)
                    for line in sample_json.splitlines():
                        print(f"    {line}")

        log.info(f"  Sleeping {interval}s …")
        time.sleep(interval)


# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(
        description="Leak Detection Ingestion Pipeline",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--interval", type=int, default=15,
        help="Seconds between pipeline cycles"
    )
    parser.add_argument(
        "--backend", type=str, default=None,
        help="Backend endpoint URL (e.g. http://localhost:8000/scan)"
    )
    parser.add_argument(
        "--dataset", type=str, default="mock_leak_dataset.json",
        help="Path to the mock dataset JSON file"
    )
    parser.add_argument(
        "--apify", action="store_true",
        help="Enable Apify source (requires --apify-token)"
    )
    parser.add_argument(
        "--apify-token", type=str, default=None,
        help="Apify API token"
    )
    parser.add_argument(
        "--github", action="store_true",
        help="Enable GitHub code search (requires --github-token)"
    )
    parser.add_argument(
        "--github-token", type=str, default=None,
        help="GitHub personal access token"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_pipeline(
        interval=args.interval,
        backend=args.backend,
        use_apify=args.apify,
        apify_token=args.apify_token,
        use_github=args.github,
        github_token=args.github_token,
        dataset_path=args.dataset,
    )