$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    $webClient.UploadFile($ftpServer + 'check_dir.php', 'c:\Users\TERA\Documents\delivery-pro-master\check_dir.php')
    $res = Invoke-WebRequest -Uri "https://deliveryexpressmg.com/check_dir.php" -UseBasicParsing
    Write-Host "--- DIR CHECK ---"
    Write-Host $res.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
