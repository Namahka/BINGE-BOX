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

            // 🟡 Hämta användardata för svaret
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == comment.UserId);

            return Ok(new
            {
                comment.Id,
                comment.ReviewId,
                comment.UserId,
                comment.Content,
                comment.CreatedAt,
                Username = user?.Username ?? "Unknown",
                ProfileImageUrl = user?.ProfileImageUrl ?? "/default-avatar.png"
            });
        }

        // ✅ GET: api/comments/review/5
        [AllowAnonymous]
        [HttpGet("review/{reviewId}")]
        public async Task<IActionResult> GetCommentsByReviewId(int reviewId)
        {
            var comments = await _context.Comments
                .Where(c => c.ReviewId == reviewId)
                .Include(c => c.User) // 🟡 viktigt: laddar användardata
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.ReviewId,
                    c.UserId,
                    c.Content,
                    c.CreatedAt,
                    Username = c.User.Username,
                    ProfileImageUrl = c.User.ProfileImageUrl // 🟡 här skickas bilden!
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
