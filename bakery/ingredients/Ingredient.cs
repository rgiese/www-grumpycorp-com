public class Ingredient
{
    public Ingredient() => Children = new List<Ingredient>();

    public Ingredient(IList<Ingredient> children) => Children = children;

    public IList<Ingredient> Children { get; } = new List<Ingredient>();

    public virtual string ToHtml()
    {
        return String.Join("\n", Children.Select(child => child.ToHtml()).ToList());
    }
}
