using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ECommerce.Application.DTOs
{
    public class MlCustomerSegmentResponseDto
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public List<CustomerSegmentDto> Data { get; set; } = new();
    }
}