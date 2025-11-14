using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.DTOs.Users;

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


        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var user = await _context.Users
                .Include(u => u.Profile)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            var dto = new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                ProfileImageUrl = user.Profile?.ProfileImageUrl,
                Bio = user.Profile?.Bio,
                Note = user.Profile?.Note,
                AboutMe = user.Profile?.AboutMe,
                CreatedAt = user.CreatedAt,
                Role = user.Role
            };

            return Ok(dto);
        }

  
        [HttpPut("update")]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> UpdateProfile([FromForm] UserUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            // Skapa profil om den inte finns
            if (user.Profile == null)
            {
                user.Profile = new UserProfile { UserId = userId };
            }

            bool updated = false;

            if (!string.IsNullOrWhiteSpace(dto.Bio))
            {
                user.Profile.Bio = dto.Bio;
                updated = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Note))
            {
                user.Profile.Note = dto.Note;
                updated = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.AboutMe))
            {
                user.Profile.AboutMe = dto.AboutMe;
                updated = true;
            }

        
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsDir))
                    Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}_{dto.ProfileImage.FileName}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await dto.ProfileImage.CopyToAsync(stream);

                user.Profile.ProfileImageUrl = $"/uploads/{fileName}";
                updated = true;
            }

            if (updated)
                await _context.SaveChangesAsync();

            var response = new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                ProfileImageUrl = user.Profile?.ProfileImageUrl,
                Bio = user.Profile?.Bio,
                Note = user.Profile?.Note,
                AboutMe = user.Profile?.AboutMe,
                CreatedAt = user.CreatedAt,
                Role = user.Role
            };

            return Ok(response);
        }

        [HttpGet("search")]
        public IActionResult SearchUsers([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query saknas");

            var users = _context.Users
                .Include(u => u.Profile)
                .Where(u => u.Username.Contains(query))
                .AsEnumerable() 
                .Select(u => new UserSearchDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    ProfileImageUrl = u.Profile?.ProfileImageUrl
                })
                .ToList();

            return Ok(users);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            var dto = new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                ProfileImageUrl = user.Profile?.ProfileImageUrl,
                Bio = user.Profile?.Bio,
                Note = user.Profile?.Note,
                AboutMe = user.Profile?.AboutMe,
                CreatedAt = user.CreatedAt,
                Role = user.Role
            };

            return Ok(dto);
        }
    }
}
