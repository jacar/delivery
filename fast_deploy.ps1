$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$basePath = "C:\Users\Dev\Downloads\delivery final"

function Upload-File {
    param($localFile, $remotePath)
    Write-Host "Subiendo $localFile a $remotePath..."
    try {
        $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/$remotePath")
        $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $ftp.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $fileBytes = [System.IO.File]::ReadAllBytes($localFile)
        $ftp.ContentLength = $fileBytes.Length
        $rs = $ftp.GetRequestStream()
        $rs.Write($fileBytes, 0, $fileBytes.Length)
        $rs.Close()
        $response = $ftp.GetResponse()
        $response.Close()
        Write-Host "OK"
    } catch {
        Write-Host "FALLO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🚀 DESPLIEGUE RÁPIDO: Solo Código React y Assets Críticos"

# 1. index.html
Upload-File -localFile "$basePath\dist\index.html" -remotePath "public/index.html"

# 2. assets (Bundles JS/CSS)
$assets = Get-ChildItem -Path "$basePath\dist\assets"
foreach ($file in $assets) {
    Upload-File -localFile $file.FullName -remotePath "public/assets/$($file.Name)"
}

# 3. manifest.json
Upload-File -localFile "$basePath\dist\manifest.json" -remotePath "public/manifest.json"

# 4. banners (New Local Assets)
$bannersPath = "$basePath\dist\banners"
if (Test-Path $bannersPath) {
    $banners = Get-ChildItem -Path $bannersPath -Recurse | Where-Object { !$_.PSIsContainer }
    foreach ($file in $banners) {
        $rel = $file.FullName.Substring($bannersPath.Length + 1).Replace("\", "/")
        Upload-File -localFile $file.FullName -remotePath "public/banners/$rel"
    }
}

Write-Host "✅ DESPLIEGUE RÁPIDO FINALIZADO"
