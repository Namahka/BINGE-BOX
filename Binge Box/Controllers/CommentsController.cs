using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;
using System.Security.Claims;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // 🟢 POST: api/comments
        // Skapa ny kommentar på en review
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> PostComment([FromBody] Comment comment)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 🔐 Hämta userId från JWT
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            comment.UserId = int.Parse(userIdClaim);
            comment.CreatedAt = DateTime.UtcNow;

            // ✅ Kontrollera att reviewn finns
            var reviewExists = await _context.Reviews.AnyAsync(r => r.Id == comment.ReviewId);
            if (!reviewExists)
                return NotFound("Review not found.");

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var result = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == comment.Id);

            return Ok(result);
        }

        // =====================================================
        // 🟣 GET: api/comments/review/{reviewId}
        // Hämta alla kommentarer för en review
        // =====================================================
        [AllowAnonymous]
        [HttpGet("review/{reviewId}")]
        public async Task<IActionResult> GetCommentsByReview(int reviewId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.ReviewId == reviewId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.ReviewId,
                    c.UserId,
                    Username = c.User != null ? c.User.Username : "Unknown user",
                    c.Content,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }

        // =====================================================
        // ✏️ PUT: api/comments/{id}
        // Redigera egen kommentar
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> EditComment(int id, [FromBody] Comment updated)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                return NotFound("Comment not found.");

            if (comment.UserId != userId)
                return Forbid("Du får bara redigera dina egna kommentarer.");

            comment.Content = updated.Content;
            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        // =====================================================
        // ❌ DELETE: api/comments/{id}
        // Radera egen kommentar
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                return NotFound("Comment not found.");

            if (comment.UserId != userId)
                return Forbid("Du får bara ta bort dina egna kommentarer.");

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comment deleted successfully." });
        }
    }
}
