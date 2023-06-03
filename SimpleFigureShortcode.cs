using Statiq.Images;

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
        // Parse parameters
        IMetadataDictionary arguments = args.ToDictionary(Src, Alt, Caption, Class);
        arguments.RequireKeys(Src);

        string src = arguments.GetString(Src);

        string? alt = arguments.GetString(Alt);
        string? caption = arguments.GetString(Caption);

        string? @class = arguments.GetString(Class);

        // Compute source sets
        int srcFileExtensionIndex = src.LastIndexOf('.');
        string srcWithoutExtension = src.Substring(0, srcFileExtensionIndex);
        string srcExtension = src.Substring(srcFileExtensionIndex + 1);

        var srcSets = ImageWidths.Select(
            width => $"{srcWithoutExtension}-w{width}-h0.{srcExtension} {width}w"
        );

        // Generate HTML
        return $"""
          <figure class="{@class}">
            <a href="{@src}">
              <img src="{@src}" srcset="{String.Join(", ", srcSets)}" sizes="{ImageSizes}" alt="{caption ?? alt}"/>
            </a>
            {(!caption.IsNullOrWhiteSpace() ? $"<figcaption>{caption}</figcaption>" : "")}
          </figure>
          """;
    }

    // Configuration for our image pipeline, as recommended by https://ausi.github.io/respimagelint/linter.html
    private static int[] ImageWidths = new int[]
    {
        256,
        570, // for vertical images
        768,
        970, // for vertical images
        1210,
        1536
    };

    private static string ImageSizes =
        "(min-width: 1660px) 768px, (min-width: 480px) 46.9vw, calc(100vw - 32px)";

    public static MutateImage BootstrapImageMutator()
    {
        var imageResizer = new MutateImage();

        foreach (int imageWidth in ImageWidths)
        {
            imageResizer.Resize(imageWidth, 0).And();
        }

        return imageResizer;
    }
}
