using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.Dto.Comments;

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

        [HttpPost]
        public async Task<IActionResult> PostComment([FromBody] CommentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var reviewExists = await _context.Reviews.AnyAsync(r => r.Id == dto.ReviewId);
            if (!reviewExists)
                return NotFound("Review not found.");

            var comment = new Comment
            {
                ReviewId = dto.ReviewId,
                Content = dto.Content,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            var response = new CommentDto
            {
                Id = comment.Id,
                ReviewId = dto.ReviewId,
                UserId = userId,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                Username = user!.Username,
                ProfileImageUrl = user.Profile?.ProfileImageUrl ?? "/default-avatar.png"
            };

            return CreatedAtAction(nameof(GetCommentsByReviewId), new { reviewId = dto.ReviewId }, response);
        }

        [AllowAnonymous]
        [HttpGet("review/{reviewId}")]
        public async Task<IActionResult> GetCommentsByReviewId(int reviewId)
        {
            var comments = await _context.Comments
                .Where(c => c.ReviewId == reviewId)
                .Include(c => c.User)
                .ThenInclude(u => u.Profile)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    ReviewId = c.ReviewId,
                    UserId = c.UserId,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    Username = c.User.Username,
                    ProfileImageUrl = c.User.Profile != null
                        ? c.User.Profile.ProfileImageUrl
                        : "/default-avatar.png"
                })
                .ToListAsync();

            return Ok(comments);
        }
    }
}
