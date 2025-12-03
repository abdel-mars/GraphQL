export class SpiderChart {
  constructor(data, options = {}) {
    this.data = data;
    this.width = options.width || 400;
    this.height = options.height || 400;
    this.padding = options.padding || 60;
    this.colors = options.colors || ['#3e3eff', '#4caf50', '#f44336', '#ff9800'];
    this.maxValue = options.maxValue || null;
  }

  render() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);
    svg.setAttribute('class', 'spider-chart');

    if (!this.data || this.data.length === 0) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.width / 2);
      text.setAttribute('y', this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = 'No data available';
      svg.appendChild(text);
      return svg;
    }

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - this.padding;

    const maxDataValue = Math.max(...this.data.map((d) => d.count || 0));
    const maxValue = this.maxValue || maxDataValue;

    const numAxes = this.data.length;
    const angleStep = (2 * Math.PI) / numAxes;

    // Draw grid circles
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('class', 'grid-circles');

    const gridLevels = 5;
    for (let i = 1; i <= gridLevels; i++) {
      const r = (radius / gridLevels) * i;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', centerX);
      circle.setAttribute('cy', centerY);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', 'rgba(128, 128, 128, 0.3)');
      circle.setAttribute('stroke-width', '1');
      gridGroup.appendChild(circle);

      // Add grid labels
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', centerX);
      label.setAttribute('y', centerY - r - 5);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '10px');
      label.textContent = Math.round((maxValue / gridLevels) * i);
      gridGroup.appendChild(label);
    }

    svg.appendChild(gridGroup);

    // Draw axes
    const axesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    axesGroup.setAttribute('class', 'axes');

    this.data.forEach((item, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(128, 128, 128, 0.3)');
      line.setAttribute('stroke-width', '1');
      axesGroup.appendChild(line);

      // Add axis labels
      const labelX = centerX + (radius + 20) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('text-anchor', angle > 0 ? 'start' : 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('font-size', '12px');
      label.textContent = item.status || '';
      axesGroup.appendChild(label);
    });

    svg.appendChild(axesGroup);

    // Plot data points and connect them
    const points = this.data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = item.count || 0;
      const r = (value / maxValue) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return { x, y };
    });

    // Draw filled area
    const pathData = points.map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ') + ' Z';

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', pathData);
    area.setAttribute('fill', this.colors[0]);
    area.setAttribute('fill-opacity', '0.3');
    area.setAttribute('stroke', this.colors[0]);
    area.setAttribute('stroke-width', '2');
    svg.appendChild(area);

    // Draw points
    points.forEach((point) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', this.colors[0]);
      svg.appendChild(circle);
    });

    return svg;
  }
}
