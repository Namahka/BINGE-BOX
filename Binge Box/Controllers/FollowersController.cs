using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;
using System.Security.Claims;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FollowersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FollowersController(AppDbContext context)
        {
            _context = context;
        }

        // ============================
        // GET: api/followers/followers/{userId}
        // ============================
        [HttpGet("followers/{userId}")]
        public async Task<IActionResult> GetFollowers(int userId)
        {
            var followers = await _context.Follows
                .Where(f => f.FollowedId == userId)
                .Include(f => f.FollowerUser)
                .Select(f => new
                {
                    Id = f.FollowerUser.Id,
                    Username = f.FollowerUser.Username,
                    ProfileImageUrl = f.FollowerUser.ProfileImageUrl ?? ""
                })
                .ToListAsync();

            return Ok(followers);
        }

        // ============================
        // GET: api/followers/following/{userId}
        // ============================
        [HttpGet("following/{userId}")]
        public async Task<IActionResult> GetFollowing(int userId)
        {
            var following = await _context.Follows
                .Where(f => f.FollowerId == userId)
                .Include(f => f.FollowedUser)
                .Select(f => new
                {
                    Id = f.FollowedUser.Id,
                    Username = f.FollowedUser.Username,
                    ProfileImageUrl = f.FollowedUser.ProfileImageUrl ?? ""
                })
                .ToListAsync();

            return Ok(following);
        }

        // ============================
        // POST: api/followers/toggle/{targetId}
        // ============================
        [HttpPost("toggle/{targetId}")]
        public async Task<IActionResult> ToggleFollow(int targetId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (userId == targetId)
                return BadRequest("You cannot follow yourself.");

            var existing = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == userId && f.FollowedId == targetId);

            if (existing != null)
            {
                _context.Follows.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { following = false });
            }
            else
            {
                var newFollow = new Follower
                {
                    FollowerId = userId,
                    FollowedId = targetId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Follows.Add(newFollow);
                await _context.SaveChangesAsync();
                return Ok(new { following = true });
            }
        }

        // ============================
        // GET: api/followers/isFollowing/{targetUserId}
        // ============================
        [HttpGet("isFollowing/{targetUserId}")]
        public async Task<IActionResult> IsFollowing(int targetUserId)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var isFollowing = await _context.Follows
                .AnyAsync(f => f.FollowerId == currentUserId && f.FollowedId == targetUserId);

            return Ok(isFollowing);
        }
    }
}
