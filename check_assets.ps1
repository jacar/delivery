$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    $webClient.UploadFile($ftpServer + 'list_assets.php', 'c:\Users\TERA\Documents\delivery-pro-master\list_assets.php')
    $res = Invoke-WebRequest -Uri "https://deliveryexpressmg.com/list_assets.php" -UseBasicParsing
    Write-Host "--- ASSETS ON SERVER ---"
    Write-Host $res.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
