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
        $ftp.UseBinary = $true
        $ftp.UsePassive = $true
        $ftp.KeepAlive = $false
        
        $fileBytes = [System.IO.File]::ReadAllBytes($localFile)
        $ftp.ContentLength = $fileBytes.Length
        $rs = $ftp.GetRequestStream()
        $rs.Write($fileBytes, 0, $fileBytes.Length)
        $rs.Close()
        $rs.Dispose()
        $response = $ftp.GetResponse()
        $response.Close()
        Write-Host "OK" -ForegroundColor Green
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

# 1. Subir archivos 'dist' (Build) a 'public/' filtrando lo pesado
Write-Host "Desplegando archivos de construccion (SOLO CODIGO)..."
if (Test-Path "$basePath\dist") {
    $files = Get-ChildItem -Path "$basePath\dist" -Recurse -Force | Where-Object { 
        !$_.PSIsContainer -and 
        $_.FullName -notmatch "fotogramas" -and 
        $_.FullName -notmatch "banners"
    }
    foreach ($file in $files) {
        $rel = $file.FullName.Substring(("$basePath\dist").Length + 1).Replace("\", "/")
        $remote = "public/$rel"
        $dirPart = [System.IO.Path]::GetDirectoryName($remote).Replace("\", "/")
        if (![string]::IsNullOrWhiteSpace($dirPart)) { Create-RemoteDirectory -remotePath $dirPart }
        Upload-File -localFile $file.FullName -remotePath $remote
    }
}

Write-Host "FAST_DEPLOY_FINALIZADO"
