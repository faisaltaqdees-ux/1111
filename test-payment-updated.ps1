# Test Payment API with Updated Metadata
$uri = "http://localhost:3000/api/blockchain/payment/initiate"
$headers = @{"Content-Type" = "application/json"}
$body = @{
    matchId = "match_001"
    quantity = 2
    ticketType = "standard"
    email = "user@kittypaws.com"
    walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0"
    amount = "5"
} | ConvertTo-Json

Write-Host "Testing Updated Payment API..."
Write-Host "URI: $uri"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
    Write-Host ""
    Write-Host "Session ID: $($response.sessionId)"
    Write-Host "Status: $($response.status)"
    Write-Host "Amount: $($response.amount) $($response.currency)"
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
