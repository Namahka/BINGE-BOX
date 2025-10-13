using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Binge_Box.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoritesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MediaType",
                table: "Favorites",
                newName: "Genre");

            migrationBuilder.AddColumn<double>(
                name: "Rating",
                table: "Favorites",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Favorites");

            migrationBuilder.RenameColumn(
                name: "Genre",
                table: "Favorites",
                newName: "MediaType");
        }
    }
}
