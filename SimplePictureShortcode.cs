using System.Xml.Linq;

namespace Statiq.Web.Shortcodes
{
    public class SimplePictureShortcode : SyncShortcode
    {
        private const string Src = nameof(Src);
        private const string Alt = nameof(Alt);
        private const string Class = nameof(Class);

        public override ShortcodeResult Execute(
            KeyValuePair<string, string>[] args,
            string content,
            IDocument document,
            IExecutionContext context
        )
        {
            IMetadataDictionary arguments = args.ToDictionary(Src, Alt, Class);
            arguments.RequireKeys(Src);

            return $"""
            <div class="{arguments.GetString(Class)}">
              <a href="{arguments.GetString(Src)}">
                <picture>
                  <img src="{arguments.GetString(Src)}" alt="{arguments.GetString(Alt)}"/>
                </picture>
              </a>
            </div>
            """;
        }
    }
}
