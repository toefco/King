$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:5192/")
$listener.Start()
Write-Host "服务器运行在 http://localhost:5192/"

$basePath = "D:\kingou\dist"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $localPath = $request.Url.LocalPath
    if ($localPath -eq "/") {
        $localPath = "/index.html"
    }
    
    $filePath = Join-Path -Path $basePath -ChildPath $localPath.TrimStart("/")
    
    if (Test-Path -Path $filePath -PathType Leaf) {
        try {
            $content = Get-Content -Path $filePath -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($extension) {
                    ".html" { "text/html; charset=UTF-8" }
                    ".css" { "text/css; charset=UTF-8" }
                    ".js" { "application/javascript; charset=UTF-8" }
                    ".json" { "application/json; charset=UTF-8" }
                    ".png" { "image/png" }
                    ".jpg" { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg" { "image/svg+xml" }
                    ".ico" { "image/x-icon" }
                    default { "application/octet-stream" }
                }
                $response.ContentType = $contentType
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        } catch {
            Write-Host "读取文件失败: $filePath"
        }
    } else {
        $response.StatusCode = 404
    }
    
    $response.Close()
}

$listener.Stop()