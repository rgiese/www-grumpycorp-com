return await Bootstrapper.Factory
    .CreateWeb(args)
    // Input settings
    .AddSetting(WebKeys.InputPaths, "content")
    // Output settings
    .AddSetting(Keys.Host, new Uri("https://grumpycorp.com").Host)
    .AddSetting(Keys.LinksUseHttps, true)
    // Run
    .RunAsync();
