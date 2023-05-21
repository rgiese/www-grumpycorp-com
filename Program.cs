return await Bootstrapper.Factory
    .CreateWeb(args)
    // Input settings
    .AddSetting(WebKeys.InputPaths, "content")
    // Caching
    .AddSetting(Keys.CleanMode, true)
    // Output settings
    .AddSetting(Keys.LinksUseHttps, true)
    // Run
    .RunAsync();
