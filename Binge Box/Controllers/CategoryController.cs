using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.Dto.Category;

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


        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] string? slug = null)
        {
            var query = _context.Categories.AsQueryable();

            if (!string.IsNullOrEmpty(slug))
                query = query.Where(c => c.Slug == slug);

            var categories = await query
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Image = c.Image
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Image = c.Image
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Name is required.");

            var category = new Category
            {
                Name = dto.Name,
                Image = dto.Image,
                Slug = GenerateSlug(dto.Name)
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var readDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Image = category.Image
            };

            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, readDto);
        }

        [HttpPatch("{id:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryUpdateDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                category.Name = dto.Name;
                category.Slug = GenerateSlug(dto.Name);
            }

            if (!string.IsNullOrWhiteSpace(dto.Image))
                category.Image = dto.Image;

            await _context.SaveChangesAsync();
            return NoContent();
        }


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
