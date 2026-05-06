$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    $webClient.UploadFile($ftpServer + 'patch_backend.php', 'c:\Users\TERA\Documents\delivery-pro-master\patch_backend.php')
    $res = Invoke-WebRequest -Uri "https://deliveryexpressmg.com/patch_backend.php" -UseBasicParsing
    Write-Host "--- BACKEND PATCH LOG ---"
    Write-Host $res.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
