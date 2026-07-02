FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src


COPY ECommerce.Domain/ECommerce.Domain.csproj           ECommerce.Domain/
COPY ECommerce.Application/ECommerce.Application.csproj ECommerce.Application/
COPY ECommerce.Infrastructure/ECommerce.Infrastructure.csproj ECommerce.Infrastructure/
COPY ECommerce.Service/ECommerce.Service.csproj         ECommerce.Service/
COPY ECommerce.API/ECommerce.API.csproj                 ECommerce.API/
RUN dotnet restore ECommerce.API/ECommerce.API.csproj


COPY . .
RUN dotnet publish ECommerce.API/ECommerce.API.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ECommerce.API.dll"]