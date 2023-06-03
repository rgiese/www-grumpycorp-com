public class SimpleFigureShortcode : SyncShortcode
{
    private const string Src = nameof(Src);
    private const string Alt = nameof(Alt);
    private const string Caption = nameof(Caption);
    private const string Class = nameof(Class);

    public override ShortcodeResult Execute(
        KeyValuePair<string, string>[] args,
        string content,
        IDocument document,
        IExecutionContext context
    )
    {
        IMetadataDictionary arguments = args.ToDictionary(Src, Alt, Caption, Class);
        arguments.RequireKeys(Src);

        string src = arguments.GetString(Src);

        string? alt = arguments.GetString(Alt);
        string? caption = arguments.GetString(Caption);

        string? @class = arguments.GetString(Class);

        return $"""
          <figure class="{@class}">
            <a href="{@src}">
              <img src="{@src}" alt="{caption ?? alt}"/>
            </a>
            {(!caption.IsNullOrWhiteSpace() ? $"<figcaption>{caption}</figcaption>" : "")}
          </figure>
          """;
    }
}
