$ftpServer = 'ftp://deliveryexpressmg.com/public_html/'
$username = 'delivery'
$password = 'Forastero_938@@'
$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

function Upload-File($remotePath, $localPath) {
    try {
        Write-Host "Uploading $remotePath..."
        $webClient.UploadFile($ftpServer + $remotePath, $localPath)
        Write-Host "SUCCESS: $remotePath"
    } catch {
        Write-Host "FAILED: $remotePath - $($_.Exception.Message)"
    }
}

# Ensure assets directory exists on server (via a small PHP script)
$createDirScript = "<?php if(!is_dir('assets')) mkdir('assets', 0755); ?>"
$webClient.UploadString($ftpServer + 'mkdir_assets.php', $createDirScript)
Invoke-WebRequest -Uri "https://deliveryexpressmg.com/mkdir_assets.php" -UseBasicParsing

# Upload core files
Upload-File "index.html" "c:\Users\TERA\Documents\delivery-pro-master\dist\index.html"
Upload-File ".htaccess" "c:\Users\TERA\Documents\delivery-pro-master\dist\.htaccess"

# Upload assets one by one
$assets = Get-ChildItem "c:\Users\TERA\Documents\delivery-pro-master\dist\assets"
foreach ($file in $assets) {
    Upload-File ("assets/" + $file.Name) $file.FullName
}

Write-Host "Individual upload complete."
