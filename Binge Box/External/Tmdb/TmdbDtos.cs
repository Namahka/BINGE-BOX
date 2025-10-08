namespace BingeBox.External.Tmdb
{
    // Svar från TMDb-listor/sökningar
    public class TmdbSearchResult
    {
        public int page { get; set; }
        public List<TmdbMovie> results { get; set; } = new();
        public int total_pages { get; set; }
        public int total_results { get; set; }
    }

    // Minimal filmmodell från TMDb
    public class TmdbMovie
    {
        public int id { get; set; }
        public string? title { get; set; }
        public string? overview { get; set; }
        public double? vote_average { get; set; }
        public string? release_date { get; set; } // "YYYY-MM-DD"
        public string? poster_path { get; set; }  // t.ex. "/abc123.jpg"
        public List<int>? genre_ids { get; set; }
    }
}
