$ErrorActionPreference = "Stop"

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Body,
        [string]$Token
    )
    $Headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $Headers["Authorization"] = "Bearer $Token" }
    
    try {
        $Params = @{
            Method      = $Method
            Uri         = $Uri
            Headers     = $Headers
            ContentType = "application/json"
        }
        if ($Body) { $Params["Body"] = ($Body | ConvertTo-Json -Depth 10) }
        
        $Response = Invoke-RestMethod @Params
        return $Response
    }
    catch {
        Write-Error "Request failed: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $Stream = $_.Exception.Response.GetResponseStream()
            $Reader = New-Object System.IO.StreamReader($Stream)
            Write-Host "Response Body: $($Reader.ReadToEnd())" -ForegroundColor Red
        }
        exit 1
    }
}

Write-Host "0. Registering User..."
$RegisterBody = @{
    email        = "test_order_flow@example.com"
    password     = "password123"
    first_name   = "Test"
    last_name    = "User"
    phone_number = "+251911223344"
    user_role    = "CUSTOMER"
}
try {
    Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/register" -Body $RegisterBody
    Write-Host "User Registered."
}
catch {
    Write-Host "User might already exist, proceeding to login..."
}

Write-Host "1. Logging in..."
$LoginBody = @{ email = "test_order_flow@example.com"; password = "password123" }
$LoginRes = Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/login" -Body $LoginBody
$Token = $LoginRes.token
Write-Host "Logged in. Token acquired."

Write-Host "2. Creating Order..."
$OrderBody = @{
    pickup_lat     = 9.0320
    pickup_lng     = 38.7469
    dropoff_lat    = 9.0054
    dropoff_lng    = 38.7636
    receiver_name  = "Test Receiver"
    receiver_phone = "+251911223344"
    price          = 100
}
$OrderRes = Invoke-Api -Method Post -Uri "http://localhost:3002/api/orders" -Body $OrderBody -Token $Token
$OrderId = $OrderRes.id
Write-Host "Order Created: $OrderId (Status: $($OrderRes.status))"

Write-Host "3. Assigning Courier..."
$AssignBody = @{ courier_id = "courier-123" }
$AssignRes = Invoke-Api -Method Patch -Uri "http://localhost:3002/api/orders/$OrderId/assign" -Body $AssignBody -Token $Token
Write-Host "Courier Assigned. Status: $($AssignRes.status), Courier: $($AssignRes.courier_id)"

Write-Host "4. Updating Status to PICKED_UP..."
$StatusBody = @{ status = "PICKED_UP" }
$StatusRes = Invoke-Api -Method Patch -Uri "http://localhost:3002/api/orders/$OrderId/status" -Body $StatusBody -Token $Token
Write-Host "Status Updated: $($StatusRes.status)"

Write-Host "5. Updating Status to DELIVERED..."
$StatusBody2 = @{ status = "DELIVERED" }
$StatusRes2 = Invoke-Api -Method Patch -Uri "http://localhost:3002/api/orders/$OrderId/status" -Body $StatusBody2 -Token $Token
Write-Host "Status Updated: $($StatusRes2.status)"

Write-Host "Verification Complete!"
