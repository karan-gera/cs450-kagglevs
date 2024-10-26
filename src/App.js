import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./App.css";
import data from "./TOP_100_IMDB_MOVIES.csv";

function App() {
  const chartRef = useRef(null);

  useEffect(() => {
    d3.csv(data).then((data) => {
      const genreCounts = {};
      data.forEach((movie) => {
        const genres = JSON.parse(movie.genre.replace(/'/g, '"'));
        genres.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });

      const genreData = Object.entries(genreCounts).map(([genre, count]) => ({
        genre,
        count,
      }));

      const width = 500,
        height = 500,
        margin = 40;

      const radius = Math.min(width, height) / 2 - margin;

      d3.select(chartRef.current).select("svg").remove();

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const color = d3
        .scaleOrdinal()
        .domain(genreData.map((d) => d.genre))
        .range(d3.schemeSet3);

      const pie = d3.pie().value((d) => d.count);
      const arc = d3
        .arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);

      const arcHover = d3
        .arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 1.1);

      const paths = svg
        .selectAll("path")
        .data(pie(genreData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data.genre))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8);

      paths
        .on("mouseover", function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arcHover);
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arc);
        });

      // Add labels with conditional display based on arc angle size
      svg
        .selectAll("text")
        .data(pie(genreData))
        .enter()
        .append("text")
        .text((d) => (d.endAngle - d.startAngle > 0.3 ? d.data.genre : "")) // Only show label if angle is larger than threshold
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#333");

      svg
        .append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + margin)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Top 100 IMDb Movies - Genre Distribution");
    });
  }, []);

  return (
    <div className="App">
      <h1>IMDb Genre Distribution Visualization</h1>
      <div ref={chartRef}></div>
    </div>
  );
}

export default App;
