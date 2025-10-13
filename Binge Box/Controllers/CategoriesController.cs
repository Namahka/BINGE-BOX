using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET /api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.Products)
                .ToListAsync();

            return Ok(categories);
        }

        // ✅ GET /api/categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategoryById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null) return NotFound();
            return Ok(category);
        }

        // ✅ GET /api/categories?slug=t-shirts
        [HttpGet("slug")]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategoryBySlug([FromQuery] string slug)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .Where(c => c.Slug == slug)
                .ToListAsync();

            return Ok(category);
        }

        // ✅ POST /api/categories
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
        }

        // ✅ PATCH /api/categories/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category updatedCategory)
        {
            var existing = await _context.Categories.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = updatedCategory.Name ?? existing.Name;
            existing.Slug = updatedCategory.Slug ?? existing.Slug;
            existing.Image = updatedCategory.Image ?? existing.Image;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ✅ DELETE /api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ✅ PUT /api/categories/{categoryId}/products/{productId}
        [HttpPut("{categoryId}/products/{productId}")]
        public async Task<IActionResult> AddProductToCategory(int categoryId, int productId)
        {
            var category = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == categoryId);
            var product = await _context.Products.FindAsync(productId);

            if (category == null || product == null)
                return NotFound();

            category.Products.Add(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ✅ DELETE /api/categories/{categoryId}/products/{productId}
        [HttpDelete("{categoryId}/products/{productId}")]
        public async Task<IActionResult> RemoveProductFromCategory(int categoryId, int productId)
        {
            var category = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == categoryId);
            if (category == null) return NotFound();

            var product = category.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null) return NotFound();

            category.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
