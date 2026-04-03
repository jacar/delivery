param([string]$oldPath, [string]$newPath)

$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$url = "ftp://$ftpServer/$oldPath"

try {
    $ftp = [System.Net.FtpWebRequest]::Create($url)
    $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $ftp.Method = [System.Net.WebRequestMethods+Ftp]::Rename
    $ftp.RenameTo = $newPath
    
    $response = $ftp.GetResponse()
    $response.Close()
    Write-Output "RENAME_SUCCESS: $oldPath TO $newPath"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
