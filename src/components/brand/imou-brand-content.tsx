import Link from "next/link";
import {
  BrandSeoFaqs,
  BrandSeoSection,
  BrandSeoTable,
  type BrandSeoFaq,
} from "@/components/brand/brand-seo-section";

// SEO copy for /brands/imou, rendered on the server below the product grid. The wording
// is the supplied copy, kept as written; only the heading levels moved down one step
// because the grid already renders the page's <h1> ("IMOU").

const RANGE_ROWS = [
  [
    "Security cameras",
    "Wi-Fi, PoE, 4G, battery, solar, PTZ, bullet, turret, bulb, dual-lens, triple-lens, indoor and outdoor",
  ],
  ["Recorders", "Wired, PoE and Wi-Fi 6 wireless NVRs from 10 to 36 channels"],
  ["Doorbells", "IMOU video doorbells for homes and small commercial entrances"],
  ["Smart home", "IMOU connected devices for residential projects"],
  ["Accessories", "Add-ons that sit alongside the camera order"],
];

const IMOU_FAQS: BrandSeoFaq[] = [
  {
    question: "Where can I buy IMOU products in Oman?",
    answer:
      "Secure Tech Oman supplies IMOU cameras, NVRs, doorbells and accessories to trade buyers. Send your model list through the contact page for a quotation.",
  },
  {
    question: "Is IMOU a good brand?",
    answer:
      "IMOU is a mainstream surveillance brand with Wi-Fi, PoE, 4G and battery cameras. Fit depends on your site, so match the model to the job.",
  },
  {
    question: "Is IMOU the same as Dahua?",
    answer:
      "No, but they are linked. IMOU is Dahua Technology's consumer and small business brand, and Secure Tech Oman lists both.",
  },
  {
    question: "What products does IMOU make?",
    answer:
      "Security cameras, NVR recorders, video doorbells, smart home devices and CCTV accessories, all available to quote through Secure Tech Oman.",
  },
  {
    question: "How do I know if an IMOU product is original?",
    answer:
      "Buy from a supplier that can show IMOU authorisation, then check the model number, sealed packaging and warranty details on delivery.",
  },
  {
    question: "Can resellers get IMOU trade prices in Oman?",
    answer:
      "Yes. Secure Tech Oman offers wholesale pricing to resellers and system integrators through its wholesale request page or a quote request.",
  },
];

export function ImouBrandContent() {
  return (
    <BrandSeoSection title="Buy IMOU Cameras, NVRs and Doorbells From an Authorised IMOU Distributor in Oman">
      <p>
        Sourcing IMOU products in Oman goes wrong in quiet ways. A camera that fails in month
        three is rarely the {"camera's"} fault alone. A unit with no clear warranty route, a
        recorder that does not match the cameras, or a supplier who cannot confirm stock can
        stall a whole install. Secure Tech Oman is an authorised IMOU distributor in Oman,
        supplying corporates, resellers and system integrators with IMOU cameras, recorders,
        doorbells and smart devices on a quote basis.
      </p>

      <h3>Which IMOU products can you order in Oman?</h3>
      <p>
        This page covers the full IMOU range Secure Tech Oman supplies. When it was written, that
        meant 58 IMOU security cameras across 13 camera types, 7 IMOU network video recorders,
        plus video doorbells, smart home devices and CCTV accessories. Every product is
        quote-only with no public prices, so you send your list and receive a formal quotation.
      </p>
      <BrandSeoTable
        label="IMOU product range"
        columns={["Range", "What it covers"]}
        rows={RANGE_ROWS}
      />

      <h3>How does the IMOU range fit a real project?</h3>
      <p>
        A gate, a warehouse and an office floor rarely share one camera type, so it helps to see
        how the range splits. Cable routes, mains power and mounting height usually settle the
        camera type before the model number comes into it.
      </p>

      <h4>Cameras matched to power and network</h4>
      <p>
        The{" "}
        <Link href="/collections/cctv-security-cameras-imou">IMOU security cameras</Link>{" "}
        collection separates 4G, battery, solar, Wi-Fi and PoE models, so each mounting point
        gets the camera its site can support. Examples include the IPC-F42FP 4MP Wi-Fi bullet
        camera and the IPC-B7ED 5MP 4G+Wi-Fi pan-tilt kit for sites without wired internet.
      </p>

      <h4>Recorders sized to the camera count</h4>
      <p>
        Camera counts grow, and the recorder has to keep up. The{" "}
        <Link href="/collections/recorders-nvr-imou">IMOU NVR</Link> range starts at 10 channels
        and reaches the NVR-N236-16P, a 36-channel 4K recorder with 16 PoE ports. Wired, PoE and
        Wi-Fi 6 wireless versions are listed, which suits projects that mix cabled and wireless
        cameras.
      </p>

      <h4>Doorbells and smart devices</h4>
      <p>
        Residential and small commercial jobs often add entrance cover to the camera list.{" "}
        <Link href="/collections/video-doorbells-imou">IMOU video doorbells</Link> handle the
        front door. The rest of the connected home setup sits with{" "}
        <Link href="/collections/smart-home-imou">IMOU smart home devices</Link>.
      </p>

      <h4>Parts that finish the install</h4>
      <p>
        Mounts, power parts and similar add-ons are easy to forget until install day. Adding{" "}
        <Link href="/collections/cctv-accessories-imou">IMOU CCTV accessories</Link> to the same
        request means one quote carries the cameras and the parts around them.
      </p>

      <h3>What should you check before choosing an IMOU supplier?</h3>
      <p>
        Ask for proof of IMOU authorisation, the warranty route for your model, and whether the
        supplier can quote your full list in one reply. A supplier who answers those on paper is
        easier to work with than one who only sends a price.
      </p>
      <p>
        Secure Tech Oman works as an IMOU supplier in Oman for trade buyers, and as an IMOU
        security cameras and systems supplier in Oman, it keeps cameras, recorders and add-ons in
        a single quote. For wider project needs, the team also supplies other{" "}
        <Link href="/">IT hardware in Oman</Link>, so a networking or storage line can ride on
        the same request.
      </p>

      <h3>How do resellers and integrators order IMOU products?</h3>
      <p>
        Bulk IMOU orders should not turn into a long chain of emails. Secure Tech Oman handles
        trade orders by quotation, so the steps are short and you see the full price before you
        commit. Resellers and integrators can open the{" "}
        <Link href="/wholesale">wholesale request page</Link> to start.
      </p>
      <ol>
        <li>
          <strong>Send your list:</strong> Share the IMOU model numbers and the quantity of each,
          even if the list is still rough.
        </li>
        <li>
          <strong>Add delivery details:</strong> Say where the stock should go and the date you
          need it by.
        </li>
        <li>
          <strong>Review your quotation:</strong> You receive a formal quote with wholesale
          pricing for the whole list.
        </li>
        <li>
          <strong>Confirm and receive:</strong> Approve the quote, and Secure Tech Oman arranges
          delivery.
        </li>
      </ol>

      <h3>Get a Quote for IMOU Cameras and Accessories in Oman</h3>
      <p>
        Buying IMOU for a project comes down to matching each camera to its site and dealing with
        a supplier you can hold to a quote. Secure Tech Oman, an authorised IMOU distributor in
        Oman, covers cameras, recorders, doorbells and accessories in one request.
      </p>
      <p>
        Begin with the list you already have, even if it is rough. Model numbers and quantities
        are enough, and a delivery location and date help the quote come back accurate. If you
        are still weighing wired, wireless and 4G cameras, describe the site and the team will
        say where each type fits. A mixed list, such as gate cameras, an NVR and a doorbell, can
        go on a single request. Stock and lead times change by model, so confirm availability in
        the quote. <Link href="/contact">Request your IMOU quotation</Link> today and get a
        formal price for the whole project in one reply.
      </p>

      <BrandSeoFaqs faqs={IMOU_FAQS} />
    </BrandSeoSection>
  );
}
