import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '../styles/Home.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const formatNumber = (num: number): string => {
  if (isNaN(num)) return ''; // Return an empty string for NaN
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const roundUp = (num: number): number => {
  return Math.ceil(num);
};

const unformatNumber = (num: string): string => {
  return num.replace(/,/g, '');
};

interface CalculationResult {
  itemPrice: number;
  buyFee: number;
  totalBuyingPrice: number;
  minimumSellPrice: number;
  sellFee: number;
  netSellPrice: number;
}

interface ProfitResult {
  buyFee: number;
  sellFee: number;
  pureProfitBeforeFee: number;
  pureProfitAfterFee: number;
}

const calculateMinimumSellPrice = (totalBuyingPrice: number, buyFeePercentage: number, sellFeePercentage: number): CalculationResult => {
  const BUY_FEE_PERCENTAGE = buyFeePercentage / 100;
  const SELL_FEE_PERCENTAGE = sellFeePercentage / 100;

  const buyFee = totalBuyingPrice * BUY_FEE_PERCENTAGE;
  const totalBuyingPriceWithFee = totalBuyingPrice + buyFee;
  const minimumSellPrice = totalBuyingPriceWithFee / (1 - SELL_FEE_PERCENTAGE);
  const sellFee = minimumSellPrice * SELL_FEE_PERCENTAGE;
  const netSellPrice = minimumSellPrice - sellFee;

  return {
    itemPrice: totalBuyingPrice,
    buyFee: buyFee,
    totalBuyingPrice: totalBuyingPriceWithFee,
    minimumSellPrice: minimumSellPrice,
    sellFee: sellFee,
    netSellPrice: netSellPrice
  };
};

const calculateProfit = (totalBuyingPrice: number, totalSellPrice: number, lotValue: number, sellLotValue: number, buyFeePercentage: number, sellFeePercentage: number): ProfitResult => {
  const BUY_FEE_PERCENTAGE = buyFeePercentage / 100;
  const SELL_FEE_PERCENTAGE = sellFeePercentage / 100;

  const proportionateBuyPrice = (totalBuyingPrice / lotValue) * sellLotValue;
  const buyFee = proportionateBuyPrice * BUY_FEE_PERCENTAGE;
  const totalProportionateBuyingPrice = proportionateBuyPrice + buyFee;

  const sellFee = totalSellPrice * SELL_FEE_PERCENTAGE;
  const netSellPrice = totalSellPrice - sellFee;

  const pureProfitBeforeFee = totalSellPrice - proportionateBuyPrice;
  const pureProfitAfterFee = netSellPrice - totalProportionateBuyingPrice;

  return {
    buyFee: buyFee,
    sellFee: sellFee,
    pureProfitBeforeFee: pureProfitBeforeFee,
    pureProfitAfterFee: pureProfitAfterFee
  };
};

const Calculator = () => {
  const [lot, setLot] = useState<string>('');
  const [pricePerShare, setPricePerShare] = useState<string>('');
  const [sellLot, setSellLot] = useState<string>('');
  const [sellPricePerShare, setSellPricePerShare] = useState<string>('');
  const [priceStep, setPriceStep] = useState<string>('1');
  const [buyFeePercentage, setBuyFeePercentage] = useState<string>('0.1513');
  const [sellFeePercentage, setSellFeePercentage] = useState<string>('0.2513');
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [profit, setProfit] = useState<ProfitResult | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const savedLot = localStorage.getItem('lot');
    const savedPricePerShare = localStorage.getItem('pricePerShare');
    const savedSellLot = localStorage.getItem('sellLot');
    const savedSellPricePerShare = localStorage.getItem('sellPricePerShare');
    const savedPriceStep = localStorage.getItem('priceStep');
    const savedBuyFeePercentage = localStorage.getItem('buyFeePercentage');
    const savedSellFeePercentage = localStorage.getItem('sellFeePercentage');

    if (savedLot) setLot(savedLot);
    if (savedPricePerShare) setPricePerShare(savedPricePerShare);
    if (savedSellLot) setSellLot(savedSellLot);
    if (savedSellPricePerShare) setSellPricePerShare(savedSellPricePerShare);
    if (savedPriceStep) setPriceStep(savedPriceStep);
    if (savedBuyFeePercentage) setBuyFeePercentage(savedBuyFeePercentage);
    if (savedSellFeePercentage) setSellFeePercentage(savedSellFeePercentage);
  }, []);

  useEffect(() => {
    localStorage.setItem('lot', lot);
    localStorage.setItem('pricePerShare', pricePerShare);
    localStorage.setItem('sellLot', sellLot);
    localStorage.setItem('sellPricePerShare', sellPricePerShare);
    localStorage.setItem('priceStep', priceStep);
    localStorage.setItem('buyFeePercentage', buyFeePercentage);
    localStorage.setItem('sellFeePercentage', sellFeePercentage);
  }, [lot, pricePerShare, sellLot, sellPricePerShare, priceStep, buyFeePercentage, sellFeePercentage]);

  const handleLotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setLot(value);
  };

  const handlePricePerShareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setPricePerShare(value);
  };

  const handleSellLotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setSellLot(value);
  };

  const handleSellPricePerShareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setSellPricePerShare(value);
  };

  const handlePriceStepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPriceStep(event.target.value);
  };

  const handleBuyFeePercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBuyFeePercentage(event.target.value);
  };

  const handleSellFeePercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSellFeePercentage(event.target.value);
  };

  const incrementPrice = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const price = parseFloat(unformatNumber(value));
    const step = parseFloat(unformatNumber(priceStep));
    setter(formatNumber(price + step));
  };

  const decrementPrice = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const price = parseFloat(unformatNumber(value));
    const step = parseFloat(unformatNumber(priceStep));
    if (price - step >= 0) {
      setter(formatNumber(price - step));
    }
  };

  const handleIncrementLot = (incrementValue: number) => {
    let currentLot = lot ? parseInt(unformatNumber(lot)) : 0;
    currentLot = currentLot + incrementValue < 0 ? 0 : currentLot + incrementValue;
    setLot(formatNumber(currentLot));
  };

  const handleIncrementSellLot = (incrementValue: number) => {
    const currentSellLot = sellLot ? parseInt(unformatNumber(sellLot)) : 0;
    setSellLot(formatNumber(currentSellLot + incrementValue));
  };

  const handleSetSellLotEqual = () => {
    setSellLot(lot);
  };

  const handleCalculate = () => {
    const lotValue = lot ? parseInt(unformatNumber(lot)) : NaN;
    const pricePerShareValue = pricePerShare ? parseFloat(unformatNumber(pricePerShare)) : NaN;
    const sellLotValue = sellLot ? parseInt(unformatNumber(sellLot)) : NaN;
    const sellPricePerShareValue = sellPricePerShare ? parseFloat(unformatNumber(sellPricePerShare)) : NaN;
    const priceStepValue = priceStep ? parseFloat(unformatNumber(priceStep)) : 1;
    const buyFeeValue = parseFloat(buyFeePercentage) || 0.1513;
    const sellFeeValue = parseFloat(sellFeePercentage) || 0.2513;

    const totalBuyingPrice = lotValue * pricePerShareValue * 100;
    const totalSellPrice = sellLotValue * sellPricePerShareValue * 100;

    if (!isNaN(totalBuyingPrice)) {
      const calcResult = calculateMinimumSellPrice(totalBuyingPrice, buyFeeValue, sellFeeValue);
      setCalculation(calcResult);

      if (!isNaN(totalSellPrice)) {
        const profitResult = calculateProfit(totalBuyingPrice, totalSellPrice, lotValue, sellLotValue, buyFeeValue, sellFeeValue);
        setProfit(profitResult);
      } else {
        setProfit(null);
      }

      // Generate chart data
      const profitData = [];
      const labels = [];
      for (let price = sellPricePerShareValue; price <= sellPricePerShareValue + 10 * priceStepValue; price += priceStepValue) {
        const sellPrice = price * sellLotValue * 100;
        const result = calculateProfit(totalBuyingPrice, sellPrice, lotValue, sellLotValue, buyFeeValue, sellFeeValue);
        profitData.push(result.pureProfitAfterFee);
        labels.push(price);
      }

      setChartData({
        labels,
        datasets: [
          {
            label: 'Profit After Fees',
            data: profitData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
          },
        ],
      });
    } else {
      setCalculation(null);
      setProfit(null);
      setChartData(null);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [lot, pricePerShare, sellLot, sellPricePerShare, priceStep, buyFeePercentage, sellFeePercentage]);

  const handleCopy = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const textToCopy = unformatNumber(event.currentTarget.value);
    event.clipboardData.setData('text/plain', textToCopy);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.configContainer}>
            <label className={styles.configLabel} htmlFor="buy_fee">Buy Fee %:</label>
            <input
              className={styles.configInput}
              type="text"
              id="buy_fee"
              name="buy_fee"
              value={buyFeePercentage}
              onChange={handleBuyFeePercentageChange}
            />
            <label className={styles.configLabel} htmlFor="sell_fee">Sell Fee %:</label>
            <input
              className={styles.configInput}
              type="text"
              id="sell_fee"
              name="sell_fee"
              value={sellFeePercentage}
              onChange={handleSellFeePercentageChange}
            />
            <label className={styles.configLabel} htmlFor="price_step">Price Step:</label>
            <input
              className={styles.configInput}
              type="text"
              id="price_step"
              name="price_step"
              value={priceStep}
              onChange={handlePriceStepChange}
            />
          </div>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.inputContainer}>
              <label className={styles.label} htmlFor="lot">Lots Bought:</label>
              <input
                className={styles.input}
                type="text"
                id="lot"
                name="lot"
                inputMode="numeric"
                pattern="[0-9]*"
                value={lot}
                onChange={handleLotChange}
                onCopy={handleCopy}
                required
              />
              <div className={styles.buttonGroup}>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementLot(-1)}>-1
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementLot(-5)}>-5
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementLot(-10)}>-10
                </button>

                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementLot(1)}>+1
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementLot(5)}>+5
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementLot(10)}>+10
                </button>
              </div>
              <br/>
              <label className={styles.label} htmlFor="price_per_share">Price
                Per Share:</label>
              <div className={styles.priceInputContainer}>
                <button type="button" className={styles.priceButton}
                        onClick={() => decrementPrice(setPricePerShare, pricePerShare)}>-
                </button>
                <input
                  className={styles.priceInput}
                  type="text"
                  id="price_per_share"
                  name="price_per_share"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pricePerShare}
                  onChange={handlePricePerShareChange}
                  onCopy={handleCopy}
                  required
                />
                <button type="button" className={styles.priceButton} onClick={() => incrementPrice(setPricePerShare, pricePerShare)}>+</button>
              </div>
              <br />
              <label className={styles.label} htmlFor="sell_lot">Lots to Sell (optional):</label>
              <input
                className={styles.input}
                type="text"
                id="sell_lot"
                name="sell_lot"
                inputMode="numeric"
                pattern="[0-9]*"
                value={sellLot}
                onChange={handleSellLotChange}
                onCopy={handleCopy}
              />
              <div className={styles.buttonGroup}>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementSellLot(-1)}>-1
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementSellLot(-5)}>-5
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementSellLot(-10)}>-10
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementSellLot(1)}>+1
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementSellLot(5)}>+5
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={() => handleIncrementSellLot(10)}>+10
                </button>
                <button type="button" className={styles.priceButton}
                        onClick={handleSetSellLotEqual}>=
                </button>
              </div>
              <br/>
              <label className={styles.label} htmlFor="sell_price_per_share">Sell
                Price Per Share (optional):</label>
              <div className={styles.priceInputContainer}>
                <button type="button" className={styles.priceButton}
                        onClick={() => decrementPrice(setSellPricePerShare, sellPricePerShare)}>-
                </button>
                <input
                  className={styles.priceInput}
                  type="text"
                  id="sell_price_per_share"
                  name="sell_price_per_share"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={sellPricePerShare}
                  onChange={handleSellPricePerShareChange}
                  onCopy={handleCopy}
                />
                <button type="button" className={styles.priceButton} onClick={() => incrementPrice(setSellPricePerShare, sellPricePerShare)}>+</button>
              </div>
            </div>
          </form>
        </div>
        <div className={styles.resultContainer}>
          {calculation && (
            <>
              <h2 className={styles.resultTitle}>Calculation Results</h2>
              <p className={styles.resultText}>Total buying price: Rp {formatNumber(roundUp(calculation.itemPrice))}</p>
              <p className={styles.resultText}>Buy fee: Rp {formatNumber(roundUp(calculation.buyFee))}</p>
              <p className={styles.resultText}>Total buying price with fee: Rp {formatNumber(roundUp(calculation.totalBuyingPrice))}</p>
              <p className={styles.resultText}>Minimum sell price to cover buy and sell fees: Rp {formatNumber(roundUp(calculation.minimumSellPrice))}</p>
              <p className={styles.resultText}>Sell fee based on the minimum sell price: Rp {formatNumber(roundUp(calculation.sellFee))}</p>
              <p className={styles.resultText}>Net sell price after deducting the sell fee: Rp {formatNumber(roundUp(calculation.netSellPrice))}</p>
            </>
          )}
          {profit && (
            <>
              <h2 className={styles.resultTitle}>Profit Calculation</h2>
              <p className={styles.resultText}>Sell fee: Rp {formatNumber(roundUp(profit.sellFee))}</p>
              <p className={styles.resultText}>Total fee: Rp {formatNumber(roundUp(profit.buyFee) + roundUp(profit.sellFee))}</p>
              <p className={styles.resultText}>Pure profit before fees: Rp {formatNumber(roundUp(profit.pureProfitBeforeFee))}</p>
              <p className={styles.resultText}>Pure profit after fees: Rp {formatNumber(roundUp(profit.pureProfitAfterFee))}</p>
            </>
          )}
        </div>
      </div>
      {chartData && (
        <div className={styles.chartContainer}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Profit After Fees vs. Sell Price',
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: 'white',
                  },
                },
                y: {
                  ticks: {
                    color: 'white',
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Calculator;
