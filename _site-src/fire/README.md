# FIRE public pages

Four locales × landing, support and privacy pages. Build with `npm run build:fire`;
`npm run check:site` verifies checked-in output. Shared masthead and reciprocal
language links use the existing static product-site builder.

iOS 1.2.0 (20261109090903) was manually released on 2026-11-09;
native macOS 1.2.0 with the same build number followed on 2026-11-10.
Both report READY_FOR_DISTRIBUTION in ASC. The shared App Store link is
App 6820084110. iPhone, iPad and Mac 1.2 add free on-device Favorites,
Far Afield and Winter Retreat to the 22 free styles plus Sunday and Long Summer.
Requirements remain iOS / iPadOS 18, macOS 15 and watchOS 10.
Release evidence is in OpenYears docs/store/release-macos-1.2.0-20261110.json.
The US, CN and JP iOS pages show 1.2.0; native Mac pages still showed 1.1.0
at the 2026-11-10 09:36 +08 readback. Continuing Jamin's release SOP and
previous explicit website-deployment authorization during propagation, all
four locales state that Mac 1.2.0 has been released but may still appear as
1.1.0 in some storefronts. This deployment does not assert completed Mac
App Store propagation.

Images are the approved FIRE icon and native widget renders exported by
`OpenYears/Tests/WidgetRendering/StoreCreativeRenderingTests.swift` on 2026-10-16.
They use fixed example records and the shipping `FirePalette` container fill;
no user financial data is used. These are widget renders, not device screenshots.
No analytics, ad scripts, embedded third-party form or additional backend is added.

Release-copy verification: site tests, generated-page checks and links/assets.
The layout retains its earlier four-language 390-point overflow and desktop/mobile
visual checks; those checks are historical, not new release acceptance.
