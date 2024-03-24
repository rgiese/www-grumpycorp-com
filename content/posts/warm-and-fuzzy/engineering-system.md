---
title: "Building a full-stack monorepo engineering system"
published: 2020-02-05
keywords:
  ["IoT", "AWS", "Lambda", "DynamoDB", "Serverless", "TypeScript", "React", "ReactNative", "GraphQL", "Particle", "C++"]
---

## Monorepo or bust

Everything for WarmAndFuzzy lives in [a single monorepo](https://github.com/rgiese/warm-and-fuzzy),
including a Serverless/AWS-based backend and API, React and ReactNative-based frontends, and C++ device firmware.
(There's [one tiny exception](https://github.com/rgiese/warm-and-fuzzy-ci-images) we'll discuss later.)

The ability to keep all changes in a single repo and not have to worry about coordinating commits and PRs
across multiple repos, build definitions, etc. has been invaluable, considering that most of my PRs
flow across package lines.

With technologies like React/ReactNative/Serverless in a streamlined monorepo,
my engineering experience has been better than in any other environment I've worked in before,
particularly when it comes to the speed of the inner loop
(the time from saving in the editor to seeing the change built and running, generally a second or two)
and the ease of cross-component updates.

There's a lot to complain about in the JavaScript-based development ecosystem
but - given sufficient investment - the engineering system and experience is pretty rad.

## Streamline all the things

Life gets a lot easier when things are consistent.

While it's wonderful that so many technologies (React, Serverless, ...) have starter projects to get you off the ground,
regrettably none of them are consistent with one another.
It makes because, truly, why would or should they be - there are so many choices out there and many of them are pretty good
(except plain JavaScript without TypeScript or Flow - never do that),
but it does mean that a lot of gardening needs to take place.

The following is what I found useful:

- All code is managed through as an `npm` (or rather `package.json`) package, regardless of whether it's actually JavaScript or not (so even the C++ firmware code).
- All code uses its package's `npm` lifecycle[^1] scripts to build and deploy.
- All packages are managed through [`lerna`](https://lerna.js.org/).
  - Packages depend on each other as relative/local packages (rehydrated via `lerna bootstrap`) so there's no package registry to maintain.
- The lifecycle scripts in all packages are named consistently.
- All packages share a top-level [`tsconfig.common.json`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/tsconfig.common.json)
  and technology-specific adjustments per package are kept to a minimum.
- All packages share a top-level [`.eslintrc.js`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/.eslintrc.js)
  and there are no package-specific adjustments.
- [`prettier`](https://prettier.io/) and various `eslint` rules are used for all formatting and there are no package-specific adjustments.
  - There's a [`format-fixes`](https://github.com/rgiese/warm-and-fuzzy/tree/master/packages/format-fixes) meta-package
    whose job it is to run `prettier` on everything above the `packages` directory, e.g. the top-level `README.md`, CircleCI files, etc.
- All paths have consistent naming so having a single top-level `.gitignore` is a lot easier to maintain.
  - `generated` for generated files that are used as build inputs,
  - `build` for build outputs, etc.

I'm not using [`husky`](https://github.com/typicode/husky) pre-commit hooks in this repo (it just feels a tad slow on commits)
though I do use them in other projects; linting at least is enforced in CI.
Using `husky` would be better on paper but I hate having to make everything `lint` perfectly for each commit
so it would really just cause me to make fewer commits with more steps in them, and that's not good for anyone.

Managing `lerna`-based packages can be a bit extra when it comes to updating packages and re-linking them.
When in doubt, run `lerna bootstrap`. When still in doubt, do what everyone else in the JavaScript yoloverse
does and run `lerna clean` to nuke `node_modules`. What a waste.
More helpful notes to myself are in my [`README.md`](https://github.com/rgiese/warm-and-fuzzy/blob/master/README.md).

## Build all the things

I chose [circleci.com](https://circleci.com/) as my cloud-hosted CI system over Travis at a time when rumor had it that Travis was maybe getting a bit abandoned.
It's worked out fine -- it's amazing what you get to do on a free plan.

### A brief interlude to bitch about YAML

CircleCI's setup is defined in YAML.
If you want a data definition language that doesn't allow for (or requires) code execution (e.g. JavaScript),
YAML is a better choice than JSON because at least you get to write comments.
(If you were going to suggest XML, kindly don't.)

That said, CircleCI's YAML parsing is a bit whack with its requirements on indentation.
For example, why does it have to be:

```YAML
- restore_cache:
    keys:
      - v1-dependencies-{{ checksum "package.json" }}
```

...rather than:

```YAML
- restore_cache:
  keys:
  - v1-dependencies-{{ checksum "package.json" }}
```

I feel like the YAML parser used by the Serverless framework is more flexible, e.g.:

```YAML
- Effect: Allow
  Action: kms:Decrypt
  Resource: "arn:aws:kms:#{AWS::Region}:#{AWS::AccountId}:alias/aws/ssm"
...
api_config_get:
  handler: src/rest/v1/config/index.get
  events:
    - http:
        method: get
        path: api/v1/config
        cors: true
        authorizer: auth0Authorizer
```

The CircleCI YAML parser will vomit up some really difficult to understand error message into a failed build instance on their site
and then I need to get the [CircleCI CLI](https://circleci.com/docs/2.0/local-cli/) and run `circleci config validate`
to trial-and-error the indentation locally. Ugh.

Regardless, once it works it's pretty awesome.

### Clowning our way towards release management

I duct-taped myself a build-release workflow like so:

```YAML
workflows:
  version: 2

  cloud-and-firmware:
    jobs:
      - build:
          context: warm-and-fuzzy-particle
      - hold-to-deploy-cloud:
          type: approval
          requires:
            - build
      - cloud-deploy:
          context: warm-and-fuzzy-aws
          requires:
            - hold-to-deploy-cloud
      - hold-to-deploy-firmware:
          type: approval
          requires:
            - build
          filters:
            branches:
              only: master
      - firmware-deploy:
          context: warm-and-fuzzy-particle
          requires:
            - hold-to-deploy-firmware
          filters:
            branches:
              only: master
```

It works; it's just a touch awkward since CircleCI still isn't sure whether their site wants to push you
towards their jobs UX (the default) or the workflows UX (what I want) -- growing pains I suppose -- so it requires some extra navigating from time to time.

And yes, I could probably use tags in `git`/GitHub for release management instead of the holds - it just hasn't felt necessary yet.

### And yet I am happy

CircleCI surely is not the fastest (...on the free tier...) and there's further boneheaded stuff (like you can't edit a secret a.k.a. context, you have to delete it and redefine it)
so that, again, compared to Azure Pipelines, it feels a bit clowny, but it gets you through the day.
(I didn't use Azure Pipelines because I wanted to try out an entirely Microsoft-free system, other than obviously TypeScript and VSCode,
the two pieces of Microsoft tech one is allowed to use without negative Silicon Valley karma points, it seems.)

And because all the `npm` lifecycle scripts are consistent and all-encompassing, the actual work specified in the CI definition is basically trivial. Woot!

### Managing secrets

I need to keep a bunch of build- and deploy-time secrets (e.g. Android store upload keys).
Some of them are short text strings like passwords, others are binary files like p12 keys for the Google Play store.
It felt awkward trying to jam those into environment variables (especially the binary files),
particularly since I wanted them both in CircleCI and on my local dev machines.

I came across a technique [somewhere on the internet](https://stackoverflow.com/questions/16056135/how-to-use-openssl-to-encrypt-decrypt-files)
to encrypt files in the repo and then dressed it up a bit for my code base:

- Modify `.gitignore` to exclude `*.decrypted`
- Save secrets in plaintext files with a `.decrypted` extension (e.g. `waf-upload-key.keystore.decrypted`)
- Reference secrets from these files in build automation (c.f. the [mobile app post](/posts/warm-and-fuzzy/mobile-app/)).
- Create a random password with 1Password
  - Set it in an environment variable for local development (e.g. `WAF_GIT_SECRETS_KEY`)
  - Create a CircleCI context with that environment variable and assign it on the CircleCI job(s) in question
- Create encrypt/decrypt lifecycle scripts in `packages.json`:

```json
"scripts": {
  ...
  "decrypt-secrets": "npm-run-all decrypt-secrets:*",
  "decrypt-secrets:keystore": "cross-var openssl aes-256-cbc -d -out android/app/waf-upload-key.keystore.decrypted -in android/app/waf-upload-key.keystore.encrypted -k $WAF_GIT_SECRETS_KEY",
  "decrypt-secrets:keystore-password": "cross-var openssl aes-256-cbc -d -out android/app/waf-upload-key.password.decrypted -in android/app/waf-upload-key.password.encrypted -k $WAF_GIT_SECRETS_KEY",
  "decrypt-secrets:google-play-service-account": "cross-var openssl aes-256-cbc -d -out android/app/google-play-service-account.p12.decrypted -in android/app/google-play-service-account.p12.encrypted -k $WAF_GIT_SECRETS_KEY",
  "encrypt-secrets": "npm-run-all encrypt-secrets:*",
  "encrypt-secrets:keystore": "cross-var openssl aes-256-cbc -e -in android/app/waf-upload-key.keystore.decrypted -out android/app/waf-upload-key.keystore.encrypted -k $WAF_GIT_SECRETS_KEY",
  "encrypt-secrets:keystore-password": "cross-var openssl aes-256-cbc -e -in android/app/waf-upload-key.password.decrypted -out android/app/waf-upload-key.password.encrypted -k $WAF_GIT_SECRETS_KEY",
  "encrypt-secrets:google-play-service-account": "cross-var openssl aes-256-cbc -e -in android/app/google-play-service-account.p12.decrypted -out android/app/google-play-service-account.p12.encrypted -k $WAF_GIT_SECRETS_KEY",
}
```

- Add corresponding lifecycle to top-level `package.json`:

```json
"scripts": {
  ...
  "decrypt-secrets": "lerna run decrypt-secrets --parallel",
  "encrypt-secrets": "lerna run encrypt-secrets --parallel",
}
```

- Add `npm run decrypt-secrets` step to CircleCI job definition.
- `npm run encrypt-secrets` and commit.
- All done.

For true production code you're likely better off using something like `gpg` but this felt close enough.
May improve this in the future.

### Managing CI containers

I was initially using [CircleCI's built-in containers](https://github.com/CircleCI-Public/circleci-dockerfiles/tree/master/node/images) for my build executors
and it worked great.
I needed to step up my game, though, in order to work with [Flatbuffers](https://github.com/google/flatbuffers) (more on why in a future post).

I needed `gcc` to build the Flatbuffers toolchain and I wanted to keep the built toolchain in the container rather than having to rebuild it constantly.

I started by creating [a new repo](https://github.com/rgiese/warm-and-fuzzy-ci-images)
forked from [CircleCI's dockerfile-wizard repo](https://github.com/circleci-public/dockerfile-wizard)
and went through their wizard steps to get something with Node and Python.

The script-generated container definition compiles Node from scratch which takes sort of forever. That's not useful.
So I ditched everything they'd generated and instead built a really simple `Dockerfile` from the ground up:

```Dockerfile
# Use Node LTS for now (be boring)
FROM node:12.14-buster

RUN apt-get update
RUN apt-get install -y apt-utils

#
# C++ toolchain
#

RUN apt-get install -y git make cmake gcc g++

ENV GRUMPYCORP_ROOT /usr/grumpycorp


#
# Flatbuffers
#

ENV FLATBUFFERS_RELEASE v1.11.0

# Clone flatbuffers source
WORKDIR ${GRUMPYCORP_ROOT}
RUN git clone https://github.com/google/flatbuffers.git --branch ${FLATBUFFERS_RELEASE}

# Build flatbuffers tooling
WORKDIR ${GRUMPYCORP_ROOT}/flatbuffers
RUN cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release
RUN make
RUN ./flattests
```

Eventually I added Python and the AWS CLI so I could stop importing those as CircleCI orbs and set up all my tooling on one place:

```Dockerfile
#
# Python 3.x
#

RUN apt-get install -y python3-pip python3-dev

RUN \
  cd /usr/local/bin \
  && ln -s /usr/bin/python3 python \
  && pip3 install --upgrade pip


#
# AWS CLI
#

RUN pip3 install awscli
```

In the end I also added Android tooling (see the complete [`Dockerfile](https://github.com/rgiese/warm-and-fuzzy-ci-images/blob/master/Dockerfile) in my repo)
to streamline all the things.

A trivial CircleCI config builds the image and pushes it to Docker:

```YAML
version: 2
jobs:
  warm-and-fuzzy-ci:
    machine: true
    environment:
      IMAGE_NAME: warm-and-fuzzy-ci
      IMAGE_TAG: 6
    steps:
      - checkout
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
      - run: docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG .
      - run: docker push $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG
      - store_artifacts:
          path: Dockerfile

workflows:
  version: 2
  dockerfile_wizard:
    jobs:
      - warm-and-fuzzy-ci:
          context: grumpycorp-dockerhub
```

It's somewhat beyond me why CircleCI saw it fit to build this convoluted Dockerfile generator wizard thing
instead of just giving folks really trivial Dockerfiles to start from.

_Gardening note:_ In theory I could put this into my main WarmAndFuzzy repo as well and only trigger it for a CI-specific branch,
I've just not invested the time to garden this yet.

### Managing build machine performance

Again, I'm on the free tier, so I can't really complain. That said, I can't build my projects in parallel in the same job because then I run out of memory. :(
This is also why I keep my mobile build separate from my API and frontend build - otherwise it just doesn't parallelize.
If I had (free/cheap) access to larger build machines, it'd be nice to combine those build definitions, but it's not worth the hassle
for the very limited amount of added complexity I have to hang on to.

## On staging environments

In an ideal world I'd have a dev/staging environment per branch.
I built a setup for a previous project using Terraform that created per-branch environments
(and then garbage-collected them nightly by comparing git branches to the list of known environments)
but it felt overkill for this solo engineer venture.

For this project, I used the Serverless framework for all my infrastructure needs and it's a lovely
infrastructure-as-code framework even though it's a bit older (and thus must be uncool).

I'm hosting the infrastructure in AWS because it's just more mature than Azure when it comes to the latest and greatest
stuff like lambdas and static sites (or at least it was when I started WarmAndFuzzy).
The one main downside of AWS is that standing up a new environment is slow (certificates, CloudFront (wtf? y u so slow?), ...)
so the notion of a per-branch environment was just a non-starter.

This at least allows for further lazy choices like not fully scripting the data population of an environment;
I just have a backup/restore REST API that I use to repopulate the database on the rare occasion that I have to burn `dev` or `prod` to the ground.

### End notes

[^1]: The term _lifecycle_ seems a bit, uh, oversized for _build and test scripts_ but sure. It's all Lion King up in this here engineering system.
