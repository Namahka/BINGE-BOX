using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BingeBox.Data;
using BingeBox.Models;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // ======================================================
        // 🟢 POST: api/reviews
        // Skapa ny review (kräver inloggning)
        // ======================================================
        [HttpPost]
        public async Task<IActionResult> PostReview([FromBody] Review review)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 🧠 Hämta UserId från token
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            review.UserId = int.Parse(userIdClaim);
            review.CreatedAt = DateTime.UtcNow;
            review.LikesCount = 0;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Returnera review + användarinfo
            var result = await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == review.Id);

            return Ok(result);
        }

        // ======================================================
        // 🟣 GET: api/reviews/movie/{movieId}
        // Hämtar alla reviews för en viss film
        // ======================================================
        [HttpGet("movie/{movieId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsByMovie(int movieId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.User)
                    .Where(r => r.MovieId == movieId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        r.Id,
                        r.MovieId,
                        r.UserId,
                        Username = EF.Property<string>(r.User, "Username"), // ✅ tryggare sätt
                        r.Rating,
                        r.Content,
                        r.LikesCount,
                        r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, trace = ex.StackTrace });
            }
        }


        // ======================================================
        // 🔵 GET: api/reviews/user/{userId}
        // Hämtar alla reviews skrivna av en specifik användare
        // ======================================================
        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsByUser(int userId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.MovieId,
                    r.Rating,
                    r.Content,
                    r.LikesCount,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }
        // ❤️ POST: api/reviews/{id}/like
        [HttpPost("{id}/like")]
        [Authorize]
        public async Task<IActionResult> ToggleLike(int id)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            var userId = int.Parse(userIdClaim);

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return NotFound("Review not found.");

            var existingLike = await _context.ReviewLikes
                .FirstOrDefaultAsync(l => l.ReviewId == id && l.UserId == userId);

            if (existingLike != null)
            {
                // ❌ Ta bort like (toggle)
                _context.ReviewLikes.Remove(existingLike);
                review.LikesCount = Math.Max(0, review.LikesCount - 1);
                await _context.SaveChangesAsync();

                return Ok(new { liked = false, likesCount = review.LikesCount });
            }

            // ❤️ Lägg till like
            var like = new ReviewLike
            {
                ReviewId = id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ReviewLikes.Add(like);
            review.LikesCount++;
            await _context.SaveChangesAsync();

            return Ok(new { liked = true, likesCount = review.LikesCount });
        }
        // ======================================================
        // ✏️ PUT: api/reviews/{id}
        // Redigera en review (endast ägaren)
        // ======================================================
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> EditReview(int id, [FromBody] Review updated)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            var userId = int.Parse(userIdClaim);

            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
            if (review == null)
                return NotFound("Review not found.");

            if (review.UserId != userId)
                return Forbid("Du kan endast redigera dina egna reviews.");

            review.Content = updated.Content ?? review.Content;
            review.Rating = updated.Rating != 0 ? updated.Rating : review.Rating;
            await _context.SaveChangesAsync();

            return Ok(review);
        }

        // ======================================================
        // ❌ DELETE: api/reviews/{id}
        // Ta bort review (endast ägaren)
        // ======================================================
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            var userId = int.Parse(userIdClaim);

            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
            if (review == null)
                return NotFound("Review not found.");

            if (review.UserId != userId)
                return Forbid("Du kan endast ta bort dina egna reviews.");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review deleted successfully." });
        }

    }
}
