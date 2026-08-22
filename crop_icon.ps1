Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\SMEC\Documents\LOCASH\public\logo.jpg"
$destPath = "C:\Users\SMEC\Documents\LOCASH\public\logo.png"
$destFavicon = "C:\Users\SMEC\Documents\LOCASH\public\favicon.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

# The squircle icon is located within [x: 20..1004, y: 20..1004] with rounded corner radius ~ 220px
# Let's create a 32-bit ARGB bitmap with smooth anti-aliased graphics
$dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Clear with transparent
$g.Clear([System.Drawing.Color]::Transparent)

# Create a smooth rounded rectangle path for the squircle
# Margin: 20px on each side, Radius: 215px
$margin = 20
$rectW = $w - ($margin * 2)
$rectH = $h - ($margin * 2)
$radius = 215
$dia = $radius * 2

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($margin, $margin, $dia, $dia, 180, 90)
$path.AddArc($margin + $rectW - $dia, $margin, $dia, $dia, 270, 90)
$path.AddArc($margin + $rectW - $dia, $margin + $rectH - $dia, $dia, $dia, 0, 90)
$path.AddArc($margin, $margin + $rectH - $dia, $dia, $dia, 90, 90)
$path.CloseFigure()

# Set clip to rounded path and draw source image
$g.SetClip($path)
$g.DrawImage($src, 0, 0, $w, $h)

$g.Dispose()
$src.Dispose()

$dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dest.Save($destFavicon, [System.Drawing.Imaging.ImageFormat]::Png)
$dest.Dispose()

Write-Host "SUCCESS: Saved rounded transparent icon to logo.png and favicon.png"
