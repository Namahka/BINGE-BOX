using BingeBox.Data;
using BingeBox.External.Tmdb;
using BingeBox.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -------------------------------
// 💾 DATABASE
// -------------------------------
builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// -------------------------------
// 🔐 JWT Authentication
// -------------------------------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

// -------------------------------
// 🎬 TMDb API-konfiguration
// -------------------------------
builder.Services.Configure<TmdbOptions>(builder.Configuration.GetSection("TMDb"));

// ✅ Registrera både HttpClient och TmdbClient korrekt
builder.Services.AddHttpClient("tmdb", (sp, http) =>
{
    var opts = sp.GetRequiredService<IOptions<TmdbOptions>>().Value;
    http.BaseAddress = new Uri(opts.BaseUrl.TrimEnd('/') + "/");
    http.Timeout = TimeSpan.FromSeconds(15);
});

// ✅ Registrera själva klienten (löser ditt 500-fel)
builder.Services.AddScoped<ITmdbClient, TmdbClient>();

// -------------------------------
// 🌐 CORS
// -------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// -------------------------------
// 🧾 Swagger + JWT support
// -------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Binge Box API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Skriv 'Bearer' + mellanslag + din JWT token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// -------------------------------
// 🚀 APP PIPELINE
// -------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 🖼️ LÅT PROFILBILDER OCH UPPLADDADE FILER VISAS
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
