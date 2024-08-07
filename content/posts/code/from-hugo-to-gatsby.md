---
title: From Hugo to Gatsby
published: 2019-02-06
---

When I started this site I was certain that I wanted to use a static site generator -
not only because I've been a software performance fiend for most of my career
but also for sentimental reasons, having written a `C++`-based static site generator around 22 years ago.

I started with [Hugo](https://gohugo.io/) since it was lauded for being fast and straight-forward;
however, over time it irritated me enough that I decided to move to [Gatsby](https://www.gatsbyjs.org/).

The overriding observation from my journeys into both Hugo and Gatsby is that, per usual, it's simple to do simple things
and the moment you want to do something more _right_ (by some definition of right), you're looking at a pretty steep cliff.

- Want to have images in blog posts? Easy. Want to get them automagically resized to and referenced for various display-specific sizes? Good luck.
- Want to use an SVG as a high-quality icon? Easy. Want to bundle those SVGs into a single file and still position them correctly? Good luck.
- Want to write fancy templates? Easy. Want to make those templates type-safe? Hard nope (Hugo) or good luck (Gatsby).
- Want to find an example or starter repo of (your favorite site generator) doing (whatever)? Easy. Want to find a version that does it with type safety? Good luck.

One of my main ambitions in designing software for engineers has been to create gentle slopes of increasing complexity rather than the walls I've been hitting with Hugo and Gatsby.
My hope is that I can at least provide some solutions below for both of these engines that may someday save someone some time and soften some of the walls.

# Life with `Hugo`

Note: you can time-travel through my site's corresponding GitHub repo to see [the last version of my Hugo-based site](https://github.com/rgiese/www-grumpycorp-com/tree/79dd544ded3d747fe3139ff29bb431d2c1d4236d),
as well as the [Gatsby-based version](https://github.com/rgiese/www-grumpycorp-com/tree/6ba3747e353297baae4240e200d843d57fc214cd) as of the time of writing for this post.

Hugo by itself is a fine tool but [until mid-2018](https://gohugo.io/news/0.43-relnotes/) did not have an asset pipeline, i.e. any way of optimizing images, stylesheets, etc., prior to publishing.
Since this is all as much a learning exercise as anything else I'm doing these days, I wanted to make sure to figure out all of this asset optimization goop.
While the "new" asset pipeline capabilities of Hugo are lovely, my host, [Netlify](https://www.netlify.com/), who is also one of the main sponsors of Hugo,
as of today still [doesn't support the version of Hugo that contains this asset pipeline](https://github.com/netlify/build-image/issues/254), six months after that feature's release.
(**Update** on 3/19/2019: this is now broadly available in Netlify, nine months after the capability was originally released.)
In internet times and terms, what even is this. To compensate I set up [Gulp](https://gulpjs.com/) as the build system around Hugo to get some semblance of an asset pipeline in place.

My final Hugo-based pet project had been to move my cute little post icons into SVGs courtesy of [The Noun Project](https://thenounproject.com/), an awesome bougie alternative to [FontAwesome](https://fontawesome.com/).
Now that I was the master of my own SVGs, I wanted to combine them into a single _bundle_ SVG so that as the site grew browsers wouldn't need to download _N_ individual SVGs.
With some [gnashing of teeth](https://github.com/rgiese/www-grumpycorp-com/commit/3d3cb60a71534e94801ff358d5a351dfa6471fe8) I managed to coerce Gulp and friends into building my SVG bundle.

Of course the details quickly got nasty.
A stand-alone SVG declares a `viewBox` attribute that tells the browser how big the sprite wants to be, allowing Chrome etc. to size and place it accordingly.
When you combine multiple SVGs into a bundle you end up with one top-level `<svg>` element containing a `<symbol>` per original SVG and each `<symbol>` declares its own `viewBox`.
For whatever reason, Chrome will not pull that `viewBox` off the `<symbol>` in the bulk SVG file when you reference the symbol from HTML (via `<svg><use href="bundle.svg#my-symbol"/></svg>`);
instead, it just assumes something giant and square-shaped and hopes that you'll override the width/height via CSS. It's not the end of the world but it makes aligning sprites with text baselines impossible.

The only solution is to also specify the `viewBox` at the site of `<use/>`, meaning that any generated HTML needs to reach into the SVG store and retrieve the original `viewBox` attribute at build time.
(No, you can't do it via JavaScript at runtime because the element behind the `<use/>` is a closed shadow DOM so you can't reach into it. Whatever.)

So I figured, sure, I can [extract the SVG metadata from the SVG store at build time](https://github.com/rgiese/www-grumpycorp-com/commit/79dd544ded3d747fe3139ff29bb431d2c1d4236d) into a JSON file
and then somehow inject it back into my Hugo [shortcode](https://gohugo.io/content-management/shortcodes/) that manages my SVG store references.
Given that Hugo is a data-driven site generator this shouldn't have been hard.

Except, of course, access to data in Hugo is managed through its [data templates](https://gohugo.io/templates/data-templates/) which are not available inside of shortcodes where I really needed them.
While an existing "data-driven content" feature could have allowed my shortcode code to make a direct JSON query as well, I'd have then had to spend even more time with Hugo's bizarre templating language
which looks like some bastardized form of Go that I cannot wrap my head around. For example, take:

```Go
{{ $.Scratch.Delete "cardIcon" }}
{{ if and (isset .Params "icon") (.Params.Icon) }}
  {{ $.Scratch.Set "cardIcon" .Params.Icon }}
{{ else if .Params.Repo }}
  {{ $.Scratch.Set "cardIcon" "logo-github" }}
{{ else }}
  {{ $.Scratch.Set "cardIcon" "grumpy-robin" }}
{{ end }
...
{{ partial "svg-icon.html" (dict "icon" ($.Scratch.Get "cardIcon") "class" "w3 h3") }}
```

...what even is that?

At this point

- my hosting outfit wasn't making my life any easier,
- I was already doing unmentionable things inside of Gulp in JavaScript and didn't want to do even more of them,
- and I was fighting this difficult-to-read templating langugage at every turn.

In the end I figured let's just go all-in on JavaScript and move away from Hugo.
I also considered [Hexo](https://hexo.io/) but I wanted to spend more time with [React](https://reactjs.org/) (as much as anyone ever _wants_ to),
so Gatsby it was.

# Life with `Gatsby`

Several days later, life with Gatsby is lovely and it's just as fast as Hugo once it's running (for this site it has a ~15 second startup cost before it's rolling and monitoring for changes).

But boy howdy have we all in the software world collectively **lost our damn minds**.
I have preserved the full progressive misery of bringing up the site in Gatsby in [over 60 commits](https://github.com/rgiese/www-grumpycorp-com/tree/gatsby)
and I'm keeping that branch around for the sheer insanity of it all.

The [initial starter setup](https://github.com/rgiese/www-grumpycorp-com/tree/602f461ba767a64705eea21026a61f0247a8548b) generated by `gatsby new` isn't bad.
However, many of the starter samples and even portions of the **bloody [tutorial](https://www.gatsbyjs.org/tutorial/part-four/)** on the Gatsby site
include mountains of CSS and other styling junk that clog up the code and make forming a deep understanding of the code needlessly difficult.
I always felt the point of any example (particularly in a tutorial) was to concisely teach the stuff that mattered and how things worked,
not just provide opaque copypasta material. Whatever.
A simple `gatsby new` at least only leaves you with [620 lines of CSS garbage](https://github.com/rgiese/www-grumpycorp-com/blob/602f461ba767a64705eea21026a61f0247a8548b/src/components/layout.css)
that can be ignored fairly easily.

Next, I [prepped the codebase for ESLint](https://github.com/rgiese/www-grumpycorp-com/commit/8ec1e07622a4221f1046875c5d552efbfaa639cb),
[moved the code to TypeScript](https://github.com/rgiese/www-grumpycorp-com/commit/6558f26de31589a6f4695be3d130a6aa4a085149),
set up [`prettier.io`-based code formatting](https://github.com/rgiese/www-grumpycorp-com/commit/4bf606201539d96b26bfdb2156688e9d67e402a3),
and added both [`prettier` checks](https://github.com/rgiese/www-grumpycorp-com/commit/695764285ca4b337cc70b3fb0843587a6d6c58e1)
and [TypeScript checks](https://github.com/rgiese/www-grumpycorp-com/commit/85996d2c92cf0d3a35c0fa0b2d00f1101919e6aa) as `git` pre-commit hooks.
I would love for every Gatsby starter template to come with this configuration straight out of the gate because it's clearly The Right Thing&trade; to do.
If you ever need to do this, check out the diffs linked to above or just look at [the entire repository](https://github.com/rgiese/www-grumpycorp-com/tree/576506c2b748da6293e4f3d23d5f3442181d76f4)
at that state since it hadn't really received much of any customizations by that point aside from my name.

Image processing for images referenced in Markdown is reasonably simple: you configure [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark)
to transform your Markdown into HTML, and then configure it to use the [`gatsby-remark-images`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-images) plugin for image processing and optimization.
However, I just _had_ to be extra and use [MDXjs](https://mdxjs.com/) instead of plain Markdown for my posts so that I could reference React/JSX components from inside my Markdown so I could build a [Vimeo player shortcode](https://github.com/rgiese/www-grumpycorp-com/commit/0112b1e4920693f9c84debd6043adcd0a097ac5c).
The main [trickery](https://github.com/rgiese/www-grumpycorp-com/commit/aea2e6c30a90b43307976facf84a2d59f596b7d2) in this move was realizing that I could use `gatsby-transformer-remark`-based plugins
like `gatsby-remark-images` from `gatsby-mdx` since it offered a `gatsby-transformer-remark`-compatible processing stage - fancy but circuitous.

A neat way to modify and extend Gatsby behavior is by providing custom hooks in the magical `gatsby-node.js` file; among other things, this is where the generation of pages and hooks ("slugs") from Markdown content happens.
(This, by the by, is one of the reasons why Gatsby isn't exactly a blog 101 sort of engine - you _have_ to write JavaScript for even the most basic blog posts to exist.)
Given my obsession with TypeScript, I ventured to move all my `gatsby-node.js` code into TypeScript, which required shelling out to a `gatsby-node.ts` from within `gatsby-node.js` using `ts-node`, considering
that the regular TypeScript compilation of site code hasn't occurred when `gatsby-node.js` is run.
The differences between CommonJS `require` and ES6 `import` are just enraging and make me fear for humanity, but I [got it to work eventually](https://github.com/rgiese/www-grumpycorp-com/commit/0bcff9395649dc5cac559c74c111f126f161e560).

While Hugo recently built its own asset pipeline, Gatsby just calls out to `webpack` underneath the covers, and the specifics of this can again be configured through hooks in `gatsby-node.js`.
The specifics of [using `webpack` and `svg-sprite-loader` to bundle SVGs](https://github.com/rgiese/www-grumpycorp-com/commit/6437be9e869cd18c67d13d28f9a50e607da88732) were immensely gnarly, in part because Gatsby forcibly injects
a default configuration into `webpack` that needs to be carefully reworked to process SVGs the way I want to (for bundling purposes), instead of just snarfing them up in a file copy. This led to the following piece of insanity:

```JavaScript
//
// Gatsby injects a url-loader rule for SVGs
// (see https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack-utils.js)
// that we need to remove in order to allow the svg-sprite-loader plugin to process SVGs instead.
//
// Gatsby creates the rule with a test of /\.(ico|svg|jpg|jpeg|png|gif|webp)(\?.*)?$/.
//
// This code is based on https://github.com/marcobiedermann/gatsby-plugin-svg-sprite/blob/master/gatsby-node.js
// which checks for the precise text of the test expression and if found, replaces it with its own definition
// which simply has the svg extension removed.
//
// However, checking on the full text of the test and replacing it with a corrected full text feels sketchy; as such,
// we'll just check on the |svg| sub-portion of the test regular expression and remove only that sub-portion.
//
config.module.rules = [
  ...config.module.rules.map((item: any) => {
    const { test } = item;

    const svgCheck = /\|svg/;

    if (test && svgCheck.test(test.toString())) {
      const revisedTestString = test.toString().replace(svgCheck, "");

      return {
        ...item,
        test: new RegExp(revisedTestString),
      };
    }

    return { ...item };
  }),
  ];
```

And for what it's worth, weird things started happening later when I referenced icons both from Markdown as well as from JSX;
if you want to do this yourself, reference the above commit as well as [this one](https://github.com/rgiese/www-grumpycorp-com/commit/e5248e1d3601ad56081698f33871a697bec0c811),
about which I'll just say that the commit description includes the word _madness_.

On the vaguely pleasant side, having Gatsby itself be written in JavaScript makes it easy for me to read the source of various plugins and transformers and figure out what's happening.
For example, in the Hugo version, I had hand-crafted an [image shortcode](https://github.com/rgiese/www-grumpycorp-com/blob/79dd544ded3d747fe3139ff29bb431d2c1d4236d/site/layouts/shortcodes/img.html)
for use in Markdown post files to surround images in my posts with a nicely styled title bar.
In Gatsby I was using the `gatsby-remark-images` plugin to transform image links and didn't want to deal with building my own React component to host images since it would just confound
the image processing pipeline, but reading the source for said plugin I figured out that I could just use [image titles](https://github.com/rgiese/www-grumpycorp-com/commit/6ae733cc3c8a82e4803318b54126b99484c5f2fc)
and some creative CSS to get the same effect. I could have likely achieved something similar in Hugo but I'm not particularly keen on learning both Go, Hugo templates, and JavaScript all at the same time,
so this was a nice advantage of Gatsby.

Another nice trick in Gatsby is the compositional capability of code+data with GraphQL fragments.
For better or worse, code and data (sourcing, via GraphQL) are both written side-by-side in JSX (though I suppose if you really wanted to, you could hoist all the queries
to the very top, but eeeeeeh...). Gatsby harvests all `export`ed GraphQL snippets from all JSX and gloms them together for each query. This means that I can have a component
such as [`postIndex.tsx`](https://github.com/rgiese/www-grumpycorp-com/blob/3cb6eccce5ec707039e1543a4d16e813429b7390/src/components/postIndex.tsx) define how it wants
to receive the data for an index of posts as a GraphQL fragment alongside the definition the React component rendering that data, while its parent
[`index.tsx`](https://github.com/rgiese/www-grumpycorp-com/blob/3cb6eccce5ec707039e1543a4d16e813429b7390/src/pages/index.tsx) builds the top-level GraphQL query defining
_which_ posts I want indexed using the GraphQL fragment contributed magically (via `export`) from `postIndex.tsx` to declare the shape of the returned data, and then just
hand all that data to the `PostIndex` function component. It took me a while to sort out just how I wanted to structure that composition but this approach currently makes
the most sense to me.

It's a bit unfortunate that I need to effectively define the shape of the data I want to retrieve (GraphQL) and its typing (TypeScript) in duplicate, e.g.:

```TypeScript
// GraphQL fragment to be used by caller
export const tagsQueryFragment = graphql`
fragment TagListTags on MdxConnection {
  distinctTags: distinct(field: frontmatter___tags)
}
`;

// Corresponding TypeScript definition
export interface ITagListTags {
  distinctTags: string[];
}
```

I haven't figured out how to auto-generate the TypeScript definitions from any GraphQL schema because the GraphQL schema is dynamically generated partway through the Gatsby-internal
build process once it's sorted out all of its data sources. There may be a way to inject something there but it didn't seem worth my while to die on that hill just yet.

Another Gatsby feature I worked out eventually was that any code-generated page (i.e. a page created from code in `gatsby-node.js`) can get passed a "page context"
at page generation time (e.g. the slug of the post, etc.) from your code in `gatsby-node.js`. I went through the trouble of exporting the TypeScript definition of that
page context from each template page (e.g. `IPostPageContext` in [`post.tsx`](https://github.com/rgiese/www-grumpycorp-com/blob/3cb6eccce5ec707039e1543a4d16e813429b7390/src/templates/post.tsx))
and then importing it in `gatsby-node.js`->[`createPages.ts`](https://github.com/rgiese/www-grumpycorp-com/blob/3cb6eccce5ec707039e1543a4d16e813429b7390/src/gatsby/createPages.ts)
to stand up a strongly typed page context rather than throwing some stuff over the Gatsby wall and hoping it stuck.

Wrapping it all up (literally, almost) was some [CSS magic](https://github.com/rgiese/www-grumpycorp-com/commit/aa97b382ce5788c57606ae11f7e7396753907b5e)
in service of `flexbox` thanks to React's injected top-level `<div>`s, and we were ready to roll into production.

On the plus side, moving to Gatsby has been a fascinating journey into JavaScript, TypeScript, `webpack`, the implementation details of SVGs, and so much more.

On the 'gives me pause' side, while many of capabilities of modern JavaScript are rather magical, I also cannot help but feel like we've taken a major step back from older compiled languages
like C++ where type safety was just built in.
The fact that it's kinda just a thing that many JavaScript projects aren't using TypeScript or Flow or that Gatsby makes no
effort to synthesize TypeScript type definitions for any of the data it throws at pages, templates, and components
makes me fear for our collective future (hyperbolically speaking).

Of course I recognize the irony of advocating for slowly increasing complexity in engineering environments while also waxing poetic about C++,
but surely there has to be some compromise between scaling complexity and discipline/safety/etc.

In closing, as the old joke goes (internet traffic is evenly composed of Netflix streams and `npm` fetches), my `node_modules` directory for this site is **325MB**.
What even is this. The future is bright and terrifying.
