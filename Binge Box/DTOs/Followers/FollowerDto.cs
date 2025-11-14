namespace BingeBox.DTOs.Followers
{
    public class FollowerDto
    {
        public int Id { get; set; }                 
        public string Username { get; set; } = "";  
        public string ProfileImageUrl { get; set; } = "";
        public DateTime FollowedAt { get; set; }    
    }
}
