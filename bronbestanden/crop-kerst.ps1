Add-Type -AssemblyName System.Drawing

function Crop-Save($srcImg, $x, $y, $w, $h, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($srcImg, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), (New-Object System.Drawing.Rectangle $x, $y, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$staged = "C:\claude\leren-lezen\bronbestanden\_staged"
New-Item -ItemType Directory -Force -Path $staged | Out-Null

$img = [System.Drawing.Image]::FromFile("C:\claude\leren-lezen\bronbestanden\woordennogeen.png")

$col1X = 4; $col2X = 204; $colW = 96
$rows = @{
    1 = 100
    2 = 200
    3 = 322
    4 = 446
}
$rowH = 96

$grid = @{
    'sok2' = @(1, 1)   # left col, row1 (kerstsok, duplicate word "sok" already used elsewhere -- keep for reference only)
    'ster2' = @(2, 1)  # right col row1 (ster, duplicate)
    'bel' = @(1, 2)
    'muts' = @(2, 2)
    'koek' = @(1, 3)
    'bal2' = @(2, 3)   # duplicate
    'hulst' = @(1, 4)
    'boom' = @(2, 4)
}

foreach ($w in $grid.Keys) {
    $c = $grid[$w][0]; $r = $grid[$w][1]
    $x = if ($c -eq 1) { $col1X } else { $col2X }
    $y = $rows[$r]
    Crop-Save $img $x $y $colW $rowH "$staged\kerst_$w.png"
}
$img.Dispose()
Write-Output "done"
