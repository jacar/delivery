$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$basePath = "C:\Users\Dev\Downloads\delivery final"

function Upload-File {
    param($localFile, $remotePath)
    $maxRetries = 2
    $retryCount = 0
    $success = $false

    while (-not $success -and $retryCount -lt $maxRetries) {
        Write-Host "Subiendo $localFile a $remotePath (Intento $($retryCount + 1))..."
        try {
            $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/$remotePath")
            $ftp.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
            $ftp.UseBinary = $true
            $ftp.UsePassive = $false # Intentamos modo ACTIVO por si el pasivo falla
            $ftp.KeepAlive = $false
            $ftp.Timeout = 15000

            $fileBytes = [System.IO.File]::ReadAllBytes($localFile)
            $ftp.ContentLength = $fileBytes.Length
            $rs = $ftp.GetRequestStream()
            $rs.Write($fileBytes, 0, $fileBytes.Length)
            $rs.Close()
            $rs.Dispose()
            Write-Host "OK" -ForegroundColor Green
            $success = $true
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "Error: $($_.Exception.Message). Reintentando..." -ForegroundColor Yellow
                Start-Sleep -Seconds 1
            }
        }
    }
    return $success
}

# Solo subir lo estrictamente necesario
$filesToUpload = @(
    @{Local="dist\.htaccess"; Remote="public/.htaccess"},
    @{Local="dist\index.html"; Remote="public/index.html"}
)

$assets = Get-ChildItem -Path "$basePath\dist\assets"
foreach ($file in $assets) {
    $filesToUpload += @{Local="dist\assets\$($file.Name)"; Remote="public/assets/$($file.Name)"}
}

foreach ($item in $filesToUpload) {
    $fullLocal = Join-Path $basePath $item.Local
    Upload-File -localFile $fullLocal -remotePath $item.Remote
}

Write-Host "DESPLIEGE_RAPIDO_FINALIZADO"
