using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/ml-health")]
    public class MlHealthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<MlHealthController> _logger;

        public MlHealthController(
            IHttpClientFactory httpClientFactory,
            ILogger<MlHealthController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetMlHealth()
        {
            try
            {
                var client = _httpClientFactory.CreateClient("MLService");

                var response = await client.GetAsync("/api/ml-health");
                var body = await response.Content.ReadAsStringAsync();

                _logger.LogInformation(
                    "ML service response: {StatusCode} - {Body}",
                    response.StatusCode,
                    body
                );

                return Content(body, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call ML service");

                return StatusCode(500, new
                {
                    error = "Failed to call ML service",
                    details = ex.Message
                });
            }
        }
    }
}