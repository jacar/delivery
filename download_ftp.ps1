param([string]$remotePath, [string]$localPath)

$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$url = "ftp://$ftpServer/$remotePath"

try {
    $ftp = [System.Net.FtpWebRequest]::Create($url)
    $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $ftp.Method = [System.Net.WebRequestMethods+Ftp]::DownloadFile
    
    $response = $ftp.GetResponse()
    $stream = $response.GetResponseStream()
    $fileStream = [System.IO.File]::Create($localPath)
    $stream.CopyTo($fileStream)
    
    $fileStream.Close()
    $stream.Close()
    $response.Close()
    
    Write-Output "DOWNLOAD_SUCCESS: $localPath"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
