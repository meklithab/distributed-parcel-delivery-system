$ErrorActionPreference = "Stop"

function Invoke-Api {
    param([string]$Method, [string]$Uri, [hashtable]$Body, [string]$Token)
    $Headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $Headers["Authorization"] = "Bearer $Token" }
    $Params = @{ Method = $Method; Uri = $Uri; Headers = $Headers; ContentType = "application/json" }
    if ($Body) { $Params["Body"] = ($Body | ConvertTo-Json) }
    return Invoke-RestMethod @Params
}

Write-Host "Creating Courier for testing..."
$Rand = Get-Random
$CourierEmail = "test_courier_$Rand@test.com"
$CourierBody = @{
    email        = $CourierEmail
    password     = "password123"
    first_name   = "Test"
    last_name    = "Courier"
    phone_number = "+2519" + (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
    user_role    = "COURIER"
}
Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/register" -Body $CourierBody

Write-Host "Logging in Courier..."
$LoginRes = Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/login" -Body @{ email = $CourierEmail; password = "password123" }
$Token = $LoginRes.token

Write-Host "Fetching Available Orders..."
$Available = Invoke-Api -Method Get -Uri "http://localhost:3002/api/orders/available" -Token $Token
Write-Host "Available Orders Found: $($Available.Count)"
$Available | ConvertTo-Json -Depth 2
