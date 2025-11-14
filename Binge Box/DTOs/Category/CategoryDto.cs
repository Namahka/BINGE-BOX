namespace BingeBox.Dto.Category
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Image { get; set; }
    }

    public class CategoryCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Image { get; set; }
    }

    public class CategoryUpdateDto
    {
        public string? Name { get; set; }
        public string? Image { get; set; }
    }
}
