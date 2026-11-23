# FIRE public pages

Nine locales × landing, support and privacy pages (27 pages):
en, zh-Hans, zh-Hant, ja, de, fr, es, ko and pt-BR. Build with `npm run build:fire`;
`npm run check:site` verifies checked-in output. Shared masthead and reciprocal
language links use the existing static product-site builder.

FIRE 1.4.0 was released on 2026-11-23 for iOS (build 20261122121039)
and native macOS (build 20261122003124). On iPhone, iPad and Mac, each
widget can open the progress overview or a new balance entry. The form
accepts either a total balance or an increase or decrease. The shared
App Store link is App 6820084110. The nine localized listings and structured
data cover iPhone, iPad, Mac and Apple Watch. The release record is in the
OpenYears repository at docs/store/launch-1.4.0.md.

Progress images are rendered on-device from a saved snapshot. Amounts start
hidden on each opening; the user chooses the style, optional content and sharing
destination. The November 16 privacy update explains this existing behavior;
it adds no collection, tracking, permissions or backend. Monthly review uses
confirmed records and comparable target/currency segments, not investment returns.

Images are the approved FIRE icon and native widget renders exported by
`OpenYears/Tests/WidgetRendering/StoreCreativeRenderingTests.swift` on 2026-10-16.
They use fixed example records and the shipping `FirePalette` container fill;
no user financial data is used. These are widget renders, not device screenshots.
No analytics, ad scripts, embedded third-party form or additional backend is added.

The five additional locales were added on 2026-11-10. Support pages link to their
existing localized Tally forms. Canonical and reciprocal hreflang links and the
language menu preserve the current surface. The shared personal homepage remains
English / Simplified Chinese; links that fall back to English are labeled.
The additional widget images are the matching native nine-language renders from
OpenYears `.build/nine-languages/widget-raw/`, preserved in its main checkout
`output/website-nine-languages-20261110/run-01/widget-sources/` with SHA-256 records.
No native screenshots were reconstructed. Adding these languages did not change data practices. The November 16 sharing
explanation is translated consistently across all nine privacy pages.

Verification: site tests, generated-page consistency, local links, reciprocal
language routes, localized feedback links, widget sources and live page readback.
