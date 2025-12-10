export class LineGraph {
  constructor(data, options = {}) {
    this.data = data;
    this.width = options.width || 600;
    this.height = options.height || 300;
    this.padding = options.padding || 40;
    this.showDates = options.showDates !== undefined ? options.showDates : true;
    this.dateFormat = options.dateFormat || "short";
  }

  render() {
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", this.width);
    svg.setAttribute("height", this.height);
    svg.setAttribute("class", "line-graph");
    svg.style.margin = "0 auto";
    svg.style.display = "block";

    if (!this.data || this.data.length === 0) {
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", this.width / 2);
      text.setAttribute("y", this.height / 2);
      text.setAttribute("text-anchor", "middle");
      text.textContent = "No data available";
      svg.appendChild(text);
      return svg;
    }

    // ------------------------------------------------------------------
    // 🔥 Limit number of visible points
    // ------------------------------------------------------------------
    const maxVisible = 20;
    let graphData = this.data;

    if (this.data.length > maxVisible) {
      const step = Math.ceil(this.data.length / maxVisible);
      graphData = this.data.filter((_, i) => i % step === 0);
    }
    // ------------------------------------------------------------------

    // Add grid lines
    const gridGroup = document.createElementNS(svgNS, "g");
    gridGroup.setAttribute("class", "grid-lines");

    for (let i = 0; i <= 5; i++) {
      const y =
        this.padding + (i / 5) * (this.height - 2 * this.padding);
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", this.padding);
      line.setAttribute("y1", y);
      line.setAttribute("x2", this.width - this.padding);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "rgba(0, 0, 0, 0.1)");
      line.setAttribute("stroke-width", "1");
      gridGroup.appendChild(line);
    }

    svg.appendChild(gridGroup);

    // Create line path
    const polyline = document.createElementNS(svgNS, "polyline");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#3e3eff");
    polyline.setAttribute("stroke-width", "2");

    const maxAmount = Math.max(
      ...graphData.map((d) => d.amount || 0)
    );

    const points = graphData
      .map((item, index) => {
        const x =
          this.padding +
          (index / (graphData.length - 1 || 1)) *
            (this.width - 2 * this.padding);
        const y =
          this.height -
          this.padding -
          ((item.amount || 0) / (maxAmount || 1)) *
            (this.height - 2 * this.padding);
        return `${x},${y}`;
      })
      .join(" ");

    polyline.setAttribute("points", points);
    svg.appendChild(polyline);

    // Draw points (circles)
    graphData.forEach((item, index) => {
      const x =
        this.padding +
        (index / (graphData.length - 1 || 1)) *
          (this.width - 2 * this.padding);
      const y =
        this.height -
        this.padding -
        ((item.amount || 0) / (maxAmount || 1)) *
          (this.height - 2 * this.padding);

      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "#3e3eff");

      svg.appendChild(circle);
    });

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const y =
        this.padding + (i / 5) * (this.height - 2 * this.padding);
      const value = Math.round(
        maxAmount - (i / 5) * maxAmount
      );

      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", this.padding - 10);
      text.setAttribute("y", y + 5);
      text.setAttribute("text-anchor", "end");
      text.setAttribute("font-size", "10px");
      text.textContent = value.toLocaleString();

      svg.appendChild(text);
    }

    // X-axis labels (dates)
    if (this.showDates && graphData[0]?.createdAt) {
      const numLabels = Math.min(5, graphData.length);
      const step = Math.max(
        1,
        Math.floor(graphData.length / numLabels)
      );

      for (let i = 0; i < graphData.length; i += step) {
        const x =
          this.padding +
          (i / (graphData.length - 1 || 1)) *
            (this.width - 2 * this.padding);
        const y = this.height - this.padding + 20;

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "10px");

        const date = new Date(graphData[i].createdAt);
        let formattedDate;

        if (this.dateFormat === "short") {
          formattedDate = date.toLocaleDateString();
        } else if (this.dateFormat === "medium") {
          formattedDate = date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } else if (this.dateFormat === "long") {
          formattedDate = date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }

        text.textContent = formattedDate;
        svg.appendChild(text);
      }
    }

    return svg;
  }
}
