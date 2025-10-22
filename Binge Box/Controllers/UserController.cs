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
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public UserController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ===============================
        // 👤 Hämta inloggad profil
        // ===============================
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == int.Parse(userId));

            if (user == null) return NotFound();

            string? fullImageUrl = null;
            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                fullImageUrl = $"{Request.Scheme}://{Request.Host}{user.ProfileImageUrl}";

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                ProfileImageUrl = fullImageUrl,
                user.Bio,
                user.Note,
                user.AboutMe,
                user.CreatedAt,
                Role = user.Role ?? "User"
            });
        }

        // ===============================
        // ✏️ Uppdatera profil
        // ===============================
        [HttpPut("update")]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound();

            bool updated = false;

            if (!string.IsNullOrWhiteSpace(req.Bio))
            {
                user.Bio = req.Bio;
                updated = true;
            }

            if (!string.IsNullOrWhiteSpace(req.Note))
            {
                user.Note = req.Note;
                updated = true;
            }

            if (!string.IsNullOrWhiteSpace(req.AboutMe))
            {
                user.AboutMe = req.AboutMe;
                updated = true;
            }

            if (req.ProfileImage != null && req.ProfileImage.Length > 0)
            {
                var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsDir))
                    Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(req.ProfileImage.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await req.ProfileImage.CopyToAsync(stream);

                user.ProfileImageUrl = $"/uploads/{fileName}";
                updated = true;

                Console.WriteLine($"✅ Sparade profilbild: {filePath}");
            }

            if (updated)
                await _context.SaveChangesAsync();

            string? fullImageUrl = null;
            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                fullImageUrl = $"{Request.Scheme}://{Request.Host}{user.ProfileImageUrl}";

            return Ok(new
            {
                message = "Profile updated successfully",
                user.Username,
                user.Email,
                ProfileImageUrl = fullImageUrl,
                user.Bio,
                user.Note,
                user.AboutMe
            });
        }

        // ===============================
        // 🔍 Sök användare
        // ===============================
        [HttpGet("search")]
        public IActionResult SearchUsers([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query saknas");

            var users = _context.Users
                .Where(u => u.Username.Contains(query))
                .AsEnumerable()
                .Select(u => new
                {
                    id = u.Id,
                    username = u.Username,
                    profileImageUrl = string.IsNullOrEmpty(u.ProfileImageUrl)
                        ? null
                        : $"{Request.Scheme}://{Request.Host}{u.ProfileImageUrl}"
                })
                .ToList();

            return Ok(users);
        }

        // ===============================
        // 👀 Hämta annan användare via ID
        // ===============================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            string? fullImageUrl = null;
            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                fullImageUrl = $"{Request.Scheme}://{Request.Host}{user.ProfileImageUrl}";

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                ProfileImageUrl = fullImageUrl,
                user.Bio,
                user.Note,
                user.AboutMe,
                user.CreatedAt,
                Role = user.Role ?? "User"
            });
        }
    }

    // ===============================
    // 🧩 Request-modell
    // ===============================
    public class UpdateProfileRequest
    {
        public string? Bio { get; set; }
        public string? Note { get; set; }      // 👈 nytt
        public string? AboutMe { get; set; }   // 👈 nytt
        public IFormFile? ProfileImage { get; set; }
    }
}
