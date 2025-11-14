using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.DTOs.Followers;

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

        [HttpGet("followers/{userId}")]
        public async Task<IActionResult> GetFollowers(int userId)
        {
            var followers = await _context.Follows
                .Where(f => f.FollowedId == userId)
                .Include(f => f.FollowerUser)
                .ThenInclude(u => u.Profile)
                .Select(f => new FollowerDto
                {
                    Id = f.FollowerUser.Id,
                    Username = f.FollowerUser.Username,
                    ProfileImageUrl = f.FollowerUser.Profile != null
                        ? f.FollowerUser.Profile.ProfileImageUrl
                        : "",
                    FollowedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(followers);
        }

        [HttpGet("following/{userId}")]
        public async Task<IActionResult> GetFollowing(int userId)
        {
            var following = await _context.Follows
                .Where(f => f.FollowerId == userId)
                .Include(f => f.FollowedUser)
                .ThenInclude(u => u.Profile)
                .Select(f => new FollowerDto
                {
                    Id = f.FollowedUser.Id,
                    Username = f.FollowedUser.Username,
                    ProfileImageUrl = f.FollowedUser.Profile != null
                        ? f.FollowedUser.Profile.ProfileImageUrl
                        : "",
                    FollowedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(following);
        }

        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFollow([FromBody] FollowToggleDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (userId == dto.TargetId)
                return BadRequest("You cannot follow yourself.");

            var existing = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == userId && f.FollowedId == dto.TargetId);

            if (existing != null)
            {
                _context.Follows.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { following = false });
            }

            var newFollow = new Follower
            {
                FollowerId = userId,
                FollowedId = dto.TargetId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Follows.Add(newFollow);
            await _context.SaveChangesAsync();

            return Ok(new { following = true });
        }
    }
}
