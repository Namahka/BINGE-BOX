using System.Collections.Generic;

namespace BingeBox.External.Tmdb
{
    public class TmdbSearchResult
    {
        public int page { get; set; }
        public List<TmdbItem> results { get; set; } = new();
        public int total_pages { get; set; }
        public int total_results { get; set; }
    }

    public class TmdbItem
    {
        public int id { get; set; }
        public string? title { get; set; }
        public string? name { get; set; }
        public string? overview { get; set; }
        public double? vote_average { get; set; }
        public string? release_date { get; set; }
        public string? first_air_date { get; set; }
        public string? poster_path { get; set; }
        public string? profile_path { get; set; } // <---- viktig för skådespelare
        public List<int>? genre_ids { get; set; }
        public string? known_for_department { get; set; }
        public List<TmdbKnownFor>? known_for { get; set; }
    }

    public class TmdbKnownFor
    {
        public int id { get; set; }
        public string? title { get; set; }
        public string? name { get; set; }
        public string? media_type { get; set; }
        public string? overview { get; set; }
        public double? vote_average { get; set; }
        public string? poster_path { get; set; }
    }
}
