$uri = "https://www.webcincodev.com/b2b/public/api/login"
$json = '{"email":"admin@delivery.com","password":"admin123"}'
try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -Body $json -ContentType "application/json" -UseBasicParsing
    Write-Host "STATUS: $($response.StatusCode)"
    Write-Host "BODY: $($response.Content)"
} catch {
    $result = $_.Exception.Response
    $reader = New-Object System.IO.StreamReader($result.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host "ERROR STATUS: $($result.StatusCode)"
    Write-Host "ERROR BODY: $body"
}
