// Shopify titles and descriptions end up in here. Plain JSON.stringify would let a "</script>"
// in that text close the tag early and break the page's structured data, so the characters
// HTML treats specially (< > & and the U+2028/U+2029 line separators) are written as
// backslash-u escapes. JSON parsers read them back as the same characters.
const BACKSLASH = String.fromCharCode(92);
const UNSAFE_CHARACTERS = new RegExp(`[<>&${String.fromCharCode(0x2028, 0x2029)}]`, "g");

function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(
    UNSAFE_CHARACTERS,
    (character) => `${BACKSLASH}u${character.charCodeAt(0).toString(16).padStart(4, "0")}`
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
