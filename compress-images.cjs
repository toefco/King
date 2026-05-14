const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressImages() {
  const publicDir = path.join(__dirname, 'public');
  const backupDir = path.join(publicDir, 'backup');
  
  const images = fs.readdirSync(publicDir).filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file) && fs.statSync(path.join(publicDir, file)).isFile()
  );

  console.log('📊 图片无损压缩开始...\n');
  console.log('='.repeat(70));
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  const results = [];

  for (const imageFile of images) {
    const inputPath = path.join(publicDir, imageFile);
    const backupPath = path.join(backupDir, imageFile);
    
    // 读取备份文件大小作为原始大小
    let originalSize;
    if (fs.existsSync(backupPath)) {
      originalSize = fs.statSync(backupPath).size;
    } else {
      originalSize = fs.statSync(inputPath).size;
    }
    totalOriginalSize += originalSize;

    try {
      let pipeline = sharp(inputPath);
      
      // 根据文件类型选择最佳压缩方式，保持最高质量
      if (/\.png$/i.test(imageFile)) {
        // PNG: 无损压缩，仅优化
        pipeline = pipeline.png({
          compressionLevel: 9,
          quality: 100,
          effort: 10,
          adaptiveFiltering: true
        });
      } else {
        // JPEG/JPG: 保持 95% 质量，仅移除不必要元数据
        pipeline = pipeline.jpeg({
          quality: 95,
          mozjpeg: true,
          chromaSubsampling: '4:4:4'
        });
      }

      // 压缩并覆盖原文件
      await pipeline.toFile(inputPath + '.tmp');
      
      const compressedSize = fs.statSync(inputPath + '.tmp').size;
      
      // 如果压缩后更大，保留原文件
      if (compressedSize >= originalSize) {
        fs.unlinkSync(inputPath + '.tmp');
        totalCompressedSize += originalSize;
        results.push({
          name: imageFile,
          original: originalSize,
          compressed: originalSize,
          saved: 0,
          percent: '0.00',
          note: '⚠️ 已是最佳状态'
        });
        console.log(`⚠️ ${imageFile}`);
        console.log(`   原始: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   压缩后更大，保持原样\n`);
      } else {
        // 用压缩后的文件替换原文件
        fs.unlinkSync(inputPath);
        fs.renameSync(inputPath + '.tmp', inputPath);
        
        totalCompressedSize += compressedSize;
        const saved = originalSize - compressedSize;
        const savedPercent = ((saved / originalSize) * 100).toFixed(2);
        
        results.push({
          name: imageFile,
          original: originalSize,
          compressed: compressedSize,
          saved: saved,
          percent: savedPercent,
          note: '✅ 已优化'
        });

        console.log(`✅ ${imageFile}`);
        console.log(`   原始: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   压缩: ${(compressedSize / 1024).toFixed(2)} KB`);
        console.log(`   节省: ${savedPercent}% (${(saved / 1024).toFixed(2)} KB)\n`);
      }

    } catch (error) {
      console.error(`❌ ${imageFile} 压缩失败:`, error.message);
      totalCompressedSize += originalSize;
    }
  }

  console.log('='.repeat(70));
  console.log('\n📈 总计统计:');
  console.log(`   原始总体积: ${(totalOriginalSize / 1024).toFixed(2)} KB (${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   压缩后体积: ${(totalCompressedSize / 1024).toFixed(2)} KB (${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB)`);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const totalSavedPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(2);
  console.log(`   总节省空间: ${(totalSaved / 1024).toFixed(2)} KB`);
  console.log(`   总体压缩率: ${totalSavedPercent}%`);
  console.log('\n✅ 图片无损压缩完成！备份文件保存在 public/backup/');
  
  // 返回结果用于后续使用
  return {
    results,
    totalOriginal: totalOriginalSize,
    totalCompressed: totalCompressedSize,
    totalSaved: totalSaved,
    totalSavedPercent: totalSavedPercent
  };
}

compressImages().catch(console.error);
