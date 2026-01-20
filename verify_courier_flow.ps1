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

# --- 1. Customer Setup ---
Write-Host "`n=== 1. CUSTOMER SETUP ==="
$Timestamp = (Get-Date).ToString("yyyyMMddHHmmssfff")
$CustEmail = "customer_${Timestamp}@test.com"
# Generate random phone suffix (8 digits) to append to +2519
$RandPhone = (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
$CustPhone = "+2519$RandPhone"

Write-Host "Registering Customer: $CustEmail / $CustPhone"
$CustBody = @{
    email        = $CustEmail
    password     = "password123"
    first_name   = "Alice"
    last_name    = "Customer"
    phone_number = $CustPhone
    user_role    = "CUSTOMER"
}

try {
    Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/register" -Body $CustBody > $null
}
catch {
    Write-Error "Customer Registration Failed!"
    exit 1
}

Write-Host "Logging in Customer..."
$CustLoginRes = Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/login" -Body @{ email = $CustEmail; password = "password123" }
$CustToken = $CustLoginRes.token
Write-Host "Customer Logged In."

# --- 2. Create Order ---
Write-Host "`n=== 2. CREATE ORDER ==="
$OrderBody = @{
    pickup_lat     = 9.0000
    pickup_lng     = 38.0000
    dropoff_lat    = 9.1000
    dropoff_lng    = 38.1000
    receiver_name  = "Bob Receiver"
    receiver_phone = "+251922000000"
    price          = 150
}
$OrderRes = Invoke-Api -Method Post -Uri "http://localhost:3002/api/orders" -Body $OrderBody -Token $CustToken
$OrderId = $OrderRes.id
Write-Host "Order Created: $OrderId (Status: $($OrderRes.status))"

# --- 3. Courier Setup ---
Write-Host "`n=== 3. COURIER SETUP ==="
# New timestamp for courier to be safe
$Timestamp = (Get-Date).ToString("yyyyMMddHHmmssfff")
$CourierEmail = "courier_${Timestamp}@test.com"
$RandPhone2 = (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
$CourierPhone = "+2519$RandPhone2"

Write-Host "Registering Courier: $CourierEmail / $CourierPhone"
$CourierBody = @{
    email        = $CourierEmail
    password     = "password123"
    first_name   = "Charlie"
    last_name    = "Courier"
    phone_number = $CourierPhone
    user_role    = "COURIER"
}
try {
    Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/register" -Body $CourierBody > $null
}
catch {
    Write-Error "Courier Registration Failed!"
    exit 1
}

Write-Host "Logging in Courier..."
$CourierLoginRes = Invoke-Api -Method Post -Uri "http://localhost:3001/api/auth/login" -Body @{ email = $CourierEmail; password = "password123" }
$CourierToken = $CourierLoginRes.token
$CourierId = $CourierLoginRes.user.id
Write-Host "Courier Logged In. ID: $CourierId"

# --- 4. Courier Accepts Order ---
Write-Host "`n=== 4. COURIER ACCEPTS ORDER ==="
# Courier assigns the order to themselves
$AssignBody = @{ courier_id = $CourierId }
$AssignRes = Invoke-Api -Method Patch -Uri "http://localhost:3002/api/orders/$OrderId/assign" -Body $AssignBody -Token $CourierToken
Write-Host "Order Accepted! Status: $($AssignRes.status)"
Write-Host "Assigned Courier ID: $($AssignRes.courier_id)"

if ($AssignRes.courier_id -ne $CourierId) {
    Write-Error "Assignment failed: Order courier ID does not match."
}

# --- 5. Courier Delivers Order ---
Write-Host "`n=== 5. DELIVERY FLOW ==="
Write-Host "Picking up package..."
$PickupBody = @{ status = "PICKED_UP" }
$PickupRes = Invoke-Api -Method Patch -Uri "http://localhost:3002/api/orders/$OrderId/status" -Body $PickupBody -Token $CourierToken
Write-Host "Status: $($PickupRes.status)"

Write-Host "Delivering package..."
$DeliverBody = @{ status = "DELIVERED" }
$DeliverRes = Invoke-Api -Method Patch -Uri "http://localhost:3002/api/orders/$OrderId/status" -Body $DeliverBody -Token $CourierToken
Write-Host "Status: $($DeliverRes.status)"

Write-Host "`n=== VERIFICATION SUCCESSFUL ==="
