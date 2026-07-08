using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration; 
using System;
using System.Threading.Tasks;
using System.Text.Json;                 
using Amazon;                         
using Amazon.SQS;                      
using Amazon.SQS.Model;                

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IConfiguration _configuration; 

    public OrdersController(IOrderService orderService, IConfiguration configuration)
    {
        _orderService = orderService;
        _configuration = configuration;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromQuery] int userId, [FromBody] CheckoutRequestDto request)
    {
        try
        {
            var order = await _orderService.CheckoutAsync(userId, request);

            
            try
            {
                
                var awsConfig = _configuration.GetSection("AWS");
                var awsAccessKey = awsConfig["AccessKey"];
                var awsSecretKey = awsConfig["SecretKey"];
                var region = RegionEndpoint.GetBySystemName(awsConfig["Region"]);
                var queueUrl = awsConfig["QueueUrl"];

               
                var sqsClient = new AmazonSQSClient(awsAccessKey, awsSecretKey, region);

             
                var queuePayload = new
                {
                    UserId = userId,
                    TriggerTime = DateTime.UtcNow
                };
                string messageBody = JsonSerializer.Serialize(queuePayload);

                var sendMessageRequest = new SendMessageRequest
                {
                    QueueUrl = queueUrl,
                    MessageBody = messageBody
                };

                await sqsClient.SendMessageAsync(sendMessageRequest);
                Console.WriteLine($":email: SQS Event Logged: Order placed successfully. Sent execution notice for User ID {userId} down the pipeline.");
            }
            catch (Exception ex)
            {
               
                Console.WriteLine($":warning: SQS Background Dispatcher Failure: {ex.Message}");
            }

          
            return CreatedAtAction(nameof(GetById), new { id = order.OrderId, userId = userId }, order);
        }
        catch (CartEmptyException ex) { return BadRequest(new { message = ex.Message }); }
        catch (ProductNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InsufficientStockException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders([FromQuery] int userId = 1)
    {
        var orders = await _orderService.GetUserOrderHistoryAsync(userId);
        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] int userId = 1)
    {
        var order = await _orderService.GetOrderAsync(id, userId);

        if (order == null)
        {
            return NotFound(new { message = $"Order #{id} not found or access denied." });
        }

        return Ok(order);
    }
}