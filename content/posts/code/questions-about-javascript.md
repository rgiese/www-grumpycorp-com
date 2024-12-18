---
title: Questions about JavaScript-based development
published: 2019-04-11
---

_**Updated** November 2019_: Adding some "helpful" links to
[a TV interview about the creation of JavaScript](https://www.youtube.com/watch?feature=youtu.be&v=MBmmZADfVSQ) and
a talk about [the history of JavaScript from 1995 to 2035](https://www.destroyallsoftware.com/talks/the-birth-and-death-of-javascript).

_**Updating** February 2020_: Adding a few proposed **Answers** throughout the post, based in part on conversations
with a Microsoft architect for TypeScript and Azure who kindly read over my post, and adding a new "lessons learned" section.

Having been a C++ guy for most of my life (and generally working on dank and musty OS stuff),
I've rather enjoyed my recent journey into learning JavaScript.

I believe in having good tools and knowing them well, and that's cheaper and easier if you have fewer tools.
I chose JavaScript as my new frontier because it allows me to do frontend, backend, and mobile with a single language
so there are fewer tools to learn.
(In practice this maps to React/Gatsby, Azure Functions, and React Native, respectively.)

(Of course if I tried hard enough I could do the same with C++ but I wouldn't be learning something new
and it's probably not the right application of C++ anyhow. And yes, I love C#, but we're trying to learn something new here,
and transpiling C# to WebAssembly is more adventure than I care for.)

After immersing myself in the world of JavaScript for about six months,
a bunch of questions have come up that I haven't yet been able to find good answers to.
It's easy to find answers on the internet for figuring out how to do things (_especially_ in the JS universe)
but it's much harder to find correct and up-to-date answers for figuring out how to do things _well_.

Thus, the following **questions**. If you have thoughts/answers/corrections, _please_ [email me](mailto:robin@grumpycorp.com).

## Front-loading correctness

I try to "front-load" correctness through my development environment.
I believe for JavaScript this means:

1. Using TypeScript (or Flow) for build-time type safety
1. Using TypeScript in `strict` mode
1. Using ESLint with all `recommended` defaults and close to zero exceptions
   - Use ESLint instead of TSLint since TSLint has been end-of-life'd
1. Using Prettier for code and metadata formatting
1. Running TypeScript checks, linting checks, and formatting checks as pre-commit hooks

**Question**: Is this an accurate approach to robust engineering practices?

Baseline expectation: `clang -Weverything`, `clang-format`.

**Answer**: Yes, pretty much. I recently tightened up [the `eslint` rules for WarmAndFuzzy](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/.eslintrc.js)
and that finally seems like a good starter kit.
I find `eslint` most useful for enforcing consistency; pretty much all the correctness stuff is caught with TypeScript proper.

## Parameter validation

TypeScript gets me build-time validation of parameters that can be validated at build-time. Yay.
But what about at runtime? What about incoming data like JSON snippets from web hooks, databases, etc.?

**Question**: What is the most elegant, [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)-compliant way to validate JSON?
I'm [currently](https://github.com/rgiese/warm-and-fuzzy/tree/fb95834f0d405867df3be92ea5d97d173fe39568/cloud/functions)
using [typescript-json-schema](https://github.com/YousefED/typescript-json-schema) to build JSON schemas from TypeScript typescript
at build time, then loading and executing them with [ajv](https://ajv.js.org/) at runtime.
Is this the right thing to do?

**Question**: What is the most elegant, DRY-compliant way to validate function parameters at runtime,
having already specified parameter types in TypeScript?

Baseline expectations: C++ and templates.

**Answer**: I've now settled on using [`yup`](https://github.com/jquense/yup) which allows you extract a TypeScript `type` from a `yup` schema.
However, I also need to decorate my types for [`dynamodb-data-mapper-js`](https://github.com/awslabs/dynamodb-data-mapper-js)
so I can't use that `yup` capability. Close enough.

## Immutable source trees

Working on Windows, I was taught that the build chain should treat the source directory as immutable,
placing intermediate files in a dedicated directory
and projecting (copy or symlink) runnable trees into another dedicated directory.

I haven't yet found much that does this in the world of JavaScript.

On a good day (e.g. [Gatsby](https://www.gatsbyjs.org/)),
output is projected into one or more subdirectories of my repo and at least all other directories are treated as immutable.

On a better day (e.g. [Hugo](https://gohugo.io/)), the path to the subdirectory is configurable so I can choose to move it out of the source tree,
it's just not a default.

On a worse day (e.g. [Azure Functions](https://github.com/mhoeger/typescript-azure-functions)),
the source directory is ZIP'd up into the actual production deployment package, requiring that
`tsc` place its outputs in a subdirectory of the source, that said outputs be excluded from source control with `.gitignore`,
that unnecessary/unwanted inputs (e.g. local dev secrets) be excluded from the ZIP file with `.funcignore`,
and that for order-of-magnitude size savings,
the `node_modules` directory be yanked from `dev` mode to `production` mode with an `npm prune --production`.

(And of course I have to close VS Code while doing this since its resident TypeScript host holds onto stuff that interferes with the `npm prune`. Dope.)

**Question**: This is nuts, right?

**Answers**: Yes. I now manage this pretty carefully with a `generated` directory for codegen'd stuff needed during the build,
and a `build` directory for build outputs, and it works for the [WarmAndFuzzy engineering system](/posts/warm-and-fuzzy/engineering-system/).

**Question**: What build tools would be the right tools to add into my build chain to fix this,
e.g. to project the right outputs including a `prod`-filtered `node_modules` tree?
[Gulp](https://gulpjs.com/)? [Grunt](https://gruntjs.com/)? [Webpack](https://webpack.js.org/)? Plain JavaScript build scripts?

I don't mind doing the work but it feels like every small-n months there's a new shiny way to build a build chain,
write a command-line app, or whatever else. Help!

**Answer**: `gulp` and `grunt` are old and should no longer be used in new projects (I am told).
For WarmAndFuzzy, Serverless and `react-scripts`/`react-native-scripts` did the trick, with a few specialized JavaScript-based build scripts thrown in.

## Deploying to prod from my laptop

Both major clouds (the fragmented-at-best landscape of the Azure CLI and AWS's impressive [Amplify](https://aws-amplify.github.io/) CLI, respectively)
make it really easy to stand up cloud resources from my laptop without source control.
That's really impressive. It's what the docs put front and center.

But it's also really fucking frightening.

I believe that any system that's not a toy project with zero users should be deployed through CI/CD only,
off configuration-as-code data only,
with proven/inspect-able chain-of-custody showing how we got from The Commit to The Production Environment as it stands.
Whether it's a question of functional correctness, security, or debug-ability, it comes down to the same process.

**Question**: Why is the difficulty of doing this _right_ (e.g. Terraform, CloudFormation, ARM templates)
vastly greater than doing it wrong (e.g. jumbles of imperative scripts, or even scarier, deploy-from-VSCode)?

**Answer**: Because this -- doing it the shoddy way -- is how we attract people to new tech, sadly.
The right way would just be intimidating and off-putting.
Also, it's a bit of a choice matrix problem since there are large-N technologies to build starter projects for and medium-N ways of doing CI/CD
so the matrix would just explode.

**Question**: Why do we (as an industry) send a siren call to engineers to use our "super-easy-to-use" platform
and point them to tools and samples that we (should) know have no relation to best operational practices
and just leave them with "look how shiny, now good luck with that"?

In Amplify's partial defense, they do at least seem to generate CloudFormation goop from ad-hoc CLI invocations
and you _can_ source-control that instead, but it's not exactly their elevator pitch.

**Answers**: Yep. It's an industry-wide problem so nobody is compelled to do better.

## Deploying per branch

**Question**: I can have a million cheap branches with `git` so why is it so hard to get a per-branch cloud environment stood up?
(I got it working for a simple SPA with a bunch of Terraforming and some CloudFlare worker magic but that took me a week.)
It feels like we're clapping with one hand.

**Answer**: We are, and there's a significant gap between what you see in starter projects and what big players actually do in practice.
It's too bad that this leaves smaller players with mostly anti-patterns.

**Question**: In Amplify's partial defense they support [environments](https://aws-amplify.github.io/docs/cli/multienv?sdk=js)
and that's finally out of beta. Is there an Azure equivalent, not that I'm dogmatically attached to Azure?

## Engineering quality of starter/example repos

There's an amazing amount of sample code out there.
Many frameworks (e.g. React, Gatsby, ...) offer "seed" kits for their framework to get you off the ground.

But most of what I've found doesn't follow my _front-loading correctness_ setup beyond step 1, _use TypeScript_
(without intending to undersell the importance of broad TypeScript adoption, which I find impressive),
or any of the other stuff discussed above.

Gatsby has a [TypeScript-based starter](https://github.com/haysclark/gatsby-starter-typescript)
but it uses TSLint instead of ESLint and doesn't bother to hook up ESLint as an `npm` package script,
making it the relative winner by getting kind of halfway down my list.

Azure Functions publishes a [TypeScript-based sample](https://github.com/mhoeger/typescript-azure-functions)
but it doesn't lint anything nor does it even pass TypeScript in `strict` mode (it explicitly turns `strict` off),
making it a runner-up by getting one step down the list.

**Question**: Why do I have such a hard time finding sample repos that actually teach robust engineering practices?
If you're advertising using TypeScript with service X (e.g. Azure Functions),
shouldn't you showcase the best practices of TypeScript for using X?

**Answer**: See above, basically.

Them's the questions for now - I'm sure there'll be more in the future.

## Lessons learned: Reflecting on JavaScript many thousands of lines of code later

**Added**: I'm glad I chose JavaScript for the WarmAndFuzzy project because it allowed for one consistent language
and loads of shared code between the backend and the frontend.

That said, I'd drop it in a heartbeat if there were a better language available that worked for both backend and frontend code.
Basic stuff like not being able to use anything other than strings as dictionary keys is just goofy.

JavaScript is coincident with advances in Functional-ish UI frameworks like React (which I love)
but there's no reason why those couldn't be (and are) built in other languages
(c.f. [Litho](https://github.com/facebook/litho) for Java and [ComponentKit](https://componentkit.org/) for Objective-C).
I look forward to something better taking JavaScript's place in the next few years and I think we'll all be better off for it.
