const XLSX = require('xlsx');

// 1. Hàm tách khối lượng
function extractWeight(text) {
  const match = text?.match(/Khối lượng\s*=\s*([\d\.,]+)/);
  if (!match) return null;

  // chuyển "137.282,29" -> "137282.29"
  return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
}

// 2. Đọc file Excel gốc
const workbook = XLSX.readFile('GTT02_TraCuu_202587_16h24.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

// 3. Tạo mảng mới với các cột yêu cầu + tính toán
const finalData = data.map((row) => {
  const weight = extractWeight(row['Tên hàng']);
  const unitPrice = weight && row['Đơn giá khai báo(USD)'] ? row['Đơn giá khai báo(USD)'] / weight : null;

  return {
    'Tên doanh nghiệp XNK': row['Tên doanh nghiệp XNK'],
    'Đơn vị đối tác': row['Đơn vị đối tác'],
    'Mã hàng khai báo': row['Mã hàng khai báo'],
    'Đơn giá khai báo(USD)': row['Đơn giá khai báo(USD)'],
    'Điều kiện giao hàng': row['Điều kiện giao hàng'],
    'Khối lượng tách (KGM)': weight,
    'Đơn giá/KGM (USD)': unitPrice,
  };
});

// 4. Xuất ra Excel mới
const newSheet = XLSX.utils.json_to_sheet(finalData);
const newWB = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWB, newSheet, 'Final');

XLSX.writeFile(newWB, 'Final_Result.xlsx');

console.log('✅ Đã tạo file Final_Result.xlsx với đầy đủ 7 cột.');
