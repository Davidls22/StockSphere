export async function fetchStockData(symbol) {
  const url = `http://localhost:8080/api/stocks/stock/${symbol}`;
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url);
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Fetched data:', data); 
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
}
