public class Site
{
    // We could make this an extension method on the document
    // but we'd like to make it very clear that this is a site-specific thing
    // so we'll do it the hard/explicit way.
    public static string GetTagForPost(IDocument document)
    {
        // Infer post tag from parent directory
        return document.Source.Parent.Name;
    }
}
