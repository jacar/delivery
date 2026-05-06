$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    $webClient.UploadFile($ftpServer + 'inspect_zip.php', 'c:\Users\TERA\Documents\delivery-pro-master\inspect_zip.php')
    $res = Invoke-WebRequest -Uri "https://deliveryexpressmg.com/inspect_zip.php" -UseBasicParsing
    Write-Host "--- ZIP INSPECTION ---"
    Write-Host $res.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
