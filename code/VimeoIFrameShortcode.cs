public class VimeoIFrameShortcode : SyncShortcode
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
            <p>
              <div class="aspect-ratio overflow-hidden" style="padding-bottom: 60%; padding-top: 30px;">
                <iframe
                  allowFullScreen
                  class="aspect-ratio--object"
                  frameBorder="0"
                  src="https://player.vimeo.com/video/{arguments.GetString(Id)}"
                >
                </iframe>
              </div>
            </p>
            """;
    }
}
