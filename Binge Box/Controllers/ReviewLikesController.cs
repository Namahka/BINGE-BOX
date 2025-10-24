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
    public class ReviewLikesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewLikesController(AppDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // 🟢 POST: api/reviewlikes/{reviewId}/toggle
        // Gilla eller ogilla en review
        // =====================================================
        [HttpPost("{reviewId}/toggle")]
        public async Task<IActionResult> ToggleLike(int reviewId)
        {
            // 🔐 Hämta användar-ID från JWT
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            var userId = int.Parse(userIdClaim);

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                return NotFound("Review not found.");

            var existingLike = await _context.ReviewLikes
                .FirstOrDefaultAsync(l => l.UserId == userId && l.ReviewId == reviewId);

            if (existingLike != null)
            {
                // 🟡 Ta bort like
                _context.ReviewLikes.Remove(existingLike);
                review.LikesCount = Math.Max(0, review.LikesCount - 1);
            }
            else
            {
                // 🟢 Lägg till like
                _context.ReviewLikes.Add(new ReviewLike
                {
                    ReviewId = reviewId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                });
                review.LikesCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                likesCount = review.LikesCount
            });
        }

        // =====================================================
        // 🟣 GET: api/reviewlikes/review/{reviewId}
        // Hämta alla användare som gillat en review
        // =====================================================
        [AllowAnonymous]
        [HttpGet("review/{reviewId}")]
        public async Task<IActionResult> GetLikesForReview(int reviewId)
        {
            var likes = await _context.ReviewLikes
                .Include(l => l.User)
                .Where(l => l.ReviewId == reviewId)
                .Select(l => new
                {
                    l.Id,
                    l.UserId,
                    Username = l.User != null ? l.User.Username : "Unknown user",
                    l.CreatedAt
                })
                .ToListAsync();

            return Ok(likes);
        }
    }
}
