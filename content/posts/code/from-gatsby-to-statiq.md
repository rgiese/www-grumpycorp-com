---
title: From Gatsby to Statiq
published: 2023-06-03
---

## Goodbye JavaScript, and good riddance

I think good software should just keep on working.

[WarmAndFuzzy](/tags/posts/warm-and-fuzzy) has been controlling my house's heating for four years continuously with no reboots, no bugs, no refactors, nothing.
I couldn't be more proud.

However, it seems that the JavaScript/`npm` ecosystem punishes software that was built to just keep going (e.g. "We're deprecating your Node LTS version, you _must_ migrate").
WarmAndFuzzy is now at least a week+ of effort away from even being able _build_ again let alone advance, and I just don't have the time to deal with that.

## How we got here

I [moved this site to Gatsby](from-hugo-to-gatsby), a JavaScript and React-based static site generator, about four years ago.
At the time I was about to start the [WarmAndFuzzy](/tags/posts/warm-and-fuzzy) project, which I knew would be a full-stack TypeScript + React(Native) project,
so it made sense to invest in the JavaScript ecosystem across all my projects.

However, it seems that if you're not willing to invest about a day per quarter per project to move your dependencies to their latest-and-greatest versions,
enough breaking changes will accumulate that it becomes near-impossible to catch up.

At some point in the last two years I had wanted to write a new blog post but various dependencies refused to install and/or build,
so I had to spend a few days migrating this site from Gatsby v3 to v4 as that was apparently necessary to access newer package versions.
Not a good use of time, but okay, just the once.

The final straw was a recent attempt to rebuild WarmAndFuzzy in anticipation of some larger improvements I wanted to make.
It pretty quickly became clear that its dependencies were so out of date (e.g. Serverless Framework v1, now on v3)
that it was going to be a week or two to get it working again.
No thanks.

## Where we're going

I'll be moving WarmAndFuzzy away from the JavaScript ecosystem and towards an ecosystem that actually values longevity, which is .Net Core.
I figured I'd get back in the groove of C# by moving this site over to a C#-based static site generator, which is [Statiq](https://statiq.dev).
(It could have also been Python, for example, but I like statically typed languages.)

To be fair to TypeScript, I still think it's a great language. I'm not mad at the language (be it TypeScript or JavaScript),
I just don't have time to put up with its ecosystem.

## How it's going

It took me less time to migrate this entire site to Statiq than it took me to migrate Gatsby from v3 to v4.

Lines of actual (`.cs`/`.cshtml` and `.ts*`) code required to pull this site together:

- Gatsby: 1494
- Statiq: 576

Lolwut.

The outcome is pretty much the same (automated image resizing pipeline, archives, ...).

The development experience is a lot cleaner on Statiq, though the content _authoring_ experience is a bit faster on Gatsby
because they're a bit more aggressive about caching and evaluating what needs re-rendering.
I'm sure Statiq could get there (and/or I could make it work if I felt like it).

Overall, Gatsby suffers from making an extreme amount of complexity available via its GraphQL foundation
which is quite verbose, difficult to use and debug, and not something I need.

Statiq meanwhile relies largely on C# and the C# type system (and, by extension, the C# compiler) to make things work and it's glorious.

## Where we're going next

At some point AWS is going to pull the plug on the "ancient" version of Node I started running my lambdas on four years ago
so at that point I'm going to retire the entire stack and rebuild it as something local instead;
having the system globally available is cute but just not worth it.

Thankfully I don't need to heat much of anything over the summer so that buys me a few more months. :)
