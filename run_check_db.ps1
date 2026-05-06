$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    $webClient.UploadFile($ftpServer + 'check_db_allies.php', 'c:\Users\TERA\Documents\delivery-pro-master\check_db_allies.php')
    $res = Invoke-WebRequest -Uri "https://deliveryexpressmg.com/check_db_allies.php" -UseBasicParsing
    Write-Host "--- ALLIES DB ---"
    Write-Host $res.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
