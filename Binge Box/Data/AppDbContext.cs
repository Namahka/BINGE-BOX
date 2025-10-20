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

        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Follower> Follows { get; set; }
        public DbSet<MovieOfTheWeek> MovieOfTheWeek { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Follower>(entity =>
            {
                entity.ToTable("Follows");
                entity.HasKey(f => f.Id);

                entity.HasOne(f => f.FollowerUser)
                    .WithMany()
                    .HasForeignKey(f => f.FollowerId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(f => f.FollowedUser)
                    .WithMany()
                    .HasForeignKey(f => f.FollowedId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // 💎 Förhindra dubbletter i Favorites
            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.MovieId })
                .IsUnique();
        }

    }
}
