Add-Type -AssemblyName System.Drawing

function Save-Crop($srcImg, $x, $y, $w, $h, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($srcImg, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), (New-Object System.Drawing.Rectangle $x, $y, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$staged = "C:\claude\leren-lezen\bronbestanden\_staged"
New-Item -ItemType Directory -Force -Path $staged | Out-Null

$img = [System.Drawing.Image]::FromFile("C:\claude\leren-lezen\bronbestanden\nogmeerwoordentwee.jpg")

$col1X = 65; $col2X = 655; $colW = 225
$rows = @{ 1 = 230; 2 = 455; 3 = 680; 4 = 905; 5 = 1130; 6 = 1355 }
$rowH = 165

$grid = @{
    'fruit' = @(2, 1)
    'tuin' = @(1, 2)
    'slee' = @(2, 2)
    'mol' = @(1, 3)
    'spook' = @(2, 3)
    'trui' = @(1, 4)
    'pot' = @(2, 4)
    'kous' = @(1, 5)
    'flat' = @(2, 5)
    'eet' = @(1, 6)
    'zaai' = @(2, 6)
}

foreach ($w in $grid.Keys) {
    $c = $grid[$w][0]; $r = $grid[$w][1]
    $x = if ($c -eq 1) { $col1X } else { $col2X }
    $y = $rows[$r]
    Save-Crop $img $x $y $colW $rowH "$staged\wb2_$w.png"
}
$img.Dispose()
Write-Output "done"
