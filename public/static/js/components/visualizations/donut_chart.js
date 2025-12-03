export class DonutChart {
  constructor(data, options = {}) {
    this.data = data;
    this.width = options.width || 400;
    this.height = options.height || 300;
    this.colors = options.colors || ['#3e3eff', '#4caf50', '#f44336', '#ff9800', '#9c27b0', '#607d8b'];
    this.showLabels = options.showLabels !== undefined ? options.showLabels : true;
    this.showPercentages = options.showPercentages !== undefined ? options.showPercentages : true;
    this.showLegend = options.showLegend !== undefined ? options.showLegend : true;
    this.showTotal = options.showTotal !== undefined ? options.showTotal : false;
    this.totalLabel = options.totalLabel || 'Total';
    this.innerRadiusRatio = options.innerRadiusRatio || 0.5; // Ratio of inner to outer radius
  }

  render() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);
    svg.setAttribute('class', 'donut-chart');
    
    if (!this.data || this.data.length === 0 || this.data.every(item => !item.value)) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.width / 2);
      text.setAttribute('y', this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = 'No data available';
      svg.appendChild(text);
      return svg;
    }
    
    const total = this.data.reduce((sum, item) => sum + (item.value || 0), 0);
    if (total === 0) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.width / 2);
      text.setAttribute('y', this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = 'No data available';
      svg.appendChild(text);
      return svg;
    }
    
    // Calculate center and radius
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 50; // Leave space for labels
    const innerRadius = outerRadius * this.innerRadiusRatio;
    
    let startAngle = 0;
    
    // Create donut slices
    this.data.forEach((item, index) => {
      if (!item.value) return;
      
      const percentage = item.value / total;
      const endAngle = startAngle + percentage * 2 * Math.PI;
      
      // Calculate points for the slice path
      const outerStartX = centerX + outerRadius * Math.cos(startAngle);
      const outerStartY = centerY + outerRadius * Math.sin(startAngle);
      const outerEndX = centerX + outerRadius * Math.cos(endAngle);
      const outerEndY = centerY + outerRadius * Math.sin(endAngle);
      
      const innerStartX = centerX + innerRadius * Math.cos(endAngle);
      const innerStartY = centerY + innerRadius * Math.sin(endAngle);
      const innerEndX = centerX + innerRadius * Math.cos(startAngle);
      const innerEndY = centerY + innerRadius * Math.sin(startAngle);
      
      // Create the slice path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const largeArcFlag = percentage > 0.5 ? 1 : 0;
      
      path.setAttribute('d', `
        M ${outerStartX},${outerStartY}
        A ${outerRadius},${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX},${outerEndY}
        L ${innerStartX},${innerStartY}
        A ${innerRadius},${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX},${innerEndY}
        Z
      `);
      path.setAttribute('fill', this.colors[index % this.colors.length]);
      path.setAttribute('class', 'donut-slice');
      
      svg.appendChild(path);
      
      // Add label if needed
      if (this.showLabels || this.showPercentages) {
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
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
    
    // Add total in the center if needed
    if (this.showTotal && total > 0) {
      const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      totalText.setAttribute('x', centerX);
      totalText.setAttribute('y', centerY - 10);
      totalText.setAttribute('text-anchor', 'middle');
      totalText.setAttribute('font-size', '16px');
      totalText.setAttribute('font-weight', 'bold');
      totalText.textContent = total;
      
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', centerX);
      labelText.setAttribute('y', centerY + 10);
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('font-size', '12px');
      labelText.textContent = this.totalLabel;
      
      svg.appendChild(totalText);
      svg.appendChild(labelText);
    }
    
    // Add legend if needed
    if (this.showLegend) {
      const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      legendGroup.setAttribute('class', 'legend');
      
      this.data.forEach((item, index) => {
        if (!item.value) return;
        
        const legendY = this.height - 20 - index * 20;
        
        // Legend color box
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 10);
        rect.setAttribute('y', legendY - 10);
        rect.setAttribute('width', 10);
        rect.setAttribute('height', 10);
        rect.setAttribute('fill', this.colors[index % this.colors.length]);
        legendGroup.appendChild(rect);
        
        // Legend text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 25);
        text.setAttribute('y', legendY);
        text.setAttribute('font-size', '12px');
        
        const percentage = item.value / total;
        text.textContent = `${item.label}: ${item.value} (${Math.round(percentage * 100)}%)`;
        
        legendGroup.appendChild(text);
      });
      
      svg.appendChild(legendGroup);
    }
    
    return svg;
  }
}
