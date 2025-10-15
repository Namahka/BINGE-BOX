using BingeBox.Models;
using Microsoft.EntityFrameworkCore;

namespace BingeBox.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Movie> Movies => Set<Movie>();
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Follower> Follows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Follower>(entity =>
            {
                entity.ToTable("Follows");
                entity.HasKey(f => f.Id);

                // 🔹 En användare kan följa många andra
                entity.HasOne(f => f.FollowerUser)
                    .WithMany() // ingen navigation på User-sidan behövs just nu
                    .HasForeignKey(f => f.FollowerId)
                    .OnDelete(DeleteBehavior.NoAction);

                // 🔹 En användare kan följas av många andra
                entity.HasOne(f => f.FollowedUser)
                    .WithMany() // samma här
                    .HasForeignKey(f => f.FollowedId)
                    .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
