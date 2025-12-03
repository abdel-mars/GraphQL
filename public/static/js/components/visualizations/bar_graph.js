export class BarGraph {
  constructor(data, options = {}) {
    this.data = data;
    this.width = options.width || 600;
    this.height = options.height || 300;
    this.padding = options.padding || 40;
    this.colors = options.colors || [
      '#3e3eff',
      '#4caf50',
      '#f44336',
      '#ff9800',
    ];
    this.maxValue = options.maxValue || null;
    this.gridLines = options.gridLines || null;
    this.barSpacing = options.barSpacing || 10;
  }

  render() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);
    svg.setAttribute('class', 'bar-graph');

    if (!this.data || this.data.length === 0) {
      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', this.width / 2);
      text.setAttribute('y', this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = 'No data available';
      svg.appendChild(text);
      return svg;
    }

    // Find max value for scaling
    const maxDataValue = Math.max(...this.data.map((d) => d.count || 0));
    const maxValue = this.maxValue || maxDataValue;

    // Calculate bar width based on available space
    const barWidth =
      (this.width -
        2 * this.padding -
        (this.data.length - 1) * this.barSpacing) /
      this.data.length;

    // Add grid lines
    const gridGroup = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    gridGroup.setAttribute('class', 'grid-lines');

    const gridValues = this.gridLines || [
      0,
      maxValue / 4,
      maxValue / 2,
      (3 * maxValue) / 4,
      maxValue,
    ];

    gridValues.forEach((value) => {
      const y =
        this.height -
        this.padding -
        (value / maxValue) * (this.height - 2 * this.padding);

      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      line.setAttribute('x1', this.padding);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.width - this.padding);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', this.padding - 5);
      text.setAttribute('y', y + 5);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '12px');
      text.textContent = value;
      gridGroup.appendChild(text);
    });

    svg.appendChild(gridGroup);

    // Add bars
    this.data.forEach((item, index) => {
      const x = this.padding + index * (barWidth + this.barSpacing);
      const barHeight =
        (item.count / maxValue) * (this.height - 2 * this.padding);
      const y = this.height - this.padding - barHeight;

      const rect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('fill', this.colors[index % this.colors.length]);

      svg.appendChild(rect);

      // Add label below bar
      const labelText = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      labelText.setAttribute('x', x + barWidth / 2);
      labelText.setAttribute('y', this.height - this.padding + 20);
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('font-size', '12px');
      labelText.textContent = item.status || '';
      svg.appendChild(labelText);

      // Add value above bar
      const valueText = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      valueText.setAttribute('x', x + barWidth / 2);
      valueText.setAttribute('y', y - 5);
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('font-size', '12px');
      valueText.textContent = item.count || 0;
      svg.appendChild(valueText);
    });
    return svg;
  }
}
