$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    Write-Host "Uploading dist_v4.zip..."
    $webClient.UploadFile($ftpServer + 'dist_v4.zip', 'c:\Users\TERA\Documents\delivery-pro-master\dist_v4.zip')
    Write-Host "Uploading debug_extract.php..."
    $webClient.UploadFile($ftpServer + 'debug_extract.php', 'c:\Users\TERA\Documents\delivery-pro-master\debug_extract.php')
    
    Write-Host "Triggering extraction..."
    $res = Invoke-WebRequest -Uri "https://deliveryexpressmg.com/debug_extract.php" -UseBasicParsing -TimeoutSec 120
    Write-Host "--- EXTRACTION LOG ---"
    Write-Host $res.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
