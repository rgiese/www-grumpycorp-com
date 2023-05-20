return await Bootstrapper.Factory
    .CreateWeb(args)
    // Output settings
    .AddSetting(Keys.Host, new Uri("https://grumpycorp.com").Host)
    .AddSetting(Keys.LinksUseHttps, true)
    // Run
    .RunAsync();
