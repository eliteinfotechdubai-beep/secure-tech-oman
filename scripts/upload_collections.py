#!/usr/bin/env python3
"""Create the 3-level collection hierarchy in Shopify from a brand/category mapping CSV.

Metafields match what src/app/api/collections/organized/route.ts reads (namespace "custom"):
  child_category  - collection_reference to the IMMEDIATE parent. Not set on roots.
  category_level  - collection_reference to the ROOT collection of the branch.

Idempotent: existing collections (matched by handle) are reused, never duplicated.
Standard library only, so it runs on the system python3 without pip.

Usage:
  python3 scripts/upload_collections.py ~/Desktop/Brand_Product_Category_Mapping.csv --dry-run
  python3 scripts/upload_collections.py ~/Desktop/Brand_Product_Category_Mapping.csv
Options:
  --dry-run             Print the plan and what already exists; write nothing.
  --include-unverified  Also create rows whose Status is not "Recommended".
"""
import argparse
import csv
import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_VERSION = "2025-07"
ROOT = Path(__file__).resolve().parent.parent
CORPORATE_CA = Path.home() / ".config/certs/corporate-ca.pem"


def load_env(path):
    env = {}
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def ssl_context():
    # Behind the corporate TLS-intercepting gateway, Python's bundle lacks the re-signing CA
    # (same problem scripts/with-corporate-ca.sh solves for Node). Verification stays on.
    ctx = ssl.create_default_context()
    for bundle in ("/etc/ssl/cert.pem", CORPORATE_CA):
        if Path(bundle).exists():
            ctx.load_verify_locations(cafile=str(bundle))
    return ctx


class Shopify:
    def __init__(self, store, token):
        self.url = f"https://{store}/admin/api/{API_VERSION}/graphql.json"
        self.token = token
        self.ctx = ssl_context()

    def gql(self, query, variables=None):
        body = json.dumps({"query": query, "variables": variables or {}}).encode()
        for attempt in range(5):
            req = urllib.request.Request(self.url, data=body, method="POST", headers={
                "X-Shopify-Access-Token": self.token,
                "Content-Type": "application/json",
            })
            try:
                with urllib.request.urlopen(req, context=self.ctx, timeout=60) as res:
                    payload = json.load(res)
            except urllib.error.HTTPError as e:
                if e.code in (429, 502, 503, 504) and attempt < 4:
                    time.sleep(2 ** attempt)
                    continue
                raise RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='replace')}") from e

            errors = payload.get("errors")
            if errors:
                throttled = any(err.get("extensions", {}).get("code") == "THROTTLED" for err in errors)
                if throttled and attempt < 4:
                    time.sleep(2 ** attempt)
                    continue
                raise RuntimeError(f"GraphQL errors: {json.dumps(errors)}")
            return payload["data"]
        raise RuntimeError("Gave up after repeated throttling")

    def existing_collections(self):
        query = """
        query($after: String) {
          collections(first: 250, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { id handle }
          }
        }"""
        by_handle, after = {}, None
        while True:
            conn = self.gql(query, {"after": after})["collections"]
            by_handle.update({node["handle"]: node["id"] for node in conn["nodes"]})
            if not conn["pageInfo"]["hasNextPage"]:
                return by_handle
            after = conn["pageInfo"]["endCursor"]

    def create_collection(self, title, handle, parent_id=None, root_id=None):
        metafields = []
        if parent_id:
            metafields.append({"namespace": "custom", "key": "child_category",
                               "type": "collection_reference", "value": parent_id})
        if root_id:
            metafields.append({"namespace": "custom", "key": "category_level",
                               "type": "collection_reference", "value": root_id})
        mutation = """
        mutation($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection { id handle title }
            userErrors { field message }
          }
        }"""
        result = self.gql(mutation, {"input": {"title": title, "handle": handle, "metafields": metafields}})
        payload = result["collectionCreate"]
        if payload["userErrors"]:
            raise RuntimeError(f"Could not create '{title}' ({handle}): {payload['userErrors']}")
        collection = payload["collection"]
        if collection["handle"] != handle:
            print(f"  ! Shopify changed handle {handle} -> {collection['handle']}")
        return collection["id"]


def build_plan(rows):
    """Return ordered, de-duplicated (level, handle, title, parent_handle, root_handle) tuples."""
    plan, seen = [], {}
    for level, (title_col, handle_col, parent_col) in enumerate([
        ("Parent Category", "Parent Handle", None),
        ("Child Category (Brand)", "Child Handle", "Parent Handle"),
        ("Third-Level Category", "Third-Level Handle", "Child Handle"),
    ], start=1):
        for row in rows:
            handle = row[handle_col].strip()
            title = row[title_col].strip()
            parent = row[parent_col].strip() if parent_col else None
            root = row["Parent Handle"].strip() if level > 1 else None
            if not handle or not title:
                continue
            if handle in seen:
                if seen[handle] != (level, parent):
                    sys.exit(f"Handle '{handle}' appears with conflicting parents/levels; fix the CSV.")
                continue
            seen[handle] = (level, parent)
            plan.append((level, handle, title, parent, root))
    return plan


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv_file")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--include-unverified", action="store_true")
    args = parser.parse_args()

    env = {**load_env(ROOT / ".env"), **os.environ}
    store, token = env.get("SHOPIFY_STORE_NAME"), env.get("SHOPIFY_ADMIN_API_KEY")
    if not store or not token:
        sys.exit("SHOPIFY_STORE_NAME and SHOPIFY_ADMIN_API_KEY must be set (in .env or the environment).")

    # utf-8-sig strips the BOM spreadsheet apps add, which would otherwise corrupt the first header.
    with open(Path(args.csv_file).expanduser(), newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    skipped = [r for r in rows if r.get("Status", "Recommended").strip() != "Recommended"]
    if not args.include_unverified:
        rows = [r for r in rows if r not in skipped]
        for r in skipped:
            print(f"Skipping unverified row: {r['Brand']} -> {r['Third-Level Category']} ({r['Status']})")

    plan = build_plan(rows)
    shopify = Shopify(store, token)
    ids = shopify.existing_collections()
    counts = {1: 0, 2: 0, 3: 0}
    for level, *_ in plan:
        counts[level] += 1
    todo = [p for p in plan if p[1] not in ids]
    print(f"\nPlan: {counts[1]} parents, {counts[2]} brands, {counts[3]} product categories "
          f"({len(plan)} total). Already in Shopify: {len(plan) - len(todo)}. To create: {len(todo)}.")

    if args.dry_run:
        for level, handle, title, parent, _ in todo[:15]:
            print(f"  [L{level}] {title}  ({handle})" + (f"  <- {parent}" if parent else ""))
        if len(todo) > 15:
            print(f"  ... and {len(todo) - 15} more")
        print("\nDry run: nothing was written.")
        return

    created, failed = 0, []
    for level, handle, title, parent, root in plan:
        if handle in ids:
            continue
        parent_id = ids.get(parent) if parent else None
        root_id = ids.get(root) if root else None
        if level > 1 and not (parent_id and root_id):
            failed.append((handle, f"parent '{parent}' or root '{root}' is missing"))
            print(f"  ✗ [L{level}] {title}: parent/root collection missing, skipped")
            continue
        try:
            ids[handle] = shopify.create_collection(title, handle, parent_id, root_id)
            created += 1
            print(f"  ✓ [L{level}] {title}")
        except RuntimeError as e:
            failed.append((handle, str(e)))
            print(f"  ✗ {e}")
        time.sleep(0.25)

    print(f"\nDone. Created {created}, already existed {len(plan) - len(todo)}, failed {len(failed)}.")
    if failed:
        print("Failures (safe to re-run after fixing):")
        for handle, reason in failed:
            print(f"  - {handle}: {reason}")
        sys.exit(1)


if __name__ == "__main__":
    main()
