# FIRE public pages

Four locales × landing, support and privacy pages. Build with `npm run build:fire`;
`npm run check:site` verifies checked-in output. Shared masthead and reciprocal
language links use the existing static product-site builder.

iOS 1.0.0 (20261017105647) was manually released on 2026-10-20; native macOS
1.0.0 (20261020134800) was manually released on 2026-10-25. Both versions report
READY_FOR_DISTRIBUTION in ASC. The shared App Store link is App 6820084110;
the download metadata, catalog filter and all four landing-page locales cover
iPhone, iPad, Mac and Apple Watch. Mac requires macOS 14.0 or later.
Release evidence is in OpenYears docs/store/release-macos-20261025.json;
public native Mac storefront visibility is verified before merging this update.

Images are the approved FIRE icon and native widget renders exported by
`OpenYears/Tests/WidgetRendering/StoreCreativeRenderingTests.swift` on 2026-10-16.
They use fixed example records and the shipping `FirePalette` container fill;
no user financial data is used. These are widget renders, not device screenshots.
No analytics, ad scripts, embedded third-party form or additional backend is added.

Verification: site tests, generated-page checks, links/assets, four-language
390-point mobile overflow checks and desktop/mobile browser visual inspection.
