using Statiq.Images;
using SixLabors.ImageSharp.Processing;

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

        string documentRelativeSrc = arguments.GetString(Src);
        NormalizedPath documentDirectory = document.Destination.Parent;

        string src = context.GetLink(documentDirectory.Combine(documentRelativeSrc));

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

        // - This is a rather shlocky and generic calculation given that we're doing this site-wide
        //   instead of performing it on an image-by-image basis with awareness of how it's being laid out.
        //   We're assuming that our image content in the main content area is generally no wider than 50% of the screen
        //   so we're spec'ing an image resolution half as wide as the viewport.
        //   Close enough.
        var srcSizes = ImageWidths.Select(width => $"(max-width: {2 * width}px) {width}px");

        // Generate HTML
        return $"""
          <figure class="{@class}">
            <a href="{src}">
              <img src="{src}" srcset="{String.Join(", ", srcSets)}" sizes="{String.Join(", ", srcSizes)}" alt="{caption ?? alt}"/>
            </a>
            {(!caption.IsNullOrWhiteSpace() ? $"<figcaption>{caption}</figcaption>" : "")}
          </figure>
          """;
    }

    // Configuration for our image pipeline, more or less as recommended by https://ausi.github.io/respimagelint/linter.html
    private static int[] ImageWidths = new int[]
    {
        570, // for vertical images
        768,
        970, // for vertical images
        1210,
        1536
    };

    public static MutateImage BootstrapImageMutator()
    {
        var imageResizer = new MutateImage();

        foreach (int imageWidth in ImageWidths)
        {
            imageResizer
                .Resize(
                    imageWidth,
                    0, // Let aspect ratio dictate the height
                    AnchorPositionMode.Center, // Default
                    ResizeMode.Min // Resizes the image until the shortest side reaches the set given dimension. Upscaling is disabled in this mode and the original image will be returned if attempted.
                )
                .And();
        }

        return imageResizer;
    }
}
