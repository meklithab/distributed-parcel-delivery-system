
# Profile Verification Script
$ErrorActionPreference = "Stop"

$userUrl = "http://localhost:3001/api/users"
$registerUrl = "http://localhost:3001/api/auth/register"
$loginUrl = "http://localhost:3001/api/auth/login"

function Invoke-ApiRequest {
    param (
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )

    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "Error calling $Uri" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
             # Read the error stream correctly
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        }
        throw $_
    }
}

Write-Host "1. Registering new user for profile test..."
$randomInt = Get-Random -Minimum 1000 -Maximum 9999
$email = "profiletest$randomInt@example.com"
$password = "password123"

$user = @{
    email = $email
    password = $password
    first_name = "Original"
    last_name = "Name"
    phone_number = "0911000000"
    role = "CUSTOMER"
}

$registerResponse = Invoke-ApiRequest -Uri $registerUrl -Method "POST" -Body $user
Write-Host "User Registered: $($registerResponse.user.email)" -ForegroundColor Green

Write-Host "2. Logging in..."
$loginBody = @{ email = $email; password = $password }
$loginResponse = Invoke-ApiRequest -Uri $loginUrl -Method "POST" -Body $loginBody
$token = $loginResponse.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Logged in. Token received." -ForegroundColor Green

Write-Host "3. Fetching Profile (Initial)..."
$profile = Invoke-ApiRequest -Uri "$userUrl/me" -Headers $headers
if ($profile.first_name -eq "Original") {
    Write-Host "Profile Fetch Verified." -ForegroundColor Green
} else {
    Write-Error "Profile fetch failed. Expected Original, got $($profile.first_name)"
}

Write-Host "4. Updating Profile..."
$updateBody = @{
    first_name = "Updated"
    last_name = "User"
    phone_number = "0999999999"
}
$updatedProfile = Invoke-ApiRequest -Uri "$userUrl/me" -Method "PUT" -Headers $headers -Body $updateBody
if ($updatedProfile.user.first_name -eq "Updated") {
    Write-Host "Profile Update Response Verified." -ForegroundColor Green
} else {
    Write-Error "Profile update response failed. Expected Updated, got $($updatedProfile.user.first_name)"
}

Write-Host "5. Verifying Persistence..."
$finalProfile = Invoke-ApiRequest -Uri "$userUrl/me" -Headers $headers
if ($finalProfile.first_name -eq "Updated" -and $finalProfile.phone_number -eq "0999999999") {
    Write-Host "Profile Persistence Verified." -ForegroundColor Green
} else {
    Write-Error "Profile persistence failed. Got $($finalProfile.first_name)"
}

Write-Host "PROFILE FLOW VERIFICATION PASSED" -ForegroundColor Cyan
