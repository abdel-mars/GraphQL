export class ContributionGraph {
  constructor(data, options = {}) {
    this.data = data || [];
    this.squareSize = options.squareSize || 12;
    this.squareGap = options.squareGap || 3;
    this.padding = options.padding || 25;
    this.color = options.color || "#3e3eff";
  }

  render() {
    const svgNS = "http://www.w3.org/2000/svg";

    // Build SVG container
    const svg = document.createElementNS(svgNS, "svg");
    svg.style.display = "block";
    svg.style.margin = "0 auto";
    svg.style.fontFamily = "sans-serif";
    svg.style.userSelect = "none";

    // ---------------------------------------------
    // 1) Create tooltip
    // ---------------------------------------------
    const tooltip = document.createElement("div");
    tooltip.style.position = "fixed";
    tooltip.style.padding = "6px 8px";
    tooltip.style.fontSize = "12px";
    tooltip.style.background = "rgba(0, 0, 0, 0.75)";
    tooltip.style.color = "white";
    tooltip.style.borderRadius = "4px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 0.15s ease";
    document.body.appendChild(tooltip);

    // ---------------------------------------------
    // Prepare date map: { "2025-01-04": amount }
    // ---------------------------------------------
    const dateMap = {};
    this.data.forEach((d) => {
      const day = new Date(d.createdAt);
      const key = day.toISOString().slice(0, 10);
      dateMap[key] = (dateMap[key] || 0) + d.amount;
    });

    // ---------------------------------------------
    // Date range = last 1 year (GitHub style)
    // ---------------------------------------------
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);

    const maxAmount = Math.max(...Object.values(dateMap), 1);

    // Total number of days and weeks
    const totalDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(totalDays / 7);

    // SVG dimensions
    const width =
      weeks * (this.squareSize + this.squareGap) + this.padding * 2;
    const height =
      7 * (this.squareSize + this.squareGap) + this.padding * 3;

    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // ---------------------------------------------
    // 2) Add month labels
    // ---------------------------------------------
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let currentMonth = -1;
    let tempDate = new Date(start);

    for (let w = 0; w < weeks; w++) {
      const month = tempDate.getMonth();
      if (month !== currentMonth) {
        const label = document.createElementNS(svgNS, "text");
        label.textContent = monthNames[month];
        label.setAttribute("x", this.padding + w * (this.squareSize + this.squareGap));
        label.setAttribute("y", this.padding - 8);
        label.setAttribute("font-size", "10px");
        label.setAttribute("fill", "var(--text-color)");
        svg.appendChild(label);
        currentMonth = month;
      }
      tempDate.setDate(tempDate.getDate() + 7);
    }

    // ---------------------------------------------
    // 3) Draw squares (days)
    // ---------------------------------------------
    let day = new Date(start);

    for (let w = 0; w < weeks; w++) {
      for (let dow = 0; dow < 7; dow++) {
        if (day > today) break;

        const key = day.toISOString().slice(0, 10);
        const amount = dateMap[key] || 0;

        const intensity = amount / maxAmount;

        const rect = document.createElementNS(svgNS, "rect");

        // Position
        const x = this.padding + w * (this.squareSize + this.squareGap);
        const y = this.padding + dow * (this.squareSize + this.squareGap);

        rect.setAttribute("x", x);
        rect.setAttribute("y", y);

        rect.setAttribute("width", this.squareSize);
        rect.setAttribute("height", this.squareSize);
        rect.setAttribute("rx", 2);

        // -------------------------------------------
        // Dark Mode + Auto Color Shades
        // -------------------------------------------
        const lightEmpty = "#ebedf0";
        const darkEmpty = "#161b22";

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const emptyColor = prefersDark ? darkEmpty : lightEmpty;

        rect.setAttribute(
          "fill",
          amount === 0
            ? emptyColor
            : this._shadeColor(this.color, -0.6 + intensity * 0.6)
        );

        // -------------------------------------------
        // Smooth fade animation
        // -------------------------------------------
        rect.style.opacity = "0";
        rect.style.animation = `fadeIn 0.6s ease forwards`;
        rect.style.animationDelay = `${(w * 7 + dow) * 0.004}s`;

        // Tooltip events
        rect.addEventListener("mouseenter", (e) => {
          tooltip.style.opacity = "1";
          tooltip.textContent = `${amount} activity on ${key}`;
        });
        rect.addEventListener("mousemove", (e) => {
          tooltip.style.left = e.pageX + 12 + "px";
          tooltip.style.top = e.pageY + 12 + "px";
        });
        rect.addEventListener("mouseleave", () => {
          tooltip.style.opacity = "0";
        });

        svg.appendChild(rect);

        day.setDate(day.getDate() + 1);
      }
    }

    // Add animation keyframes (only once)
    if (!document.getElementById("contribution-anim")) {
      const style = document.createElement("style");
      style.id = "contribution-anim";
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        :root {
          --text-color: #333;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --text-color: #ddd;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return svg;
  }

  // Generate darker/lighter color shades
  _shadeColor(color, percent) {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);

    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;

    const newR = Math.round((t - R) * p + R);
    const newG = Math.round((t - G) * p + G);
    const newB = Math.round((t - B) * p + B);

    return "#" + (0x1000000 + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
  }
}
