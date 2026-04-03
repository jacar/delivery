param([string]$path)

$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$url = "ftp://$ftpServer/$path"

try {
    $ftp = [System.Net.FtpWebRequest]::Create($url)
    $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $ftp.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
    
    $response = $ftp.GetResponse()
    $response.Close()
    Write-Output "DELETED: $path"
} catch {
    Write-Host "FAILED: $path - $($_.Exception.Message)" -ForegroundColor Red
}
