using BingeBox.Data;               // Din DbContext
using BingeBox.Options;            // För TmdbOptions
using BingeBox.External.Tmdb;      // För ITmdbClient/TmdbClient
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options; // För IOptions<T>

var builder = WebApplication.CreateBuilder(args);

// -------------------------------
// SERVICES
// -------------------------------

// Controllers
builder.Services.AddControllers();

// DbContext (SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS – öppet under utveckling
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// -------------------------------
// TMDb API-konfiguration
// -------------------------------

// Läser in secrets/appsettings → TmdbOptions
builder.Services.Configure<TmdbOptions>(builder.Configuration.GetSection("TMDb"));

// Skapar en återanvändbar HttpClient för TMDb-anrop
builder.Services.AddHttpClient("tmdb", (sp, http) =>
{
    var opts = sp.GetRequiredService<IOptions<TmdbOptions>>().Value;
    http.BaseAddress = new Uri(opts.BaseUrl.TrimEnd('/') + "/");
    http.Timeout = TimeSpan.FromSeconds(15);
});

// Registrera TMDb-klienten
builder.Services.AddScoped<ITmdbClient, TmdbClient>();

// -------------------------------
// APP PIPELINE
// -------------------------------

var app = builder.Build();

// Swagger (endast i Development)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
