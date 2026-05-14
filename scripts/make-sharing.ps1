Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile((Resolve-Path public/images/sharing.png).Path)
$tw = 1200
$th = [int]($src.Height * $tw / $src.Width)
$bmp = New-Object System.Drawing.Bitmap $tw, $th
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, 0, 0, $tw, $th)
$g.Dispose()
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
$out = Join-Path $PWD 'public/images/sharing.jpg'
$bmp.Save($out, $jpegCodec, $ep)
$bmp.Dispose(); $src.Dispose()
Write-Host "Saved: $out  Size: $((Get-Item $out).Length) bytes  Dims: ${tw}x${th}"
