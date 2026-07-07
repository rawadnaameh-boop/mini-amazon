using System.Net.Http.Json;

namespace ECommerce.Service;

public class MlSentimentClient
{
    private readonly HttpClient _httpClient;

    public MlSentimentClient(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("MLService");
    }

    public async Task<double> AnalyzeReviewAsync(string text)
    {
        var request = new AnalyzeReviewRequest
        {
            Text = text
        };

        var response = await _httpClient.PostAsJsonAsync("/analyze-review", request);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<AnalyzeReviewResponse>();

        if (result == null)
        {
            throw new Exception("ML service returned an empty response.");
        }

        return result.Score;
    }

    private class AnalyzeReviewRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    private class AnalyzeReviewResponse
    {
        public double Score { get; set; }
    }
}