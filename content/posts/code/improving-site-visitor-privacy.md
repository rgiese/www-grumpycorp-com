---
title: Improving site visitor privacy
published: 2019-03-16
---

## Analytics

I don't necessarily mind shouting into the void with this write-only/comment-less site,
but I _would_ like to have some idea if anyone is coming to visit _at all_.

I've signed us (me and you, the reader) up for [simpleanalytics.io](https://simpleanalytics.io)
for site analytics. They collect [very little](https://simpleanalytics.io/what-we-collect)
and don't track individual visitors with cookies, making it GDPR-compliant without any opt-ins (as far as I can tell).
I also enjoy the notion of supporting an independent single-developer business.

I publish my [site analytics](https://simpleanalytics.io/grumpycorp.com) so you too can marvel at
~~my lack of visitors and senseless void-shouting~~ the (truly) joyful reality of SA's minimalist data collection policy.

## Decluttering other tracking

While I was at it, improving visitor privacy and all, I figured I should also remove all direct references to Google Fonts and Adobe TypeKit
since they're liable to engage in assorted visitor tracking and analytics that I didn't want to opt my visitors into non-consensually.

Google Fonts were embedded into static resources with near-zero effort using [gatsby-plugin-prefetch-google-fonts](https://www.gatsbyjs.org/packages/gatsby-plugin-prefetch-google-fonts/);
Adobe TypeKit was replaced by SVG-ifying the site logo (which is all it was used for anyhow).

Lastly, I used `simpleanalytics.io`'s custom subdomain feature to `CNAME` from `sa.grumpycorp.com` to their CDN
for the analytics script. This is the only content not directly served from the `www.grumpycorp.com` server
but it now at least comes from the `grumpycorp.com` TLD.

## Show me what you got

See [commit `2a126f0`](https://github.com/rgiese/www-grumpycorp-com/commit/2a126f04529287918922aa1682bbafaaa22c2416).
