Add-Type -AssemblyName System.Drawing

$staged = "C:\claude\leren-lezen\bronbestanden\_staged"
New-Item -ItemType Directory -Force -Path $staged | Out-Null

function Crop-Save($srcImg, $x, $y, $w, $h, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($srcImg, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), (New-Object System.Drawing.Rectangle $x, $y, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $g.Dispose()
    $bmp.Dispose()
}

# ---- plaatjes3.jpg (Larsen woordpuzzel), 8 cols x 5 row-pairs ----
$p3 = [System.Drawing.Image]::FromFile("C:\claude\leren-lezen\bronbestanden\plaatjes3.jpg")
$colW = 292
$colX0 = 122
$rowPairH = 371
$rowY0 = 115
$labelH = 120
$picH = 210

$grid = @{
    'aap'=@(0,0); 'bal'=@(0,1); 'beer'=@(0,2); 'eend'=@(0,6); 'egel'=@(0,7)
    'gans'=@(1,2); 'huis'=@(1,5)
    'kaas'=@(2,0); 'maan'=@(2,4); 'muis'=@(2,5); 'neus'=@(2,6); 'noot'=@(2,7)
    'oog'=@(3,0); 'oor'=@(3,1); 'roos'=@(3,6); 'sok'=@(3,7)
    'ster'=@(4,0); 'tas'=@(4,1); 'vis'=@(4,4); 'vuur'=@(4,5); 'wolf'=@(4,6); 'zon'=@(4,7)
}
foreach ($w in $grid.Keys) {
    $r = $grid[$w][0]; $c = $grid[$w][1]
    $x = $colX0 + $c * $colW + 8
    $y = $rowY0 + $r * $rowPairH + $labelH + 8
    Crop-Save $p3 $x $y ($colW - 24) ($picH - 16) "$staged\p3_$w.jpg"
}
$p3.Dispose()

# ---- memory.jpg (Circuitspelletjes kern 4), picture columns only (0 and 2) ----
$mem = [System.Drawing.Image]::FromFile("C:\claude\leren-lezen\bronbestanden\memory.jpg")
$mColW = 313
$mColX0 = 32
$mColPitch = 343
$mRowH = 254
$mRowY0 = 343
$mRowPitch = 284

$memGrid = @{
    'bij'=@(0,0); 'tak'=@(0,2)
    'wiel'=@(1,0); 'wol'=@(1,2)
    'zout'=@(2,0); 'tas2'=@(2,2)
    'neus'=@(3,0); 'arm'=@(3,2)
    'zeep'=@(4,0); 'voet'=@(4,2)
}
foreach ($w in $memGrid.Keys) {
    $r = $memGrid[$w][0]; $c = $memGrid[$w][1]
    $x = $mColX0 + $c * $mColPitch
    $y = $mRowY0 + $r * $mRowPitch
    Crop-Save $mem $x $y $mColW $mRowH "$staged\mem_$w.jpg"
}
$mem.Dispose()

Write-Output "done"
