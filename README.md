# www-grumpycorp-com

Website for [Grumpycorp Studios](https://grumpycorp.com) (via our custom site generator at `src/`).

## Setup

- `npm install`
- Consider installing the [ETA VSCode extension](https://marketplace.visualstudio.com/items?itemName=shadowtime2000.eta-vscode)

On M1 devices, consider:

- `brew install nvm`
- `arch -x86_64 zsh`
- `nvm install --lts --default`

## Running

- `npm run build` to build site
- `npm serve` to [serve](http://localhost:5080) a separately built version of the site
- `npm serve:hmr` to serve with auto-reload
- `npm run watch:content` to re-build the site while watching for updates to the input

## Fonts

Use [google-webfonts-helper](https://gwfh.mranftl.com/fonts) to download Google fonts.
