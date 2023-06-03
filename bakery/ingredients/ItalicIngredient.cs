public class ItalicIngredient : Ingredient
{
    public override string ToHtml()
    {
        return "<i>" + base.ToHtml() + "</i>";
    }
}
