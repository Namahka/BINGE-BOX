using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BingeBox.Data;
using BingeBox.Models;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // ✅ kräver JWT
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // 🧠 GET: api/user/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { error = "Invalid token" });

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == int.Parse(userId));

            if (user == null)
                return NotFound(new { error = "User not found" });

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.ProfileImageUrl,
                user.CreatedAt
            });
        }

        // ✏️ PUT: api/user/update
        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { error = "Invalid token" });

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
                return NotFound(new { error = "User not found" });

            // ✅ Uppdatera fält om de skickats
            if (!string.IsNullOrWhiteSpace(req.Username))
                user.Username = req.Username;

            if (!string.IsNullOrWhiteSpace(req.Email))
                user.Email = req.Email;

            if (!string.IsNullOrWhiteSpace(req.ProfileImageUrl))
                user.ProfileImageUrl = req.ProfileImageUrl;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully",
                user.Username,
                user.Email,
                user.ProfileImageUrl
            });
        }

        // 🔴 POST: api/user/logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Frontenden rensar token, backend behöver inte göra något
            return Ok(new { message = "Logged out successfully" });
        }
    }

    // 📦 DTO för profiluppdatering
    public class UpdateProfileRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}
