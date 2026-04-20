$ftpServer = "192.64.85.18"
$user = "delivery"
$pass = "Forastero_938"
$basePath = "C:\Users\Dev\Downloads\delivery final"
$distPath = "$basePath\dist"
$laravelDeployPath = "$basePath\tmp\laravel_deploy"

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

function Create-RemoteDirectory {
    param($remotePath)
    $parts = $remotePath.Split("/")
    $currentPath = ""
    foreach ($part in $parts) {
        if ([string]::IsNullOrWhiteSpace($part)) { continue }
        $currentPath += "$part/"
        try {
            $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/$currentPath")
            $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
            $ftp.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $response = $ftp.GetResponse()
            $response.Close()
        } catch {}
    }
}

# 1. Subir Backend (Laravel) - Estructura esencial
Write-Host "--- DESPLEGANDO BACKEND ---"
$backendFiles = @(
    @{ local = "$laravelDeployPath\.env"; remote = ".env" },
    @{ local = "$laravelDeployPath\bootstrap\app.php"; remote = "bootstrap/app.php" },
    @{ local = "$laravelDeployPath\routes\api.php"; remote = "routes/api.php" },
    @{ local = "$laravelDeployPath\routes\web.php"; remote = "routes/web.php" }
)

# Controladores
$controllers = Get-ChildItem "$laravelDeployPath\app\Http\Controllers\Api" -Filter *.php
foreach ($c in $controllers) {
    $backendFiles += @{ local = $c.FullName; remote = "app/Http/Controllers/Api/$($c.Name)" }
}

foreach ($item in $backendFiles) {
    $dirPart = [System.IO.Path]::GetDirectoryName($item.remote).Replace("\", "/")
    if (![string]::IsNullOrWhiteSpace($dirPart)) { Create-RemoteDirectory -remotePath $dirPart }
    Upload-File -localFile $item.local -remotePath $item.remote
}

# 2. Subir Frontend (dist) EXCLUYENDO fotogramas/
Write-Host "--- DESPLEGANDO FRONTEND (Optimizado) ---"
if (Test-Path $distPath) {
    $files = Get-ChildItem -Path $distPath -Recurse | Where-Object { !$_.PSIsContainer -and $_.FullName -notmatch "fotogramas" }
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($distPath.Length + 1).Replace("\", "/")
        $remote = "public_html/$relative"
        $dirPart = [System.IO.Path]::GetDirectoryName($remote).Replace("\", "/")
        if (![string]::IsNullOrWhiteSpace($dirPart)) { Create-RemoteDirectory -remotePath $dirPart }
        Upload-File -localFile $file.FullName -remotePath $remote
    }
}

# 3. Subir ZIP, Backup SQL y Scripts de utilidad
Write-Host "--- DESPLEGANDO ASSETS Y HERRAMIENTAS ---"
Upload-File -localFile "$basePath\fotogramas.zip" -remotePath "fotogramas.zip"
Upload-File -localFile "$basePath\backup.sql" -remotePath "backup.sql"
Upload-File -localFile "$basePath\unzip_frames.php" -remotePath "public_html/unzip_frames.php"
Upload-File -localFile "$basePath\tmp\laravel_deploy\public\import_db.php" -remotePath "public_html/import_db.php"

Write-Host "--- DESPLIEGUE COMPLETADO ---"
