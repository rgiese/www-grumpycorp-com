public class UnorderedListIngredient : Ingredient
{
    public override string ToHtml()
    {
        return "<ul>\n"
            + String.Join(
                "\n",
                Children.Select(child => "  <li>" + child.ToHtml() + "</li>").ToList()
            )
            + "\n</ul>\n";
    }
}
