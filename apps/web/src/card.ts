// 메시지를 이미지 카드(PNG)로 그린다. DOM 캡처 라이브러리 없이 Canvas 2D만 쓴다.

/** 줄바꿈을 지키면서 `maxWidth`를 넘지 않게 글자 단위로 줄을 나눈다. 한글은 띄어쓰기 없이도 꺾여야 해서 글자 단위다. */
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const char of paragraph) {
      if (line && measure(line + char) > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line += char;
      }
    }
    lines.push(line);
  }
  return lines;
}

const INK = '#14101A';
const PAPER = '#FFF3E3';
const EMBER = '#FF5B1F';
const FONT = '"Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif';

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

/** 1080px 너비의 카드 PNG를 만든다. 높이는 본문 길이에 맞춘다. */
export async function renderCard(text: string, logoUrl: string): Promise<Blob> {
  const logo = await loadImage(logoUrl);
  const width = 1080;
  const margin = 64;
  const fontSize = 46;
  const lineHeight = 70;
  const headerHeight = 180;
  const footerHeight = 110;

  const measureCanvas = document.createElement('canvas');
  const measureContext = measureCanvas.getContext('2d')!;
  measureContext.font = `800 ${fontSize}px ${FONT}`;
  const bubbleInset = 48;
  const lines = wrapText(text, width - margin * 2 - bubbleInset * 2, (s) => measureContext.measureText(s).width);

  const bubbleHeight = lines.length * lineHeight + bubbleInset * 2;
  const height = headerHeight + bubbleHeight + footerHeight + margin;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, width - 10, height - 10);

  ctx.drawImage(logo, margin, 44, 96, 96);
  ctx.fillStyle = INK;
  ctx.textBaseline = 'middle';
  ctx.font = `900 54px ${FONT}`;
  ctx.fillText('SpamHell', margin + 120, 92);

  const bubbleX = margin;
  const bubbleY = headerHeight;
  const bubbleWidth = width - margin * 2;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(bubbleX + 10, bubbleY + 10, bubbleWidth, bubbleHeight, 44);
  ctx.fill();
  ctx.fillStyle = EMBER;
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 44);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 ${fontSize}px ${FONT}`;
  lines.forEach((line, index) => {
    ctx.fillText(line, bubbleX + bubbleInset, bubbleY + bubbleInset + lineHeight * index + lineHeight / 2);
  });

  ctx.fillStyle = INK;
  ctx.font = `700 32px ${FONT}`;
  ctx.fillText('보이스피싱 근절을 응원합니다', margin, height - footerHeight / 2 - margin / 2 + 16);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}
