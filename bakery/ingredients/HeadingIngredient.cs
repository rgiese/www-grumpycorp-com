public class HeadingIngredient : Ingredient
{
    public HeadingIngredient(int level = 1)
    {
        Level = level;
    }

    public HeadingIngredient(int level, string text)
        : base(new List<Ingredient> { new TextIngredient(text) })
    {
        Level = level;
    }

    public int Level { get; }

    public override string ToHtml()
    {
        return $"<h{Level}>" + base.ToHtml() + $"</h{Level}>";
    }
}
