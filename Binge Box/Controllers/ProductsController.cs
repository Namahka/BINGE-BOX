using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET /api/products?page=1&pageSize=10
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var products = await _context.Products
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(p => p.Category)
                .ToListAsync();

            return Ok(products);
        }

        // ✅ GET /api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        // ✅ GET /api/products?slug=xxx
        [HttpGet("slug")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductBySlug([FromQuery] string slug)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Slug == slug)
                .ToListAsync();

            return Ok(product);
        }

        // ✅ POST /api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
        }

        // ✅ PATCH /api/products/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var existing = await _context.Products.FindAsync(id);
            if (existing == null) return NotFound();

            // uppdatera endast ändrade fält
            existing.Name = updatedProduct.Name ?? existing.Name;
            existing.Description = updatedProduct.Description ?? existing.Description;
            existing.Price = updatedProduct.Price != 0 ? updatedProduct.Price : existing.Price;
            existing.Image = updatedProduct.Image ?? existing.Image;
            existing.Slug = updatedProduct.Slug ?? existing.Slug;
            existing.CategoryId = updatedProduct.CategoryId ?? existing.CategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ✅ DELETE /api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
