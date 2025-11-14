using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.DTOs.Reviews;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewsController(AppDbContext context) => _context = context;

        [HttpPost]
        public async Task<IActionResult> PostReview([FromBody] ReviewCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            var userId = int.Parse(userIdClaim);

            var review = new Review
            {
                UserId = userId,
                MovieId = dto.MovieId,
                Rating = dto.Rating,
                Content = dto.Content,
                LikesCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);

            var response = new ReviewDto
            {
                Id = review.Id,
                MovieId = review.MovieId,
                UserId = review.UserId,
                Username = user?.Username ?? "Unknown",
                Rating = review.Rating,
                Content = review.Content,
                LikesCount = review.LikesCount,
                CreatedAt = review.CreatedAt
            };

            return CreatedAtAction(nameof(GetReviewsByMovie), new { movieId = review.MovieId }, response);
        }

        [HttpGet("movie/{movieId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsByMovie(int movieId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.MovieId == movieId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    MovieId = r.MovieId,
                    UserId = r.UserId,
                    Username = r.User != null ? r.User.Username : "Unknown",
                    Rating = r.Rating,
                    Content = r.Content,
                    LikesCount = r.LikesCount,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsByUser(int userId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    MovieId = r.MovieId,
                    UserId = r.UserId,
                    Username = r.User != null ? r.User.Username : "Unknown",
                    Rating = r.Rating,
                    Content = r.Content,
                    LikesCount = r.LikesCount,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> EditReview(int id, [FromBody] ReviewUpdateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Ingen giltig token hittades.");

            var userId = int.Parse(userIdClaim);

            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
            if (review == null)
                return NotFound("Review not found.");

            if (review.UserId != userId)
                return Forbid("Du kan endast redigera dina egna reviews.");

            if (dto.Content != null)
                review.Content = dto.Content;

            if (dto.Rating.HasValue)
                review.Rating = dto.Rating.Value;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Review updated successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("nameid")?.Value;

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
