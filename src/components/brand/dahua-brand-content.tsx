import Link from "next/link";
import {
  BrandSeoFaqs,
  BrandSeoSection,
  BrandSeoTable,
  type BrandSeoFaq,
} from "@/components/brand/brand-seo-section";

// SEO copy for /brands/dahua, rendered on the server below the product grid. The wording
// is the supplied copy, kept as written; only the heading levels moved down one step
// because the grid already renders the page's <h1> ("Dahua").

const AT_A_GLANCE_ROWS = [
  ["Supply model", "B2B wholesale and project orders"],
  ["Buyers", "Resellers, system integrators, contractors"],
  ["Local stock", "Muscat, Sohar, Salalah"],
  ["Quote response", "Within 24 hours"],
  ["Support", "Pre-sales design through to commissioning"],
];

const PRODUCT_GROUP_ROWS = [
  [
    "CCTV cameras",
    "2MP to 8MP dome, bullet, turret, PTZ and fisheye, with AI models",
    "Shops, warehouses, perimeters",
  ],
  [
    "NVRs and recorders",
    "4-channel units upward, with AI search and RAID on larger models",
    "Any multi-camera site",
  ],
  [
    "Access control",
    "Card, fingerprint, face recognition and QR readers",
    "Offices, building sites, restricted rooms",
  ],
  ["Video intercoms", "IP and 2-wire door stations, indoor monitors", "Villas, apartment blocks"],
  ["Accessories and displays", "Mounts, power, cabling, monitors", "Completing an install"],
  [
    "Other Dahua lines",
    "Thermal cameras, the DSS management platform",
    "Industrial and multi-site projects",
  ],
];

const TECHNOLOGY_ROWS = [
  [
    "WizSense",
    "AI human and vehicle detection and perimeter protection, built into the camera firmware",
    "Retail, offices, warehouses, construction sites",
  ],
  [
    "WizMind",
    "Face recognition, people counting and vehicle detection on the camera",
    "Banking, government buildings, large retail",
  ],
  [
    "TiOC",
    "Full-colour night imaging, active deterrence and AI in one unit",
    "Villas, shops, site perimeters after dark",
  ],
  [
    "Thermal",
    "Perimeter detection, fire prevention and temperature screening",
    "Oil and gas, utilities, industrial perimeters",
  ],
];

const DAHUA_FAQS: BrandSeoFaq[] = [
  {
    question: "Where can I buy Dahua products in Oman?",
    answer:
      "Secure Tech Oman, an authorised Dahua supplier in Oman with local stock in Muscat, Sohar and Salalah. Send an RFQ online or on WhatsApp.",
  },
  {
    question: "Can I buy Dahua products in bulk for projects?",
    answer:
      "Yes. Volume orders and project quotations come with tiered wholesale pricing. Send your model list, quantities and delivery timeline for a formal quote.",
  },
  {
    question: "How can I check if a Dahua product is original?",
    answer:
      "Ask for the authorisation certificate, then check the serial number on Dahua's Product Authentication Query page. Our units carry Dahua's scratch-off security label.",
  },
  {
    question: "Do Dahua products come with a warranty in Oman?",
    answer:
      "Yes. Original Dahua Technology products carry the standard manufacturer warranty, typically two to three years on cameras and recorders. Keep the serial number for claims.",
  },
  {
    question: "Which Dahua products do you supply?",
    answer:
      "CCTV cameras, NVRs, access control, video intercoms, accessories and monitors, plus other Dahua lines on request. Share your project list for availability.",
  },
  {
    question: "Which app do I use for Dahua cameras and recorders?",
    answer:
      "Dahua's DMSS mobile app handles live view, playback and alerts for cameras and recorders. Larger multi-site systems use the DSS platform.",
  },
  {
    question: "Do you deliver Dahua products across Oman?",
    answer:
      "Yes. We deliver across Oman from local stock, including Muscat, Sohar, Salalah, Nizwa and Sur. Lead times for special-order items are confirmed in the quote.",
  },
];

export function DahuaBrandContent() {
  return (
    <BrandSeoSection title="Authorised Dahua Distributor in Oman for Original Security Products">
      <p>
        A tender deadline is close, and the Dahua cameras you quoted are two to four weeks away
        on a direct import. The cheaper stock on offer has no authorisation behind it, and nobody
        can promise the serial numbers will verify when your client checks.{" "}
        <Link href="/">Secure Tech Oman</Link>, a Dahua Oman distributor, closes that gap. We
        hold original Dahua Technology products in Muscat, Sohar and Salalah, sell only through
        the channel so your margin and your client stay yours, and answer RFQs for Dahua security
        products within 24 hours.
      </p>

      <h3>Who is an authorised Dahua distributor in Oman?</h3>
      <p>
        Secure Tech Oman is an authorised Dahua distributor in Oman, supplying resellers, system
        integrators and project contractors. Every unit comes with a Dahua scratch-off security
        label and a serial number that can be verified on Dahua’s Product Authentication Query
        page. Before purchasing, ask any Dahua supplier in Oman for the same proof of
        authenticity.
      </p>
      <BrandSeoTable
        label="Secure Tech Oman at a glance"
        columns={["At a glance", "Secure Tech Oman"]}
        rows={AT_A_GLANCE_ROWS}
      />

      <h3>Which Dahua security products can you buy in Oman?</h3>
      <p>
        Secure Tech Oman supplies{" "}
        <Link href="/collections/cctv-security-cameras-dahua">Dahua security products</Link>,
        including Dahua CCTV cameras, NVRs and recorders, access control, video intercoms, CCTV
        accessories and monitors, with further Dahua lines available on request. Most sites need
        cameras, a recorder and storage at minimum, so we quote them together and confirm
        compatibility and firmware before dispatch.
      </p>
      <BrandSeoTable
        label="Dahua product groups"
        columns={["Product group", "What it covers", "Best for"]}
        rows={PRODUCT_GROUP_ROWS}
      />

      <h3>Which Dahua setup suits a warehouse, retail chain or government site?</h3>
      <p>
        For multi-site buyers, standardise on one camera family and one recorder line. It cuts
        spares, shortens technician training and lets one platform manage every device. We hold
        Dahua stock locally, so repeat orders skip the two to four week wait of direct imports.
      </p>
      <h4>Why standardising pays off</h4>
      <ul>
        <li>One camera family and one recorder line mean fewer spares to hold.</li>
        <li>
          The DSS platform runs cameras,{" "}
          <Link href="/collections/access-control-dahua">Dahua access control</Link>, intercoms
          and alarms from one console.
        </li>
        <li>Local stock in Muscat, Sohar and Salalah avoids the direct-import wait.</li>
        <li>Pre-sales design support runs from tender to commissioning.</li>
      </ul>

      <h3>Which Dahua camera technology fits your site?</h3>
      <p>
        WizSense adds AI human and vehicle detection and perimeter protection and suits retail,
        offices, warehouses and construction sites. WizMind adds face recognition, people
        counting and vehicle detection for banking, government buildings and large retail. TiOC
        combines full-colour night imaging, active deterrence and AI for villas, shops and site
        perimeters after dark. Thermal cameras cover perimeter detection, fire prevention and
        temperature screening for oil and gas, utilities and industrial perimeters.
      </p>
      <p>
        See the full range of{" "}
        <Link href="/collections/cctv-security-cameras-dahua">Dahua security cameras</Link>.
      </p>
      <BrandSeoTable
        label="Dahua camera technologies"
        columns={["Technology", "What it does", "Fits"]}
        rows={TECHNOLOGY_ROWS}
      />

      <h3>What does a villa or apartment block need at the entrance?</h3>
      <p>
        Start at the door. A villa needs a door station and an indoor monitor, and an apartment
        block needs a multi-tenant IP intercom.{" "}
        <Link href="/collections/intercom-systems-dahua">Dahua video intercom systems</Link>{" "}
        support SIP and mobile app calling, and they pair with cameras on driveways and car parks
        to complete the entrance.
      </p>
      <ul>
        <li>
          <strong>Villa:</strong> One-door station, one indoor monitor, a camera on the driveway.
        </li>
        <li>
          <strong>Apartment block:</strong> Multi-tenant IP intercom with SIP and mobile app
          calling.
        </li>
        <li>
          <strong>Retrofit:</strong> Choose 2-wire where you must reuse old cabling.
        </li>
        <li>
          <strong>New build:</strong> Choose IP where network cabling is already in place.
        </li>
      </ul>

      <h3>Can you order Dahua in bulk, and how quickly does it arrive?</h3>
      <p>
        Yes. We quote bulk and project orders with tiered wholesale pricing, formal quotations
        and stock confirmation, normally within 24 hours of receiving your model list, quantities
        and delivery timeline. Stock held locally in Muscat, Sohar and Salalah avoids the two- to
        four-week wait of direct imports. Specialised products come by direct import, with
        typical lead times of two to four weeks.
      </p>
      <ol>
        <li>Send your model list, quantities and delivery timeline.</li>
        <li>Receive a formal quote with stock confirmation within 24 hours.</li>
        <li>Confirm the order.</li>
        <li>Get datasheets and technical documentation when you need them.</li>
      </ol>
      <p>
        Share your list once and we will confirm availability, pricing and recommended
        alternatives based on your project and delivery timeline.{" "}
        <Link href="/wholesale">Request Dahua wholesale pricing</Link>.
      </p>

      <BrandSeoFaqs faqs={DAHUA_FAQS} />
    </BrandSeoSection>
  );
}
