using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MaterialApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MaterialEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    MaterialType = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    FieldName = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    FieldValue = table.Column<double>(type: "BINARY_DOUBLE", nullable: false),
                    EntryDate = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialEntries", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MaterialEntries");
        }
    }
}
