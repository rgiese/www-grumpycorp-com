public class YouTubeIFrameShortcode : SyncShortcode
{
    private const string Id = nameof(Id);

    public override ShortcodeResult Execute(
        KeyValuePair<string, string>[] args,
        string content,
        IDocument document,
        IExecutionContext context
    )
    {
        IMetadataDictionary arguments = args.ToDictionary(Id);
        arguments.RequireKeys(Id);

        return $"""
            <div class="aspect-ratio overflow-hidden" style="padding-bottom: 60%; padding-top: 30px">
              <iframe
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                class="aspect-ratio--object"
                frameBorder="0"
                height="720"
                src="https://www.youtube.com/embed/{arguments.GetString(Id)}"
                width="1280"
              ></iframe>
            </div>            
            """;
    }
}
