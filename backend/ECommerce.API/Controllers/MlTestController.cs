using Microsoft.AspNetCore.Mvc;
namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/ml-test")]
public class MlTestController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<MlTestController> _logger;

    public MlTestController(
         IHttpClientFactory httpClientFactory,
         ILogger<MlTestController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }
    [HttpGet("health")]
    public async Task<IActionResult> CheckMlHealth(CancellationToken cancellationToken)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("MLService");
            var response = await client.GetAsync("/api/ml-health", cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogInformation(
                "ML service response: StatusCode={StatusCode}, Body={Body}",
                (int)response.StatusCode,
                body
                );
            return Content(body, "application/json");


        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to call ML service");
            return StatusCode(503,
                new
                {
                    message = "ML service is unavailable",
                    error = ex.Message
                });
        }
    }
}

