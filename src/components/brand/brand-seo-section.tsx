import type { ReactNode } from "react";

// Building blocks for the SEO copy some brand pages carry below their product grid. They
// reuse the classes of the collection pages' custom.bottom_page copy (see
// /collections/access-control), so a brand page and a collection page read the same.

interface BrandSeoSectionProps {
  /** The section's <h2>: the brand page's grid already renders the page's only <h1>. */
  title: string;
  children: ReactNode;
}

// Same divider, spacing and heading as the collection bottom copy in products-client.tsx.
export function BrandSeoSection({ title, children }: BrandSeoSectionProps) {
  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="mb-6 text-3xl font-semibold text-gray-900 lg:text-4xl">{title}</h2>
      <div className="shopify-rich-text collection-bottom-content brand-seo-content">
        {children}
      </div>
    </section>
  );
}

interface BrandSeoTableProps {
  /** Names the scrollable region for screen readers. */
  label: string;
  columns: string[];
  rows: string[][];
}

// Wide tables scroll inside their own box on phones instead of widening the page.
export function BrandSeoTable({ label, columns, rows }: BrandSeoTableProps) {
  return (
    <div className="brand-seo-table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table className={columns.length > 2 ? "brand-seo-table-wide" : undefined}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={index}>{cell}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface BrandSeoFaq {
  question: string;
  answer: string;
}

// Laid out like the Access Control FAQs: a small centred "FAQs" heading, then each
// question in bold above its answer. Questions are <h4>s under the <h3>.
export function BrandSeoFaqs({ faqs }: { faqs: BrandSeoFaq[] }) {
  return (
    <div className="brand-seo-faq">
      <h3>FAQs</h3>
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h4>{faq.question}</h4>
          <p>{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}
