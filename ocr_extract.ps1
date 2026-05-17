# Load required assemblies
[Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null

# Load the image
$file = 'C:\Users\M.K COMPUTERS\Pictures\Screenshots\Screenshot 2026-05-15 234841.png'
$bitmap = [System.Drawing.Bitmap]::FromFile($file)

# Convert to byte array
$ms = New-Object System.IO.MemoryStream
$bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$bytes = $ms.ToArray()
$ms.Close()
$bitmap.Dispose()

# Create random access stream
$stream = [Windows.Storage.Streams.InMemoryRandomAccessStream]::New()
$stream.Write($bytes, 0, $bytes.Length)
$stream.Seek(0)

# Decode using Windows APIs
$task = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$task.Wait()
$decoder = $task.Result

# Get pixel data
$pixelDataTask = $decoder.GetPixelDataAsync(
    [Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8,
    [Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied,
    [Windows.Graphics.Imaging.BitmapTransform]::New(),
    [Windows.Graphics.Imaging.ExifOrientationMode]::IgnoreExifOrientation,
    $true
)
$pixelDataTask.Wait()
$pixelData = $pixelDataTask.Result

# Create software bitmap
$width = $decoder.PixelWidth
$height = $decoder.PixelHeight
$softwareBitmap = [Windows.Graphics.Imaging.SoftwareBitmap]::New(
    [Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8,
    [int]$width,
    [int]$height,
    [Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied
)
$softwareBitmap.CopyFromBuffer($pixelData.DetachPixelData())

# Create OCR engine
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

# Perform OCR
$ocrTask = $engine.RecognizeAsync($softwareBitmap)
$ocrTask.Wait()
$result = $ocrTask.Result

# Output text
$result.Text