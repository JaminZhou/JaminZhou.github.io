# FIRE public pages

Four locales × landing, support and privacy pages. Build with `npm run build:fire`;
`npm run check:site` verifies checked-in output. Shared masthead and reciprocal
language links use the existing static product-site builder.

iOS 1.0.0 (20261017105647) was manually released on 2026-10-20. ASC reports
READY_FOR_DISTRIBUTION; the US and Japanese public storefront lookup returns
App 6820084110, version 1.0.0. China mainland propagation was still pending at
that check. The download CTA and structured data cover iPhone, iPad and Apple
Watch only. Mac remains WAITING_FOR_REVIEW and is labeled separately in every
landing-page locale. Release evidence is in OpenYears docs/store/release-20261020.json.

Images are the approved FIRE icon and native widget renders exported by
`OpenYears/Tests/WidgetRendering/StoreCreativeRenderingTests.swift` on 2026-10-16.
They use fixed example records and the shipping `FirePalette` container fill;
no user financial data is used. These are widget renders, not device screenshots.
No analytics, ad scripts, embedded third-party form or additional backend is added.

Verification: site tests, generated-page checks, links/assets, four-language
390-point mobile overflow checks and desktop/mobile browser visual inspection.
