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

# 0. Crear directorios base
Create-RemoteDirectory -remotePath "src/components"
Create-RemoteDirectory -remotePath "src/fotogramas"
Create-RemoteDirectory -remotePath "public"

# 1. Subir archivos de código
Upload-File -localFile "$basePath\src\components\ScrollSequence.tsx" -remotePath "src/components/ScrollSequence.tsx"
Upload-File -localFile "$basePath\src\components\HomeInformativo.tsx" -remotePath "src/components/HomeInformativo.tsx"

# 2. Subir ZIP de fotogramas
Upload-File -localFile "$basePath\fotogramas.zip" -remotePath "fotogramas.zip"

# 3. Subir script de descompresión a 'public/'
Upload-File -localFile "$basePath\unzip_frames.php" -remotePath "public/unzip_frames.php"

Write-Host "PROCESO_DE_SUBIDA_COMPLETO"
