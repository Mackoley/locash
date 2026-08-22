Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\SMEC\Documents\LOCASH\public\logo.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)

function Resize-Image($source, $width, $height, $outPath) {
    $dest = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($source, 0, 0, $width, $height)
    $g.Dispose()
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
}

Resize-Image $src 192 192 "C:\Users\SMEC\Documents\LOCASH\public\icon-192.png"
Resize-Image $src 512 512 "C:\Users\SMEC\Documents\LOCASH\public\icon-512.png"
Resize-Image $src 180 180 "C:\Users\SMEC\Documents\LOCASH\public\apple-touch-icon.png"

$src.Dispose()
Write-Host "SUCCESS: Generated icon-192.png, icon-512.png and apple-touch-icon.png"
