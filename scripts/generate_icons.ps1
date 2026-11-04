param(
    [string]$OutputDir = "frontend\public\icons"
)

Add-Type -AssemblyName System.Drawing

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

function Generate-Icon([int]$sz, [string]$filePath) {
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Rounded background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $sz, $sz)
    $c1 = [System.Drawing.ColorTranslator]::FromHtml("#6d28d9")
    $c2 = [System.Drawing.ColorTranslator]::FromHtml("#be185d")
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $g.FillRectangle($brush, $rect)

    # Outer circle
    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), [Math]::Max(2, [int]($sz * 0.02)))
    $margin = [int]($sz * 0.1)
    $ringRect = New-Object System.Drawing.Rectangle($margin, $margin, ($sz - 2*$margin), ($sz - 2*$margin))
    $g.DrawEllipse($ringPen, $ringRect)

    # Central Lotus Shape
    $center = $sz / 2.0
    $petalBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
    $sideBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215, 253, 230, 240))
    
    # Left petal
    $leftP = New-Object System.Drawing.Drawing2D.GraphicsPath
    $leftP.AddBezier([float]($center - $sz*0.05), [float]($sz*0.28), [float]($center - $sz*0.24), [float]($sz*0.35), [float]($center - $sz*0.20), [float]($sz*0.54), [float]$center, [float]($sz*0.58))
    $leftP.AddBezier([float]$center, [float]($sz*0.58), [float]($center - $sz*0.06), [float]($sz*0.48), [float]($center - $sz*0.03), [float]($sz*0.38), [float]($center - $sz*0.05), [float]($sz*0.28))
    $g.FillPath($sideBrush, $leftP)

    # Right petal
    $rightP = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rightP.AddBezier([float]($center + $sz*0.05), [float]($sz*0.28), [float]($center + $sz*0.24), [float]($sz*0.35), [float]($center + $sz*0.20), [float]($sz*0.54), [float]$center, [float]($sz*0.58))
    $rightP.AddBezier([float]$center, [float]($sz*0.58), [float]($center + $sz*0.06), [float]($sz*0.48), [float]($center + $sz*0.03), [float]($sz*0.38), [float]($center + $sz*0.05), [float]($sz*0.28))
    $g.FillPath($sideBrush, $rightP)

    # Center petal
    $midP = New-Object System.Drawing.Drawing2D.GraphicsPath
    $midP.AddBezier([float]$center, [float]($sz*0.22), [float]($center - $sz*0.12), [float]($sz*0.35), [float]($center - $sz*0.10), [float]($sz*0.50), [float]$center, [float]($sz*0.58))
    $midP.AddBezier([float]$center, [float]($sz*0.58), [float]($center + $sz*0.10), [float]($sz*0.50), [float]($center + $sz*0.12), [float]($sz*0.35), [float]$center, [float]($sz*0.22))
    $g.FillPath($petalBrush, $midP)

    # Seed
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#f59e0b"))
    $sr = [float]($sz * 0.04)
    $g.FillEllipse($goldBrush, [float]($center - $sr), [float]($sz*0.52), [float]($sr*2), [float]($sr*2))

    # Pulse wave
    $pulsePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(2, [int]($sz * 0.03)))
    $pulsePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pulsePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pulsePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $pts = @(
        (New-Object System.Drawing.PointF ([float]($sz * 0.18), [float]($sz * 0.74))),
        (New-Object System.Drawing.PointF ([float]($sz * 0.35), [float]($sz * 0.74))),
        (New-Object System.Drawing.PointF ([float]($sz * 0.42), [float]($sz * 0.67))),
        (New-Object System.Drawing.PointF ([float]($sz * 0.48), [float]($sz * 0.81))),
        (New-Object System.Drawing.PointF ([float]($sz * 0.54), [float]($sz * 0.63))),
        (New-Object System.Drawing.PointF ([float]($sz * 0.60), [float]($sz * 0.82))),
        (New-Object System.Drawing.PointF ([float]($sz * 0.66), [float]($sz * 0.74))),
        (New-Object System.Drawing.PointF ([float]($sz * 0.82), [float]($sz * 0.74)))
    )
    $g.DrawLines($pulsePen, $pts)

    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Generated: $filePath ($sz x $sz)"
}

Generate-Icon 192 "$OutputDir\icon-192.png"
Generate-Icon 512 "$OutputDir\icon-512.png"
