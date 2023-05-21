[![Netlify Status](https://api.netlify.com/api/v1/badges/63595710-a86c-48c9-a3e2-5a2f4e4bdadc/deploy-status)](https://app.netlify.com/sites/grumpycorp/deploys)

# www-grumpycorp-com
Website for GrumpyCorp Creative Industries (via [Statiq](https://statiq.dev)).

## Setup
- Install .Net Core (e.g. by installing Visual Studio)

## Running
- `dotnet run` to build site
- `dotnet run -- serve` to build and serve site while watching for updates to the input

## Icons and Fonts
See [The Noun Project](https://thenounproject.com/).

Using [google-webfonts-helper](https://gwfh.mranftl.com/fonts) to download Google fonts (Dosis, Questrial, Quicksand).

## Links
- Markdown parsing provided by [Markdig](https://github.com/xoofx/markdig/blob/master/readme.md)
- [Cross-references](https://www.statiq.dev/guide/web/content-files/links-and-cross-references) are possible inside Markdown (etc.) files to other pages
- [CleanBlog](https://github.com/statiqdev/CleanBlog) is the foundation for our theme
- [Razor syntax reference](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/razor?view=aspnetcore-7.0)