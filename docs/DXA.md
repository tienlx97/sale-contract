Trong thư viện docx (và trong chính Word / OpenXML), nhiều kích thước (font size, margin, table width, indent…) được đo bằng một đơn vị gọi là DXA.

## 📏 DXA là gì?

- DXA = Twips (twentieth of a point).

- 1 point (pt) = 1/72 inch.

- 1 point = 20 twips.

- Vì vậy:
  - 1 inch = 72 pt = 1440 twips (DXA).
  - 1 cm ≈ 567 DXA.

## 🔑 Một số ví dụ

- Muốn thụt lề 1 cm: `indent.left: 567`.
- Muốn thụt lề 1 inch: `indent.left: 1440`.
- Trang A4 ngang 21 cm ≈ 11907 DXA (nếu không tính lề).
- Font size trong docx cũng quy định theo **half-points**, ví dụ size = 24 → 12 pt (không phải DXA, nhưng cũng là đơn vị nội bộ).

## ✅ Kết luận

Khi bạn thấy trong docx:

```js
width: { size: 3500, type: WidthType.DXA }
```

nghĩa là cột có chiều rộng 3500 twips ≈ 3500 ÷ 1440 ≈ 2.43 inch ≈ 6.2 cm.
