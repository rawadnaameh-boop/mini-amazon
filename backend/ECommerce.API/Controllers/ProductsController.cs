using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public ProductsController(
        IProductService productService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        _productService = productService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    // GET /api/products
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _productService.GetAllProductsAsync();
        return Ok(products);
    }

    // GET /api/products/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdWithRecommendationsAsync(
            id,
            cancellationToken
        );

        if (product == null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    // POST /api/products/visual-search
    [HttpPost("visual-search")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> VisualSearch(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                status = "error",
                message = "No image file was uploaded."
            });
        }

        if (string.IsNullOrWhiteSpace(file.ContentType) ||
            !file.ContentType.StartsWith("image/"))
        {
            return BadRequest(new
            {
                status = "error",
                message = "Uploaded file must be an image."
            });
        }

        try
        {
            var mlServiceUrl = _configuration["ML_SERVICE_URL"];

            if (string.IsNullOrWhiteSpace(mlServiceUrl))
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = "ML_SERVICE_URL is missing from configuration."
                });
            }

            var pythonVisualSearchUrl = $"{mlServiceUrl.TrimEnd('/')}/visual-search";

            using var multipartContent = new MultipartFormDataContent();

            await using var fileStream = file.OpenReadStream();

            using var fileContent = new StreamContent(fileStream);

            fileContent.Headers.ContentType =
                new MediaTypeHeaderValue(file.ContentType);

            multipartContent.Add(fileContent, "file", file.FileName);

            var httpClient = _httpClientFactory.CreateClient();

            var response = await httpClient.PostAsync(
                pythonVisualSearchUrl,
                multipartContent
            );

            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, responseBody);
            }

            return Content(responseBody, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "error",
                message = $"Visual search failed: {ex.Message}"
            });
        }
    }
}