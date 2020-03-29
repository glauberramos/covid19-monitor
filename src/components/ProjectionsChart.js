import React from "react";
import styled from "styled-components";
import * as d3 from "d3";
import { formatDateApi, formatDateDisplay } from '../utils/dateUtils';

import projections from '../db/projections.json';

const ChartSection = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  padding: 0 30px;
  box-sizing: border-box;

  .chart-container {
    position: relative;
  }

  p {
    font-size: 0.7em;
    margin: 1em 0;
  }

  .legend {
    display: flex;
    margin-bottom: 0;
    padding-left: 0;

    p {
      margin-right: 2em;
      font-size: 0.7em;

      span {
        display: inline-block;
        vertical-align: middle;
        width: 2em;
        height: 1em;
        margin-right: 0.5em;
        background-color: currentColor;
      }
    }
  }
`;

const ToolTip = styled.div`
  position: absolute;
  transform: translate(-50%, -150%);
  padding: 10px;
  background: rgba(000,000,000,0.9);
  color: #fff;
  font-size: 0.7em;
  pointer-events: none;
  text-align: center;
  width: 100px;
  opacity: 0;

  &:after {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 9px);
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 7.5px 0 7.5px;
    border-color: rgba(000,000,000,0.9) transparent transparent transparent;
  }
`;

class NewCasesChart extends React.Component {
  constructor(props) {
    super(props);
    this.chartContainer = React.createRef();
    this.tooltip = React.createRef();
    this.width = 0;
    this.height = 0;
    this.svg = null;
    this.state = {
      loading: true,
      tooltipPos: {
        opacity: 0,
        left: 0,
        top: 0,
      },
    };
  }

  componentDidMount() {
    if (this.props.dailyData) {
      this._init();
    } else {
      this.setState({loading: true});
    }
  }

  componentDidUpdate() {
    if (this.state.loading && this.props.dailyData) {
      this._init();
    }
  }

  _mouseleave = d => {
    this.setState({tooltipPos: {
      opacity: 0,
    }})
  };

  _init = () => {
    this.width = this.chartContainer.current && this.chartContainer.current.offsetWidth;
    this.height = this.width > 480 ? this.width * 0.7 : this.width;
    console.log(this.height);
    const margin = {top: 20, right: 30, bottom: 100, left: 50};

    // const dataOk = projections
    //   .filter((d) => this.props.dailyData[formatDateApi(new Date(d.date))])
    //   .map(d => ({
    //     date: d.date,
    //     cases: this.props.dailyData[formatDateApi(new Date(d.date))],
    //     projections: parseFloat(d['95%']),
    //   }));

    // console.log(dataOk);

    const dataCases = Object.entries(this.props.dailyData).map(d => ({ date: d[0], value: d[1] }));
    const dates = dataCases.map(d => d.date);

    const dataProjections = projections
    .filter((o) => dates.includes(formatDateApi(new Date(o.date))))
    .map(o => ({date: formatDateApi(new Date(o.date)), value: parseFloat(o['95%'])}));

    this.svg = d3
      .select(this.chartContainer.current && this.chartContainer.current)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    const x = d3.scaleUtc()
      .domain(d3.extent(dates, d => new Date(d)))
      .range([margin.left, this.width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataProjections, d => d.value)]).nice()
      .range([this.height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr("transform", `translate(0,${this.height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
        .tickFormat(d3.utcFormat("%d/%m"))
        // .ticks(this.width / 80)
      );

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(dataProjections.y))

    this.svg.append("g")
      .call(xAxis);

    this.svg.append("g")
      .call(yAxis);

    const line = d3.line()
      .defined(d => d.value)
      .x(d => x(new Date(d.date)))
      .y(d => y(d.value));

    const colors = ['red', 'yellow'];

    [dataCases, dataProjections].forEach((data, index) => {
      this.svg.append('path')
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colors[index])
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line)
      
      this.svg.append("g")
          .attr("stroke", "none")
          .attr("fill", colors[index])
        .selectAll("circle")
        .data(data)
        .join("circle")
          .attr("transform", d => `translate(${x(new Date(d.date))},${y(d.value)})`)
          .attr("r", this.width * 0.005);

      const rectWidth = this.width > 480 ? this.width / data.length : 10;

      this.svg.append('g')
        .selectAll('rect')
        .data(data)
        .join("rect")
        .attr('x', d => x(new Date(d.date)) - rectWidth / 2)
        .attr('y', 0)
        .attr('width', rectWidth)
        .attr('height', d => y(d.value))
        .attr('stroke', 'none')
        .attr('fill', 'transparent')
        .on("mouseover", d => {
          const posX = x(new Date(d.date));
          const posY = y(d.value);
          this.setState({tooltipPos: {
            opacity: 1,
            left: `${posX}px`,
            top: `${posY}px`,
          }});

          const date = formatDateDisplay(new Date(d.date));
          this.tooltip.current.innerHTML = `${date}
          <br />${parseInt(d.value)}`;
        })
        .on("mouseleave", this._mouseleave)
    });

    this.setState({loading: false});
  };

  render() {
    return (
      <>
        <ChartSection>
          <h3>Projeção de casos reais</h3>
          <p>Como nem todos os infectados são testados, estimamos o número real de infectados a partir do numero de mortos, usando o algoritmo de simulaçao descrito nesse <a href="https://cmmid.github.io/topics/covid19/current-patterns-transmission/cases-from-deaths.html" target="_blanl">paper</a>.</p>
          <p>O modelo assume taxa de infecção estável, não leva em conta medidas de intervenção como quarentena em massa que reduziriam essa taxa.</p>
          <div className="legend">
            <p><span style={{color: 'red'}}></span> Projeção de casos reais</p>
            <p><span style={{color: 'yellow'}}></span> Casos confirmados</p>
          </div>
          <div className="chart-container" ref={this.chartContainer}>
            <ToolTip ref={this.tooltip} style={this.state.tooltipPos} />
          </div>
        </ChartSection>
      </>
    );
  }
}

export default NewCasesChart;
