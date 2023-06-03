using Markdig;

Ingredient myDoc = new Ingredient
{
    Children =
    {
        new HeadingIngredient(1, "Heading"),
        new HeadingIngredient(2)
        {
            Children = { new TextIngredient("Subheading"), new TextIngredient("More stuff") }
        },
        new DivIngredient
        {
            Children =
            {
                new TextIngredient("Hello"),
                new ItalicIngredient { Children = { new TextIngredient("World") } },
            }
        },
        new DivIngredient(null, "SomeText"),
        new DivIngredient("w100", "SomeText"),
        new UnorderedListIngredient
        {
            Children = { new TextIngredient("Item1"), new TextIngredient("Item2") }
        }
    }
};

//Console.WriteLine(myDoc.ToHtml());

var markdownPipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();

var markdownDocument = Markdown.Parse("Foo *bar*", markdownPipeline);

Console.WriteLine(markdownDocument.ToString());
