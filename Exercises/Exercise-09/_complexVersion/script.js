const calendarEl = document.getElementById('calendar');
const svg = document.getElementById('calendarPath');
const totalDays = 31;

function buildCalendar() {
  calendarEl.innerHTML = '';

  const containerWidth = calendarEl.getBoundingClientRect().width;
  const estimatedBoxSize = 60;
  const boxGap = 10;
  const rowGap = 50;
  const cols = Math.floor((containerWidth + boxGap) / (estimatedBoxSize + boxGap));
  calendarEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  const rows = Math.ceil(totalDays / cols);
  let day = 1;

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const box = document.createElement('div');
      box.classList.add('day');

      if (day <= totalDays) {
        box.textContent = day++;
      } else {
        box.style.visibility = 'hidden';
      }

      row.push(box);
    }

    if (r % 2 === 1) row.reverse();
    row.forEach(el => calendarEl.appendChild(el));
  }
}

function drawPath() {
    svg.innerHTML = '';
  
    const allDays = Array.from(document.querySelectorAll('.day'));
    const estimatedBoxSize = 60;
    const boxGap = 10;
    const rowGap = 50;
    const cornerRadius = 20;
    const angleThreshold = 5; // degrees
  
    const cols = Math.floor(
      (calendarEl.getBoundingClientRect().width + boxGap) / (estimatedBoxSize + boxGap)
    );
  
    const rows = [];
    for (let i = 0; i < allDays.length; i += cols) {
      const row = allDays
        .slice(i, i + cols)
        .filter(box => box.textContent.trim() !== '');
      if ((i / cols) % 2 === 1) row.reverse();
      rows.push(row);
    }
  
    const parentRect = document.querySelector('.calendar-inner').getBoundingClientRect();
    const boxWidth = allDays[0].getBoundingClientRect().width;
    const boxHeight = allDays[0].getBoundingClientRect().height;
    const tailOffset = boxWidth * 0.75;
    const dropOffset = boxHeight + rowGap;
  
    const points = [];
  
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const isLast = r === rows.length - 1;
      const isReversed = r % 2 === 1;
  
      for (let i = 0; i < row.length; i++) {
        const rect = row[i].getBoundingClientRect();
        const x = rect.left + rect.width / 2 - parentRect.left;
        const y = rect.top + rect.height + rowGap / 2 - parentRect.top;
        points.push({ x, y });
      }
  
      if (!isLast) {
        const endEl = row[row.length - 1].getBoundingClientRect();
        const endX = endEl.left + endEl.width / 2 - parentRect.left;
        const endY = endEl.top + endEl.height + rowGap / 2 - parentRect.top;
  
        const tailX = isReversed ? endX - tailOffset : endX + tailOffset;
        const dropY = endY + dropOffset;
  
        points.push({ x: tailX, y: endY });
        points.push({ x: tailX, y: dropY });
  
        const nextRow = rows[r + 1];
        const nextBox = isReversed ? nextRow[nextRow.length - 1] : nextRow[0];
        const nextRect = nextBox.getBoundingClientRect();
        const nextX = nextRect.left + nextRect.width / 2 - parentRect.left;
  
        points.push({ x: nextX, y: dropY });
      }
    }
  
    // Build path with smart fillets
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = '';
  
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
  
      if (i === 0) {
        d += `M ${p.x},${p.y}`;
      } else if (
        i < points.length - 1 &&
        points[i - 1] &&
        points[i] &&
        points[i + 1]
      ) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
  
        const v1x = curr.x - prev.x;
        const v1y = curr.y - prev.y;
        const v2x = next.x - curr.x;
        const v2y = next.y - curr.y;
  
        const len1 = Math.hypot(v1x, v1y);
        const len2 = Math.hypot(v2x, v2y);
  
        if (len1 < 0.1 || len2 < 0.1) {
          d += ` L ${curr.x},${curr.y}`;
          continue;
        }
  
        const unit1 = { x: v1x / len1, y: v1y / len1 };
        const unit2 = { x: v2x / len2, y: v2y / len2 };
  
        const dot = unit1.x * unit2.x + unit1.y * unit2.y;
        const angle = Math.acos(dot) * (180 / Math.PI);
  
        if (Math.abs(angle - 180) < angleThreshold) {
          d += ` L ${curr.x},${curr.y}`;
        } else {
          const r = Math.min(cornerRadius, len1 / 2, len2 / 2);
          const startX = curr.x - unit1.x * r;
          const startY = curr.y - unit1.y * r;
          const endX = curr.x + unit2.x * r;
          const endY = curr.y + unit2.y * r;
  
          d += ` L ${startX},${startY} Q ${curr.x},${curr.y} ${endX},${endY}`;
        }
      } else {
        d += ` L ${p.x},${p.y}`;
      }
    }
  
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'gray');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }

  function resizeSVG() {
    const inner = document.querySelector('.calendar-inner');
    const rect = inner.getBoundingClientRect();
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height + 100);
  }

function sync() {
  buildCalendar();
  resizeSVG();
  drawPath();
}

window.addEventListener('resize', sync);
window.addEventListener('DOMContentLoaded', sync);
