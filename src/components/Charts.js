import React from "react";
import { HorizontalBar, Doughnut } from "react-chartjs-2";
import styled from "styled-components";
import BrazilData from "../db/BrazilData";

const ChartSection = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 0.3rem 0.7rem 0;
  display: flex;
  position: relative;
`;

const ChartPieSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 1rem;

  @media (max-width: 960px) {
    padding: 0 1rem 0.4rem;
  }
`;

const sortedData = BrazilData.sort((a, b) => b.confirmed - a.confirmed);

const labels = sortedData.map(province => province.name);
const confirmedCases = sortedData.map(province => province.confirmed);

const confirmedByProvince = {
  labels: labels,
  datasets: [
    {
      label: "Confirmados",
      backgroundColor: "hsla(163, 72%, 48%, .4)",
      borderColor: "hsla(163, 72%, 48%, 1.0)",
      borderWidth: 1,
      hoverBackgroundColor: "hsla(163, 72%, 48%, .9)",
      hoverBorderColor: "hsla(163, 72%, 48%, 1)",
      data: confirmedCases
    }
  ]
};

export function ConfirmedByProvinceChart() {
  return (
    <>
      <ChartSection>
        <HorizontalBar
          data={confirmedByProvince}
          width={100}
          height={50}
          options={{
            maintainAspectRatio: false,
            legend: {
              display: true,
              position: "top",
              fullWidth: true,
              reverse: false,
              labels: {
                fontColor: "hsla(163, 72%, 48%, 1)"
              }
            }
          }}
        />
      </ChartSection>
    </>
  );
}

const data = {
  labels: [
    "Recuperados",
    "Estables/Domicilio",
    "Estables/Hospital",
    "Pronóstico Reservado/Hospital",
    "Fallecidos"
  ],
  datasets: [
    {
      data: [3, 502, 5, 15, 7],
      borderColor: "hsla(164, 23%, 3%, 0.6)",
      backgroundColor: [
        "hsla(163, 72%, 100%, 0.9)",
        "hsla(163, 72%, 48%, 0.7)",
        "hsla(50, 100%, 64%, 0.7)",
        "hsla(25, 100%, 67%, 0.7)",
        "hsla(0, 100%, 67%, 0.7)"
      ],
      hoverBackgroundColor: [
        "hsla(163, 72%, 100%, 1.0)",
        "hsla(163, 72%, 48%, 1.0)",
        "hsla(50, 100%, 64%, 1.0)",
        "hsla(25, 100%, 67%, 1.0)",
        "hsla(0, 100%, 67%, 1.0)"
      ]
    }
  ]
};

export function DetailsChart() {
  return (
    <ChartPieSection>
      <Doughnut
        data={data}
        width={100}
        height={50}
        options={{
          maintainAspectRatio: false,
          legend: {
            display: true,
            position: "top",
            fullWidth: true,
            reverse: false,
            labels: {
              fontColor: "hsla(163, 72%, 48%, 1)"
            }
          }
        }}
      />
    </ChartPieSection>
  );
}
