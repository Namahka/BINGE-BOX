using System.Collections.Generic;

namespace BingeBox.External.Tmdb
{
    /// <summary>
    /// Representerar ett svar från TMDb:s API (t.ex. /search/movie, /search/tv, /search/person)
    /// </summary>
    public class TmdbSearchResult
    {
        public int page { get; set; }
        public List<TmdbItem> results { get; set; } = new();
        public int total_pages { get; set; }
        public int total_results { get; set; }
    }

    /// <summary>
    /// Generisk modell för ett objekt i TMDb-sökresultat.
    /// Kan vara film, serie, person, företag eller keyword.
    /// </summary>
    public class TmdbItem
    {
        public int id { get; set; }

        // Filmer
        public string? title { get; set; }

        // TV-serier & personer
        public string? name { get; set; }

        // Översikt / beskrivning
        public string? overview { get; set; }

        // Betyg
        public double? vote_average { get; set; }

        // Datum (filmer och serier)
        public string? release_date { get; set; }     // film
        public string? first_air_date { get; set; }   // serie

        // Bild
        public string? poster_path { get; set; }      // t.ex. "/abc123.jpg"

        // Genre-ID:n (för filmer/serier)
        public List<int>? genre_ids { get; set; }

        // Personer (skådespelare/regissörer)
        public string? known_for_department { get; set; }
        public List<TmdbKnownFor>? known_for { get; set; }
    }

    /// <summary>
    /// Lista över verk en person är känd för.
    /// </summary>
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
