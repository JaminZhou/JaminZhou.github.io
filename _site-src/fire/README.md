# FIRE public pages

Four locales × landing, support and privacy pages. Build with `npm run build:fire`;
`npm run check:site` verifies checked-in output. Shared masthead and reciprocal
language links use the existing static product-site builder.

iOS and native macOS 1.1.0 (20261102024337) were manually released on
2026-11-02. Both versions report READY_FOR_DISTRIBUTION in ASC. The shared
App Store link is App 6820084110; all four locales describe 24 styles (22 free,
Sunday and Long Summer optional), the current purchase rules and preserved
upgrade preferences. Requirements are iOS / iPadOS 18, macOS 15 and watchOS 10.
Release evidence is in OpenYears docs/store/release-1.1.0-20261102.json.
Public native Mac storefront visibility is verified before merging this update.

Images are the approved FIRE icon and native widget renders exported by
`OpenYears/Tests/WidgetRendering/StoreCreativeRenderingTests.swift` on 2026-10-16.
They use fixed example records and the shipping `FirePalette` container fill;
no user financial data is used. These are widget renders, not device screenshots.
No analytics, ad scripts, embedded third-party form or additional backend is added.

Release-copy verification: site tests, generated-page checks and links/assets.
The layout retains its earlier four-language 390-point overflow and desktop/mobile
visual checks; those checks are historical, not new release acceptance.
