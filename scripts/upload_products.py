#!/usr/bin/env python3
"""
Import a product catalogue CSV into Shopify.

    python3 scripts/upload_products.py ~/Desktop/Dahua_Product_Catalog_NoImages_v2.csv --dry-run
    python3 scripts/upload_products.py ~/Desktop/Dahua_Product_Catalog_NoImages_v2.csv

Every write is an upsert keyed on the CSV's Handle column, so re-running the same
file updates the same products instead of duplicating them.

What the storefront needs (see src/lib/shopify/shopify-queries.ts):
  custom.key_features   list.metaobject_reference -> product_feature   { title, description }
  custom.specifications list.metaobject_reference -> product_specification { label, value }
Plain JSON in those metafields renders as nothing, so the spec/feature columns are
written as metaobjects first and referenced by GID.

stdlib only - no pip install. urllib is used rather than `requests` so the corporate
TLS CA at ~/.config/certs/corporate-ca.pem can be trusted the same way
scripts/with-corporate-ca.sh does it for Node.
"""

import argparse
import csv
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request

API_VERSION = "2024-10"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CA_BUNDLE = os.path.expanduser(
    os.environ.get("NODE_EXTRA_CA_CERTS", "~/.config/certs/corporate-ca.pem")
)

MAX_FEATURES = 5   # Meta Key Feature 1..5
MAX_SPECS = 10     # Spec Name/Value 1..10
MAX_IMAGES = 5     # Image 1..5 URL/Alt
METAOBJECT_BATCH = 10  # aliased upserts per request; ~10 cost points each

COLLECTION_COLUMNS = ("Collection Handle L1", "Collection Handle L2", "Collection Handle L3")


# ── Shopify client ────────────────────────────────────────────────────────────
class Shopify:
    def __init__(self, shop, token):
        self.url = f"https://{shop}/admin/api/{API_VERSION}/graphql.json"
        self.headers = {"X-Shopify-Access-Token": token, "Content-Type": "application/json"}
        self.ctx = ssl.create_default_context()
        if os.path.exists(CA_BUNDLE):
            # Python ships its own CA store and ignores the macOS keychain, so a
            # MITM gateway's re-signed certs fail without this. See with-corporate-ca.sh.
            self.ctx.load_verify_locations(CA_BUNDLE)
        self.calls = 0

    def __call__(self, query, variables=None, attempt=1):
        body = json.dumps({"query": query, "variables": variables or {}}).encode()
        req = urllib.request.Request(self.url, data=body, headers=self.headers)
        try:
            with urllib.request.urlopen(req, context=self.ctx, timeout=90) as resp:
                payload = json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 500, 502, 503, 504) and attempt <= 5:
                time.sleep(2 ** attempt)
                return self(query, variables, attempt + 1)
            raise
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt <= 5:
                time.sleep(2 ** attempt)
                return self(query, variables, attempt + 1)
            raise SystemExit(f"network error talking to Shopify: {exc}")

        self.calls += 1
        errors = payload.get("errors") or []
        if any(e.get("extensions", {}).get("code") == "THROTTLED" for e in errors):
            if attempt <= 6:
                time.sleep(2 * attempt)
                return self(query, variables, attempt + 1)
            raise SystemExit("still throttled after 6 retries")
        if errors:
            raise SystemExit("GraphQL error: " + json.dumps(errors, indent=2))

        # Spend from the leaky bucket rather than guessing a sleep interval.
        throttle = payload.get("extensions", {}).get("cost", {}).get("throttleStatus")
        if throttle and throttle["currentlyAvailable"] < 400:
            deficit = 800 - throttle["currentlyAvailable"]
            time.sleep(max(0.0, deficit / max(throttle["restoreRate"], 1)))
        return payload["data"]


def load_env(path):
    env = {}
    if not os.path.exists(path):
        raise SystemExit(f"missing {path}")
    with open(path) as handle:
        for line in handle:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env[key.strip()] = value.strip().strip('"').strip("'")
    return env


# ── CSV -> Shopify shapes ─────────────────────────────────────────────────────
def cell(row, column):
    return (row.get(column) or "").strip()


def slugify(value, limit=90):
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value[:limit].strip("-")


def features_of(row):
    return [cell(row, f"Meta Key Feature {i}") for i in range(1, MAX_FEATURES + 1)
            if cell(row, f"Meta Key Feature {i}")]


def specs_of(row):
    out = []
    for i in range(1, MAX_SPECS + 1):
        label, value = cell(row, f"Spec Name {i}"), cell(row, f"Spec Value {i}")
        if label and value:
            out.append((label, value))
    return out


def images_of(row):
    """
    Image 1..5 URL/Alt from the row, de-duplicated.

    Shopify fetches each URL itself, so the same URL listed twice would become two
    copies of the same picture on the product. Some catalogues also repeat the first
    image in "Meta Image URL"; that column is skipped for the same reason, since
    Shopify uses the first image as the social preview anyway.
    """
    images, seen = [], set()
    for i in range(1, MAX_IMAGES + 1):
        url = cell(row, f"Image {i} URL")
        if not url or url in seen:
            continue
        seen.add(url)
        image = {"originalSource": url, "contentType": "IMAGE"}
        if cell(row, f"Image {i} Alt"):
            image["alt"] = cell(row, f"Image {i} Alt")
        images.append(image)
    return images


def variant_of(row):
    """The CSV carries one variant per product, so Shopify's default Title option is enough."""
    variant = {
        "optionValues": [{"optionName": "Title", "name": "Default Title"}],
        "taxable": cell(row, "Taxable").upper() != "FALSE",
    }
    inventory_item = {"requiresShipping": cell(row, "Requires Shipping").upper() != "FALSE"}

    if cell(row, "SKU"):
        variant["sku"] = cell(row, "SKU")
    if cell(row, "Barcode"):
        variant["barcode"] = cell(row, "Barcode")
    if cell(row, "Price"):
        variant["price"] = cell(row, "Price")
    if cell(row, "Compare At Price"):
        variant["compareAtPrice"] = cell(row, "Compare At Price")
    if cell(row, "Cost Per Item"):
        inventory_item["cost"] = cell(row, "Cost Per Item")
    if cell(row, "Weight (kg)"):
        inventory_item["measurement"] = {
            "weight": {"unit": "KILOGRAMS", "value": float(cell(row, "Weight (kg)"))}
        }

    variant["inventoryItem"] = inventory_item
    return variant


# Inventory quantities are deliberately not set: this token has no read_locations
# scope, so locationId cannot be resolved. Stock stays untracked until that scope
# is added to the custom app.


# ── Metaobjects ───────────────────────────────────────────────────────────────
class MetaobjectWriter:
    """Upserts product_feature / product_specification entries and hands back GIDs.

    per-product: one metaobject per product per row position - editing a spec on one
    product never touches another, and a re-run updates in place.
    shared:      identical label/value pairs collapse into a single reused metaobject.
    """

    def __init__(self, api, mode, dry_run):
        self.api = api
        self.mode = mode
        self.dry_run = dry_run
        self.cache = {}
        self.created = 0

    def handle_for(self, kind, product_handle, index, parts):
        if self.mode == "shared":
            return f"{kind}-{slugify('-'.join(parts), limit=120)}"
        return f"{kind}-{slugify(product_handle, limit=100)}-{index}"

    def upsert_all(self, jobs):
        """jobs: list of (metaobject_type, handle, [(field_key, value), ...]) -> {handle: gid}"""
        pending = [job for job in jobs if job[1] not in self.cache]
        # Two products can ask for the same shared handle inside one batch; keep the first.
        unique, seen = [], set()
        for job in pending:
            if job[1] not in seen:
                seen.add(job[1])
                unique.append(job)

        for start in range(0, len(unique), METAOBJECT_BATCH):
            chunk = unique[start:start + METAOBJECT_BATCH]
            if self.dry_run:
                for _, handle, _ in chunk:
                    self.cache[handle] = f"gid://dry-run/Metaobject/{handle}"
                self.created += len(chunk)
                continue

            aliases, variables, declarations = [], {}, []
            for i, (mo_type, handle, fields) in enumerate(chunk):
                declarations.append(f"$h{i}: MetaobjectHandleInput!, $m{i}: MetaobjectUpsertInput!")
                aliases.append(
                    f"u{i}: metaobjectUpsert(handle: $h{i}, metaobject: $m{i}) "
                    "{ metaobject { id handle } userErrors { field message code } }"
                )
                variables[f"h{i}"] = {"type": mo_type, "handle": handle}
                variables[f"m{i}"] = {"fields": [{"key": k, "value": v} for k, v in fields]}

            data = self.api("mutation Upsert(%s) { %s }" % (", ".join(declarations), " ".join(aliases)),
                            variables)
            for i, (_, handle, _) in enumerate(chunk):
                result = data[f"u{i}"]
                if result["userErrors"]:
                    raise SystemExit(f"metaobject {handle} failed: {result['userErrors']}")
                self.cache[handle] = result["metaobject"]["id"]
                self.created += 1

        return {handle: self.cache[handle] for _, handle, _ in jobs}

    def for_row(self, row, product_handle):
        jobs = []
        for i, text in enumerate(features_of(row), start=1):
            jobs.append(("product_feature",
                         self.handle_for("feat", product_handle, i, [text]),
                         [("title", text)]))
        for i, (label, value) in enumerate(specs_of(row), start=1):
            jobs.append(("product_specification",
                         self.handle_for("spec", product_handle, i, [label, value]),
                         [("label", label), ("value", value)]))

        ids = self.upsert_all(jobs)
        n_features = len(features_of(row))
        feature_ids = [ids[job[1]] for job in jobs[:n_features]]
        spec_ids = [ids[job[1]] for job in jobs[n_features:]]
        return feature_ids, spec_ids


# ── Collections ───────────────────────────────────────────────────────────────
def fetch_collections(api):
    handles, after = {}, None
    while True:
        data = api("""
            query($after: String) {
              collections(first: 250, after: $after) {
                pageInfo { hasNextPage endCursor }
                nodes { id handle }
              }
            }""", {"after": after})
        for node in data["collections"]["nodes"]:
            handles[node["handle"]] = node["id"]
        if not data["collections"]["pageInfo"]["hasNextPage"]:
            return handles
        after = data["collections"]["pageInfo"]["endCursor"]


PRODUCT_SET = """
mutation Import($input: ProductSetInput!, $identifier: ProductSetIdentifiers!) {
  productSet(input: $input, identifier: $identifier, synchronous: true) {
    product { id handle }
    userErrors { field message code }
  }
}"""


def build_input(row, collection_ids, feature_ids, spec_ids, status_override):
    status = (status_override or cell(row, "Status") or "DRAFT").upper()
    product = {
        "title": cell(row, "Product Title"),
        "handle": cell(row, "Handle"),
        "status": status,
        "vendor": cell(row, "Vendor") or cell(row, "Brand"),
        "productType": cell(row, "Product Type"),
        "tags": [t.strip() for t in cell(row, "Tags").split(",") if t.strip()],
        "descriptionHtml": cell(row, "Long Description (HTML)"),
        "collections": collection_ids,
        "productOptions": [{"name": "Title", "values": [{"name": "Default Title"}]}],
        "variants": [variant_of(row)],
        "metafields": [],
    }

    seo = {}
    if cell(row, "SEO Title"):
        seo["title"] = cell(row, "SEO Title")
    if cell(row, "SEO Description"):
        seo["description"] = cell(row, "SEO Description")
    if seo:
        product["seo"] = seo

    if feature_ids:
        product["metafields"].append({
            "namespace": "custom", "key": "key_features",
            "type": "list.metaobject_reference", "value": json.dumps(feature_ids),
        })
    if spec_ids:
        product["metafields"].append({
            "namespace": "custom", "key": "specifications",
            "type": "list.metaobject_reference", "value": json.dumps(spec_ids),
        })

    # Only send `files` when the row actually has images. Sending an empty list would
    # be read as "this product has no media" and would strip images off a product that
    # already has them, which matters because re-running this script is normal.
    images = images_of(row)
    if images:
        product["files"] = images

    return product


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv_file")
    parser.add_argument("--dry-run", action="store_true",
                        help="validate and report without writing to Shopify")
    parser.add_argument("--limit", type=int, help="only process the first N rows")
    parser.add_argument("--status", choices=["active", "draft", "archived"],
                        help="override the CSV's Status column")
    parser.add_argument("--metaobjects", choices=["per-product", "shared"], default="per-product",
                        help="per-product (default): one metaobject per product per row position. "
                             "shared: reuse one metaobject for identical content")
    parser.add_argument("--skip-existing", action="store_true",
                        help="skip handles that already exist in the store")
    parser.add_argument("--only", help="comma-separated handles to import")
    args = parser.parse_args()

    env = load_env(os.path.join(REPO_ROOT, ".env"))
    shop = env.get("SHOPIFY_STORE_NAME", "")
    token = env.get("SHOPIFY_ADMIN_API_KEY", "")
    if not shop or not token:
        raise SystemExit("SHOPIFY_STORE_NAME and SHOPIFY_ADMIN_API_KEY must be set in .env")
    if not shop.endswith(".myshopify.com"):
        shop += ".myshopify.com"

    with open(args.csv_file, newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    if args.only:
        wanted = {h.strip() for h in args.only.split(",")}
        rows = [r for r in rows if cell(r, "Handle") in wanted]
    if args.limit:
        rows = rows[:args.limit]

    required = {"Product Title", "Handle"}
    missing_columns = required - set(rows[0].keys() if rows else [])
    if missing_columns:
        raise SystemExit(f"CSV is missing required column(s): {sorted(missing_columns)}")

    api = Shopify(shop, token)
    print(f"store   : {shop}")
    print(f"catalog : {args.csv_file}  ({len(rows)} rows)")
    print(f"mode    : {'DRY RUN' if args.dry_run else 'LIVE'}  "
          f"metaobjects={args.metaobjects}  status={args.status or 'from CSV'}\n")

    print("resolving collections...")
    collections = fetch_collections(api)

    already = set()
    if args.skip_existing and not args.dry_run:
        handles = [cell(r, "Handle") for r in rows]
        for start in range(0, len(handles), 50):
            query = " OR ".join(f"handle:{h}" for h in handles[start:start + 50])
            data = api("query($q:String!){ products(first:250, query:$q){ nodes { handle } } }",
                       {"q": query})
            already.update(n["handle"] for n in data["products"]["nodes"])
        print(f"{len(already)} of {len(rows)} handles already exist and will be skipped")

    writer = MetaobjectWriter(api, args.metaobjects, args.dry_run)
    missing_collections, uncategorised, failures = set(), [], []
    done = skipped = 0
    started = time.time()

    for index, row in enumerate(rows, start=1):
        handle = cell(row, "Handle")
        title = cell(row, "Product Title")
        if not handle or not title:
            failures.append((handle or f"row {index}", "missing Handle or Product Title"))
            continue
        if handle in already:
            skipped += 1
            continue

        collection_ids = []
        for column in COLLECTION_COLUMNS:
            wanted = cell(row, column)
            if not wanted:
                continue
            if wanted in collections:
                collection_ids.append(collections[wanted])
            else:
                missing_collections.add(wanted)
        if not collection_ids:
            uncategorised.append(handle)

        feature_ids, spec_ids = writer.for_row(row, handle)
        product_input = build_input(row, collection_ids, feature_ids, spec_ids, args.status)

        if args.dry_run:
            done += 1
            print(f"[{index}/{len(rows)}] would import {title}  "
                  f"({len(feature_ids)} features, {len(spec_ids)} specs, "
                  f"{len(collection_ids)} collections, "
                  f"{len(product_input.get('files', []))} images)")
            continue

        data = api(PRODUCT_SET, {"input": product_input, "identifier": {"handle": handle}})
        errors = data["productSet"]["userErrors"]
        if errors:
            failures.append((handle, json.dumps(errors)))
            print(f"[{index}/{len(rows)}] FAILED {title}: {errors}")
            continue

        done += 1
        rate = index / max(time.time() - started, 1e-6)
        print(f"[{index}/{len(rows)}] {title}  "
              f"({len(feature_ids)}f/{len(spec_ids)}s, {len(collection_ids)} coll, "
              f"{len(product_input.get('files', []))} img)  "
              f"{rate:.1f} rows/s")

    elapsed = time.time() - started
    print(f"\n{'would import' if args.dry_run else 'imported'}: {done}"
          f"   skipped: {skipped}   failed: {len(failures)}")
    print(f"metaobjects {'planned' if args.dry_run else 'written'}: {writer.created}"
          f"   API calls: {api.calls}   elapsed: {elapsed:.0f}s")

    if missing_collections:
        print(f"\nWARNING - {len(missing_collections)} collection handle(s) in the CSV "
              f"do not exist in the store; those products were imported without them:")
        for handle in sorted(missing_collections):
            print(f"   - {handle}")
    if uncategorised:
        print(f"\nWARNING - {len(uncategorised)} product(s) have no collection and will not "
              f"appear under any category until assigned in the admin:")
        for handle in uncategorised:
            print(f"   - {handle}")
    if failures:
        print(f"\n{len(failures)} failure(s):")
        for handle, reason in failures:
            print(f"   - {handle}: {reason}")
        sys.exit(1)


if __name__ == "__main__":
    main()
