---
title: From Statiq to whatever
published: 2024-03-28
---

## Well that didn't last

[Less than a year ago](../from-gatsby-to-statiq/), I moved this little site away from using [Gatsby](https://gatsbyjs.org/) as its static site generator.

My main complaint at the time was that Gatsby's semi-frequent architectural changes kept breaking my site
and I didn't want to be in the business of being a web engineer, I just wanted to write on the web.

Much of that was just a function of Gatsby choosing some of the most extravagantly complicated and ever-shifting tech (React, GraphQL)
for something that could have been very simple, so I went in search of something simpler. Enter [Statiq](https://statiq.dev).

What I liked about Statiq:

- Based on C#
- Based on an ancient but perfectly viable templating engine (.Net Razor)
- Allowed for automatic image resizing (and this is a fairly image-heavy site)

## Goodbye Statiq

What I did not end up liking about Statiq:

- Internal workings are inscrutable and I don't feel like taking the time to debug them when I need to do anything non-obvious
- Automatic image resizing seemingly wants to re-run on every render

That last point really pushed me over the edge: every content update (i.e. my "inner loop" while editing) took well over thirty seconds
and that really just takes the fun out of it.

## Then what

The clarifying realization was that I wasn't inherently peeved at any of the languages (JavaScript or C#, the use of Markdown and templating engines, etc.).
Instead, I was peeved at the _orchestrator_, the top-level engine holding it all together, because for both Gatsby and Statiq,
the engine was just too complicated for my rather humble needs.

Let's just admit that I'm a high-anxiety person who wants to _understand_ everything _just in case_.
Let's also admit that in decades of professional engineering, largely with a focus on foundational quality,
I have lost any faith I might have ever had in wishful thinking and hoping that whatever abstraction you're sitting on top of
is going to carry you across the river no matter what.
More often than not, that abstraction itself is built by its own bunch of clowns exercising their own wishful thinking,
hoping that whatever abstractions they themselves are standing on are going to hold together (plot twist: they won't).
And this is why modern software quality is awful.

And the existing static site generator engines could not be understood in the time I was willing to throw at them.

So I built my own.

## Hello again ~JavaScript~ TypeScript

I've been doing some web engineering (the thing I said I didn't want to be doing) but for a good cause:
[TheOp.io](https://www.theop.io/), a teaching resource for camera operators run by my amazing friend [Dave Chameides](https://www.imdb.com/name/nm0150505/).
He's one of the most giving people I've ever met and it's been a privilege getting to support his efforts.

That site is hosted on SquareSpace and I'm injecting a bunch of [unholy client-side JavaScript](https://github.com/theop-io/theop-io-static)
to do all the things I would be doing server-side if only SquareSpace would let me.
However, SquareSpace is aggressively adhering to their core product-market-fit: they tried allowing for server-side customization (with their 7.0 release)
and then backed away from it (with their 7.1 release) and as much as I dislike the outcome, I admire their commitment to their principles.

Anyhow, so with all this TypeScript under my belt, I figured I'd spend a day or two seeing what I could come up with.

As of right now, I'm using:

- [Marked.JS](https://marked.js.org/) to process my Markdown (the main post content)
- [Marked-Directive](https://github.com/bent10/marked-extensions/tree/main/packages/directive) to provide custom directives (a.k.a. shortcodes or components) to my Markdown
- [Gray-Matter](https://github.com/jonschlinkert/gray-matter) to read the metadata from each Markdown file, and (per usual) [yup](https://github.com/jquense/yup) to schematize it
- [Eta](https://eta.js.org/) to process my top-level layout template as well as index pages
- [jsdom](https://github.com/jsdom/jsdom) to parse the generated HTML and make sure all my site-internal links work
- [sass](https://github.com/sass/sass) to process SCSS
- [sharp](https://github.com/lovell/sharp) to resize images
- [tsx](https://github.com/privatenumber/tsx) to execute the whole thing
- [http-server](https://github.com/http-party/http-server) to run a local development server with no code or config
- [minify-html](https://github.com/wilsonzlin/minify-html) to strip comments from the generated HTML in production because y'all don't need to waste your transfer time on my internal documentation

...and it's glorious.

A full re-build of the site takes under four seconds (down from thirty in Statiq) capitalizing on _that one weird trick_ where
if my resized image already exists, I don't re-resize it again!

But more importantly, I now fully _understand_ how the site comes together because I get to control every single step of every single byte of output.

## By the numbers

Last year it took me less time to migrate the entire site to Statiq than it took me to migrate Gatsby from v3 to v4.

This year it took me about the same amount of time to build an entirely bespoke static site generator as it did to move to Statiq.

Lines of actual (`.ts*`, `.cs`/`.cshtml`, and `.eta`/`.ts`, respectively) code required to customize the site:

- Gatsby: 1494
- Statiq: 576
- Whatever this is: 581 (258 in `.eta`, 323 in `.ts`)

The static site generator **engine**, including Markdown processing, Eta templating, SCSS processing, automatic image resizing, link validation, and minification:
**609 lines of TypeScript**.

Lolwut.

I've been fighting publicly available static site generators for going on five years so I wouldn't need to write ~600 lines of TypeScript? Inconceivable.

## Changes made

This redo was also an opportunity to refresh the home (i.e. index/root/...) page of the site.
Previously it was just the most recent blog post which left site visitors with a somewhat topically random first bite.

I've changed the home page to instead be a curated collection of images and links to better present an overview of &lt;gestures broadly&gt; _whatever the hell this thing is_,
which at the moment would be me, an off-hours/freelance/free creative, looking for opportunities to be a part of interesting film productions. Cool cool.

This also kept me from having to figure out how to rewrite the location-relative links to images and other pages that live inside each post
(they would break if I just copy-pasta'd the latest post's content to the root index page) so to some extent this improved home page was also just an exercise in laziness.

## Promises kept

This site continues to keep its promise of being [engineered for privacy first](/posts/code/improving-site-visitor-privacy/):

- All assets are served directly from my domain, including all stylesheets, fonts, and images
- The only visitor tracking is done via [SimpleAnalytics](https://www.simpleanalytics.com/), a tiny EU-based shop that never stores PII
- No client-side JavaScript (with the exception of the tiny snippet necessary to make SimpleAnalytics work)

## Promises made

If you would like to use my static site generator, you're welcome to steal it from [this site's source code](https://github.com/rgiese/www-grumpycorp-com).

If you'd like me to spin that code into its own reusable package, just [hit me up](mailto:robin@grumpycorp.com).
