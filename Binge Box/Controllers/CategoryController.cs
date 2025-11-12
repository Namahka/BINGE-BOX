using Microsoft.AspNetCore.Authorization;
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

        // ======================================================
        // 🟢 GET: /api/categories
        // Hämta alla kategorier + deras filmer
        // ======================================================
        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] string? slug = null)
        {
            if (!string.IsNullOrEmpty(slug))
            {
                var categoryBySlug = await _context.Categories
                    .Include(c => c.Movies)
                    .Where(c => c.Slug == slug)
                    .ToListAsync();

                return Ok(categoryBySlug);
            }

            var categories = await _context.Categories
                .Include(c => c.Movies)
                .ToListAsync();

            return Ok(categories);
        }

        // ======================================================
        // 🟣 GET: /api/categories/{id}
        // Hämta kategori baserat på ID
        // ======================================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Movies)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        // ======================================================
        // 🟡 POST: /api/categories
        // Skapa ny kategori (kräver JWT)
        // ======================================================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name))
                return BadRequest("Name is required.");

            category.Slug = GenerateSlug(category.Name);

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
        }

        // ======================================================
        // ✏️ PATCH: /api/categories/{id}
        // Uppdatera kategori (kräver JWT)
        // ======================================================
        [HttpPatch("{id:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category updated)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(updated.Name))
            {
                category.Name = updated.Name;
                category.Slug = GenerateSlug(updated.Name);
            }

            if (!string.IsNullOrWhiteSpace(updated.Image))
                category.Image = updated.Image;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ======================================================
        // ❌ DELETE: /api/categories/{id}
        // Radera kategori (kräver JWT)
        // ======================================================
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ======================================================
        // 🔧 Hjälpmetod för slug
        // ======================================================
        private static string GenerateSlug(string name)
        {
            return new string(name
                .ToLower()
                .Trim()
                .Replace(" ", "-")
                .Where(c => char.IsLetterOrDigit(c) || c == '-')
                .ToArray());
        }
    }
}
