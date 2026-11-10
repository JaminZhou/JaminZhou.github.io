# FIRE public pages

Nine locales × landing, support and privacy pages (27 pages):
en, zh-Hans, zh-Hant, ja, de, fr, es, ko and pt-BR. Build with `npm run build:fire`;
`npm run check:site` verifies checked-in output. Shared masthead and reciprocal
language links use the existing static product-site builder.

iOS 1.2.0 (20261109090903) was manually released on 2026-11-09;
native macOS 1.2.0 with the same build number followed on 2026-11-10.
Both report READY_FOR_DISTRIBUTION in ASC. The shared App Store link is
App 6820084110. iPhone, iPad and Mac 1.2 add free on-device Favorites,
Far Afield and Winter Retreat to the 22 free styles plus Sunday and Long Summer.
Requirements remain iOS / iPadOS 18, macOS 15 and watchOS 10.
Release evidence is in OpenYears docs/store/release-macos-1.2.0-20261110.json.
The US, CN and JP pages all show iOS and native Mac 1.2.0 at the
2026-11-10 09:41 +08 readback. Each Mac page has seven native screenshots,
a Get download offer, and is not the iOS-on-Mac compatibility listing.
The initial 09:36 readback still showed Mac 1.1.0 and is retained separately
in the release evidence. All nine locales now reflect the released 1.2.0
status across iPhone, iPad, Mac and Apple Watch.

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
No native screenshots were reconstructed. These translations preserve the
November 2 policy's meaning; adding languages does not change data practices.

Verification: site tests, generated-page consistency, local links, reciprocal
language routes, localized feedback links, widget sources and live page readback.
