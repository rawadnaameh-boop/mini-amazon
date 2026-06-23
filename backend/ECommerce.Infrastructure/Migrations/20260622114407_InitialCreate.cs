using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ImageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    StockQuantity = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.CheckConstraint("CK_Products_Price_NonNegative", "`Price` >= 0");
                    table.CheckConstraint("CK_Products_StockQuantity_NonNegative", "`StockQuantity` >= 0");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Description", "ImageUrl", "IsActive", "Name", "Price", "Sku", "StockQuantity" },
                values: new object[,]
                {
                    { 1, "Over-ear noise-cancelling headphones with 30-hour battery life.", "https://picsum.photos/seed/elec-wh-001/400/400", true, "Wireless Bluetooth Headphones", 59.99m, "ELEC-WH-001", 25 },
                    { 2, "Tracks heart rate, steps, and sleep with a 7-day battery.", "https://picsum.photos/seed/elec-sw-002/400/400", true, "Smart Fitness Watch", 89.99m, "ELEC-SW-002", 40 },
                    { 3, "Brew up to 12 cups with a 24-hour programmable timer.", "https://picsum.photos/seed/home-cm-003/400/400", true, "12-Cup Programmable Coffee Maker", 45.50m, "HOME-CM-003", 15 },
                    { 4, "1200W motor with 6 stainless steel blades for smoothies.", "https://picsum.photos/seed/home-bl-004/400/400", true, "High-Speed Countertop Blender", 69.99m, "HOME-BL-004", 0 },
                    { 5, "Extra-thick 6mm eco-friendly TPE yoga mat with carrying strap.", "https://picsum.photos/seed/sprt-ym-005/400/400", true, "Non-Slip Yoga Mat", 24.99m, "SPRT-YM-005", 60 },
                    { 6, "Pair of adjustable dumbbells for home strength training.", "https://picsum.photos/seed/sprt-db-006/400/400", true, "Adjustable Dumbbell Set 20lb", 79.99m, "SPRT-DB-006", 12 },
                    { 7, "Stainless steel knives with wooden block and built-in sharpener.", "https://picsum.photos/seed/ktch-ks-007/400/400", true, "15-Piece Kitchen Knife Set", 54.99m, "KTCH-KS-007", 8 },
                    { 8, "Oil-free frying with 8 preset cooking programs.", "https://picsum.photos/seed/ktch-af-008/400/400", true, "Digital Air Fryer 5.8QT", 64.99m, "KTCH-AF-008", 0 },
                    { 9, "Bestselling mystery novel, paperback edition.", "https://picsum.photos/seed/book-nv-009/400/400", true, "\"The Last Lighthouse\" Novel", 14.99m, "BOOK-NV-009", 100 },
                    { 10, "Creative building blocks compatible with major brands.", "https://picsum.photos/seed/toys-lb-010/400/400", true, "500-Piece Building Block Set", 34.99m, "TOYS-LB-010", 22 },
                    { 11, "Fast-charging power bank with dual USB-C ports.", "https://picsum.photos/seed/elec-pb-011/400/400", true, "20000mAh Portable Power Bank", 29.99m, "ELEC-PB-011", 50 },
                    { 12, "Lightweight cordless vacuum with HEPA filter.", "https://picsum.photos/seed/home-vc-012/400/400", true, "Cordless Stick Vacuum Cleaner", 129.99m, "HOME-VC-012", 9 },
                    { 13, "Lightweight expandable hose with 8-pattern spray nozzle.", "https://picsum.photos/seed/gard-hs-013/400/400", true, "50ft Expandable Garden Hose", 32.99m, "GARD-HS-013", 18 },
                    { 14, "Memory foam dog bed with removable, washable cover.", "https://picsum.photos/seed/pets-db-014/400/400", true, "Orthopedic Dog Bed (Large)", 49.99m, "PETS-DB-014", 14 },
                    { 15, "Adjustable lumbar support office chair with breathable mesh back.", "https://picsum.photos/seed/offc-ch-015/400/400", true, "Ergonomic Mesh Office Chair", 149.99m, "OFFC-CH-015", 6 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_Sku",
                table: "Products",
                column: "Sku",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
