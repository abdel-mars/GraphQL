export class PieChart {
  constructor(data, options = {}) {
    this.data = data;
    this.width = options.width || 600;
    this.height = options.height || 300;
    this.colors = options.colors || [
      '#3e3eff',
      '#4caf50',
      '#f44336',
      '#ff9800',
      '#9c27b0',
      '#607d8b',
    ];
    this.showLabels =
      options.showLabels !== undefined ? options.showLabels : true;
    this.showPercentages =
      options.showPercentages !== undefined ? options.showPercentages : true;
    this.showLegend =
      options.showLegend !== undefined ? options.showLegend : true;
  }

  render() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);
    svg.setAttribute('class', 'pie-chart');

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

    const total = this.data.reduce((sum, item) => sum + (item.value || 0), 0);

    // Calculate center and radius
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    let startAngle = 0;

    // Create pie slices
    this.data.forEach((item, index) => {
      if (!item.value) return;

      const percentage = item.value / total;
      const endAngle = startAngle + percentage * 2 * Math.PI;

      // Calculate points for the slice path
      const startX = centerX + radius * Math.cos(startAngle);
      const startY = centerY + radius * Math.sin(startAngle);
      const endX = centerX + radius * Math.cos(endAngle);
      const endY = centerY + radius * Math.sin(endAngle);

      // Create the slice path
      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      const largeArcFlag = percentage > 0.5 ? 1 : 0;

      path.setAttribute(
        'd',
        `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`
      );
      path.setAttribute('fill', this.colors[index % this.colors.length]);
      path.setAttribute('class', 'pie-slice');

      svg.appendChild(path);

      if (this.showLabels || this.showPercentages) {
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius * 0.7; // Position label inside the slice
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        const text = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-size', '12px');

        if (this.showLabels && this.showPercentages) {
          text.textContent = `${Math.round(percentage * 100)}%`;
        } else if (this.showLabels) {
          text.textContent = item.label;
        } else if (this.showPercentages) {
          text.textContent = `${Math.round(percentage * 100)}%`;
        }

        svg.appendChild(text);
      }

      startAngle = endAngle;
    });

    if (this.showLegend) {
      const legendGroup = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
      );
      legendGroup.setAttribute('class', 'legend');

      this.data.forEach((item, index) => {
        const legendY = this.height - 20 - index * 20;

        // Legend color box
        const rect = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );
        rect.setAttribute('x', 10);
        rect.setAttribute('y', legendY - 10);
        rect.setAttribute('width', 10);
        rect.setAttribute('height', 10);
        rect.setAttribute('fill', this.colors[index % this.colors.length]);
        legendGroup.appendChild(rect);

        // Legend text
        const text = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        text.setAttribute('x', 25);
        text.setAttribute('y', legendY);
        text.setAttribute('font-size', '12px');

        const percentage = item.value / total;
        text.textContent = `${item.label}: ${item.value} (${Math.round(
          percentage * 100
        )}%)`;

        legendGroup.appendChild(text);
      });

      svg.appendChild(legendGroup);
    }
    return svg;
  }
}
