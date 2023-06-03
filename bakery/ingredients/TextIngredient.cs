public class TextIngredient : Ingredient
{
    public TextIngredient(string text) => Text = text;

    public string Text { get; }

    public override string ToHtml()
    {
        return Text;
    }
}
