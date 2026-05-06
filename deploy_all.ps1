$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

function Upload-File($remoteName, $localPath) {
    try {
        Write-Host "Uploading $remoteName..."
        $webClient.UploadFile($ftpServer + $remoteName, $localPath)
        Write-Host "$remoteName Upload SUCCESS"
    } catch {
        Write-Host "$remoteName Upload FAILED: $($_.Exception.Message)"
    }
}

Upload-File "dist_v4.zip" "c:\Users\TERA\Documents\delivery-pro-master\dist_v4.zip"
Upload-File "patch_backend.php" "c:\Users\TERA\Documents\delivery-pro-master\patch_backend.php"
Upload-File "deploy_trigger.php" "c:\Users\TERA\Documents\delivery-pro-master\deploy_trigger.php"

Write-Host "All files uploaded. Triggering deployment..."
try {
    $response = Invoke-WebRequest -Uri "https://deliveryexpressmg.com/deploy_trigger.php"
    Write-Host "Deployment Trigger Response: $($response.Content)"
} catch {
    Write-Host "Deployment Trigger FAILED: $($_.Exception.Message)"
}
