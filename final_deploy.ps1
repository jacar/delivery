$ftpServer = "192.64.85.18"
$user = "delivery"
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

# 1. Subir archivos 'dist' (Build) a 'public_html/' (cPanel estándar)
Write-Host "Desplegando archivos de construcción (dist) a public_html/..."
if (Test-Path "$basePath\dist") {
    $files = Get-ChildItem -Path "$basePath\dist" -Recurse -Force | Where-Object { !$_.PSIsContainer -and $_.FullName -notmatch "fotogramas" }
    foreach ($file in $files) {
        $rel = $file.FullName.Substring(("$basePath\dist").Length + 1).Replace("\", "/")
        $remote = "public_html/$rel"
        $dirPart = [System.IO.Path]::GetDirectoryName($remote).Replace("\", "/")
        if (![string]::IsNullOrWhiteSpace($dirPart)) { Create-RemoteDirectory -remotePath $dirPart }
        Upload-File -localFile $file.FullName -remotePath $remote
    }
}

# 2. Subir script de descompresión y herramientas a 'public_html/'
Write-Host "Subiendo scripts de utilidad..."
Upload-File -localFile "$basePath\unzip_frames.php" -remotePath "public_html/unzip_frames.php"
Upload-File -localFile "$basePath\fotogramas.zip" -remotePath "fotogramas.zip"

Write-Host "DESPLIEGUE_DE_PRODUCCION_FINALIZADO"
