using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Binge_Box.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueFavoriteConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_Users_UserId",
                table: "Favorites");

            migrationBuilder.DropForeignKey(
                name: "FK_Followers_Users_FollowerId",
                table: "Followers");

            migrationBuilder.DropForeignKey(
                name: "FK_Followers_Users_FollowingId",
                table: "Followers");

            migrationBuilder.DropIndex(
                name: "IX_Favorites_UserId",
                table: "Favorites");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Followers",
                table: "Followers");

            migrationBuilder.RenameTable(
                name: "Followers",
                newName: "Follows");

            migrationBuilder.RenameColumn(
                name: "FollowingId",
                table: "Follows",
                newName: "FollowedId");

            migrationBuilder.RenameIndex(
                name: "IX_Followers_FollowingId",
                table: "Follows",
                newName: "IX_Follows_FollowedId");

            migrationBuilder.RenameIndex(
                name: "IX_Followers_FollowerId",
                table: "Follows",
                newName: "IX_Follows_FollowerId");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Favorites",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "PosterUrl",
                table: "Favorites",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Genre",
                table: "Favorites",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Favorites",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Overview",
                table: "Favorites",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Follows",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Follows",
                table: "Follows",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId_MovieId",
                table: "Favorites",
                columns: new[] { "UserId", "MovieId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Follows_Users_FollowedId",
                table: "Follows",
                column: "FollowedId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Follows_Users_FollowerId",
                table: "Follows",
                column: "FollowerId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Follows_Users_FollowedId",
                table: "Follows");

            migrationBuilder.DropForeignKey(
                name: "FK_Follows_Users_FollowerId",
                table: "Follows");

            migrationBuilder.DropIndex(
                name: "IX_Favorites_UserId_MovieId",
                table: "Favorites");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Follows",
                table: "Follows");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Favorites");

            migrationBuilder.DropColumn(
                name: "Overview",
                table: "Favorites");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Follows");

            migrationBuilder.RenameTable(
                name: "Follows",
                newName: "Followers");

            migrationBuilder.RenameColumn(
                name: "FollowedId",
                table: "Followers",
                newName: "FollowingId");

            migrationBuilder.RenameIndex(
                name: "IX_Follows_FollowerId",
                table: "Followers",
                newName: "IX_Followers_FollowerId");

            migrationBuilder.RenameIndex(
                name: "IX_Follows_FollowedId",
                table: "Followers",
                newName: "IX_Followers_FollowingId");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Favorites",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "PosterUrl",
                table: "Favorites",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Genre",
                table: "Favorites",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Followers",
                table: "Followers",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId",
                table: "Favorites",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_Users_UserId",
                table: "Favorites",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Followers_Users_FollowerId",
                table: "Followers",
                column: "FollowerId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Followers_Users_FollowingId",
                table: "Followers",
                column: "FollowingId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
