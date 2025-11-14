using BingeBox.Models;
using Microsoft.EntityFrameworkCore;

namespace BingeBox.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        // 📦 Databastabeller
        public DbSet<Movie> Movies => Set<Movie>();
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }


        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Follower> Follows { get; set; }
        public DbSet<MovieOfTheWeek> MovieOfTheWeek { get; set; }
        public DbSet<WatchlistItem> WatchlistItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<ReviewLike> ReviewLikes { get; set; }
        public DbSet<Category> Categories { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
         .HasOne(u => u.Profile)
         .WithOne(p => p.User)
         .HasForeignKey<UserProfile>(p => p.UserId)
         .OnDelete(DeleteBehavior.Cascade);





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

         
            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.MovieId })
                .IsUnique();

 

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

        
       
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Review)
                .WithMany()
                .HasForeignKey(c => c.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
