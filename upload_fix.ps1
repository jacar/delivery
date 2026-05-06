$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    Write-Host "Uploading fix_assets.php..."
    $webClient.UploadFile($ftpServer + 'fix_assets.php', 'c:\Users\TERA\Documents\delivery-pro-master\fix_assets.php')
    Write-Host "Upload SUCCESS"
} catch {
    Write-Host "Upload FAILED: $($_.Exception.Message)"
}
