using Microsoft.Extensions.DependencyInjection;
using Statiq.Web.Modules;

return await Bootstrapper.Factory
    .CreateWeb(args)
    // Input settings
    .AddSetting(WebKeys.InputPaths, "content")
    // Caching
    .AddSetting(Keys.CleanMode, true)
    // Configure front page (/index.html) to be the latest post from our Posts archive
    // c.f. https://github.com/orgs/statiqdev/discussions/200
    .BuildPipeline(
        "CopyLatestPostToSiteIndexHtml",
        builder =>
            builder
                .WithDependencies(nameof(Statiq.Web.Pipelines.Archives))
                .WithPostProcessModules(
                    new ReplaceDocuments(nameof(Statiq.Web.Pipelines.Archives)), // Start fishing content from the Archives pipeline
                    new FilterDocuments(
                        Config.FromDocument(doc => doc.Destination == "posts/all/index.html")
                    ), // Fish out the point of origin of the all-posts archive
                    new ExecuteConfig(Config.FromDocument(doc => doc.GetChildren().First())), // Find the latest post, i.e. the first child of page representing the archive
                    new RenderContentPostProcessTemplates(builder.Services.GetService<Templates>()), // Render it again...
                    new SetDestination("index.html") // ...into our top-level index.html
                )
                .WithOutputWriteFiles() // Flush the output of the pipeline
    )
    // Output settings
    .AddSetting(Keys.LinksUseHttps, true)
    // Run
    .RunAsync();
