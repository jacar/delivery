$ftpServer = "192.64.85.18"
$user = "delivery"
$pass = "Forastero_938"
$basePath = "C:\Users\Dev\Downloads\delivery final"
$distPath = "$basePath\dist"
$laravelDeployPath = "$basePath\tmp\laravel_deploy"

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
            Write-Host "Directorio creado o verificado: $currentPath"
        } catch {
            # Ignorar si ya existe
        }
    }
}

function Upload-File {
    param($localFile, $remotePath)
    # Asegurar que el directorio padre existe
    $dirPart = [System.IO.Path]::GetDirectoryName($remotePath).Replace("\", "/")
    if (![string]::IsNullOrWhiteSpace($dirPart)) {
        Create-RemoteDirectory -remotePath $dirPart
    }

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

# 1. Subir archivos Laravel Backend
Upload-File -localFile "$laravelDeployPath\bootstrap\app.php" -remotePath "bootstrap/app.php"
Upload-File -localFile "$laravelDeployPath\routes\api.php" -remotePath "routes/api.php"
Upload-File -localFile "$laravelDeployPath\routes\web.php" -remotePath "routes/web.php"
Upload-File -localFile "$laravelDeployPath\app\Http\Controllers\Api\DeliveryController.php" -remotePath "app/Http/Controllers/Api/DeliveryController.php"
Upload-File -localFile "$laravelDeployPath\app\Http\Controllers\Api\AliadoController.php" -remotePath "app/Http/Controllers/Api/AliadoController.php"
Upload-File -localFile "$laravelDeployPath\app\Http\Controllers\Api\UserController.php" -remotePath "app/Http/Controllers/Api/UserController.php"
Upload-File -localFile "$laravelDeployPath\app\Http\Controllers\Api\UploadController.php" -remotePath "app/Http/Controllers/Api/UploadController.php"
Upload-File -localFile "$laravelDeployPath\app\Http\Controllers\Api\AuthController.php" -remotePath "app/Http/Controllers/Api/AuthController.php"
Upload-File -localFile "$laravelDeployPath\app\Http\Controllers\Api\MessageController.php" -remotePath "app/Http/Controllers/Api/MessageController.php"
Upload-File -localFile "$laravelDeployPath\app\Http\Controllers\Api\MotoTaxiController.php" -remotePath "app/Http/Controllers/Api/MotoTaxiController.php"


# 2. Subir Frontend (dist) a la carpeta 'public'
if (Test-Path $distPath) {
    $files = Get-ChildItem -Path $distPath -Recurse | Where-Object { !$_.PSIsContainer }
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($distPath.Length + 1).Replace("\", "/")
        Upload-File -localFile $file.FullName -remotePath "public/$relative"
    }
}

Write-Host "DESPLIEGE_FINALIZADO"
