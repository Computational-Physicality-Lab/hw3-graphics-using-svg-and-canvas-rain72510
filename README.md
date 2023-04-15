# hw3-Graphics-using-SVG-and-Canvas

## 姓名
張子泓

## 你所實作的網站如何被測試
這次一樣放到 netlify 上面測試

## 你所實作的加分作業項目，以及如何觸發它
- 線條繪製與移動
  - mode 選取 線條圖案 就可以用了，按住並拖曳可以拉出線段
- 框選功能
  - 無
- 使用選取手柄 (selection handle) 標示被選取項目
  - 無
- 其他繪圖模式
  - 折線繪製
    - mode 選取 poly 字樣可以繪製
    - 鼠標點擊來選取折線的節點，按下 q 停止繪製，按下 r 可以回到上一步（取消上次所畫的點並重畫）
    - 按下 Esc 會取消繪製
- 其他操作
  - shift
    - 按住 shift 鍵時，如在
      - 繪製線段、折線會黏到角度最接近的水平、垂直、45 度線。
      - 繪製長方形可形成正方形
      - 繪製橢圓可形成園形
    - 鬆開就回復原狀。
## 認為此作業最難實作或 debug 的部分與原因
實作的順序是先完成左半 panel 的外觀，完成 svg 圖層同時完成左半 panel 的邏輯，最後才做 canvas 圖層。

- 在開始寫 svg 圖層時讓 svg 物件能夠選取時花了很多時間想（知道怎麼做的都不在比較範圍內），最後花了一段時間才決定
用一個 key-value pair 存下 svg 物件的所有資訊，而後在一些 移動物件、調整物件的時候也派上作用。

- 完成左半 panel 的邏輯時覺得 MVC 的純度有提昇了，比如為了得到 Border color, Border width, Fill color 
能夠隨著選取的物件變動的功能，我將左半部五個可調部份的值用全域變數(model)存起來（雖然可能有點糟，但畢竟到處都需要他們），
當左半的 panel 被調整時，用一個函數(controller)修改值並且呼叫另一個變數依照 model 的值做對應的渲染。以前我大概是不會
做這種事的，但這次的作業讓我稍微抓到一點感覺。

- 雖然大概只是正常的技巧，但以前經常依賴 function overload 的我在這次 canvas, SVG 圖層的操作基本上都用同個函數，
並且函數內部再依照全域變數做各自的動作。這種方式以及所有物件都用 key-value pair 存起來的行為也讓我覺得有較好的 scalability。

## 其他你所實作的網站的有趣之處
- 雖然不算刻意為之，但其實 polyline 也算是一種徒手繪製（？），只是要一直點選折線的節點。
- 雖然不是我實作的，但 floodFill 不曉得為什麼總是無法成功。
