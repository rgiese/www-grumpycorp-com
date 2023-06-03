public class DivIngredient : Ingredient
{
    public DivIngredient(string? @class = null)
    {
        Class = @class;
    }

    public DivIngredient(string? @class, string text)
        : base(new List<Ingredient> { new TextIngredient(text) })
    {
        Class = @class;
    }

    public string? Class { get; }

    public override string ToHtml()
    {
        string classAttribute = Class != null ? $" class=\"{Class}\"" : "";

        return $"<div{classAttribute}>" + base.ToHtml() + $"</div>";
    }
}
