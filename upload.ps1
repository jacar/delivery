$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery@deliveryexpressmg.com'
$password = 'Forastero'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    Write-Host "Uploading patch_backend.php..."
    $webClient.UploadFile($ftpServer + 'patch_backend.php', 'c:\Users\TERA\Documents\delivery-pro-master\patch_backend.php')
    Write-Host "Backend upload SUCCESS"
} catch {
    Write-Host "Backend upload FAILED: $($_.Exception.Message)"
}

try {
    Write-Host "Uploading dist_v4.zip..."
    $webClient.UploadFile($ftpServer + 'dist_v4.zip', 'c:\Users\TERA\Documents\delivery-pro-master\dist_v4.zip')
    Write-Host "Frontend upload SUCCESS"
} catch {
    Write-Host "Frontend upload FAILED: $($_.Exception.Message)"
}
