import { useEffect, useState } from "react";
import {
  getStockData,
  getStockNews,
  getStockHistoricalData,
} from "../services/api";

export interface StockDataPoint {
  date: Date;
  y: number;
}

export function useStockData(symbol: string | undefined) {
  const [timeSeries, setTimeSeries] = useState<StockDataPoint[]>([]);
  const [historicalSeries, setHistoricalSeries] = useState<StockDataPoint[]>(
    []
  );
  const [news, setNews] = useState<any[]>([]);
  const [latestData, setLatestData] = useState<any>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      try {
        const stockData = await getStockData(symbol);
        const newsData = await getStockNews(symbol);
        const historicalDataResponse = await getStockHistoricalData(symbol);

        if (stockData?.data?.["Time Series (Daily)"]) {
          const formattedTimeSeries = Object.entries(
            stockData.data["Time Series (Daily)"]
          ).map(([date, values]: any) => ({
            date: new Date(date),
            y: parseFloat(values["4. close"]),
          }));

          setTimeSeries(formattedTimeSeries);
          setLatestData(
            stockData.data["Time Series (Daily)"][
              Object.keys(stockData.data["Time Series (Daily)"])[0]
            ]
          );
        }

        if (historicalDataResponse?.["Time Series (Daily)"]) {
          const formattedHistoricalSeries = Object.entries(
            historicalDataResponse["Time Series (Daily)"]
          ).map(([date, values]: any) => ({
            date: new Date(date),
            y: parseFloat(values["4. close"]),
          }));

          setHistoricalSeries(formattedHistoricalSeries);
        }

        setNews(newsData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchData();
  }, [symbol]);

  return { timeSeries, historicalSeries, latestData, news };
}
