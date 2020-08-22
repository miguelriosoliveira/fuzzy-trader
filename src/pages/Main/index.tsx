import React, { useState, useEffect, ChangeEvent } from 'react';

import {
	CircularProgress,
	InputAdornment,
	OutlinedInput,
	InputLabel,
	FormControl,
	TextField,
	Button,
} from '@material-ui/core';
import Axios from 'axios';
import classnames from 'classnames';

import { blockchainAPI, alphavantageAPI, marketstackAPI } from '../../services/apis';
import { numberFormatter } from '../../utils/format';

import './styles.scss';

interface CryptoAPIProps {
	[key: string]: {
		last: number;
	};
}

interface CryptoProps {
	symbol: string;
	value: number;
}

interface StockProps {
	symbol: string;
	close: number;
}

// interface TickerAPIProps {
// 	data: Array<{ symbol: string }>;
// }

// interface EodAPIProps {
// 	data: Array<StockProps>;
// }

interface QuantityProps {
	[key: string]: number;
}

const Main: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [money, setMoney] = useState<number>(724568.78);
	const [investValue, setInvestValue] = useState<number>(0);
	// const [bitcoinValue, setBitcoinValue] = useState(0);
	const [cryptos, setCryptos] = useState<CryptoProps[]>([]);
	const [stocks, setStocks] = useState<StockProps[]>([]);
	// const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
	const [cryptoQuantity, setCryptoQuantity] = useState<QuantityProps>({});
	const [stockQuantity, setStockQuantity] = useState<QuantityProps>({});
	const [subtotal, setSubtotal] = useState(0);

	useEffect(() => {
		setLoading(true);

		// get bitcoin values
		// blockchainAPI.get('ticker').then(response => setExchangeRates(response.data));
		Axios.get<CryptoAPIProps>('https://demo6455206.mockable.io/crypto').then(response => {
			const cryptosSorted = Object.entries(response.data)
				.map(([symbol, crypto]) => ({
					...crypto,
					symbol: symbol.slice(0, symbol.length - 3),
					value: crypto.last,
				}))
				.sort((a, b) => a.value - b.value);

			setCryptos(cryptosSorted);
		});

		// get stocks
		// marketstackAPI
		// 	.get<TickerAPIProps>('tickers', { params: { limit: 10 } })
		// 	.then(response => {
		// 		const symbols = response.data.data.map(ticker => ticker.symbol).join(',');
		// 		marketstackAPI
		// 			.get<EodAPIProps>('eod/latest', { params: { symbols } })
		// 			.then(response2 => {
		// 				const val = response2.data.data.map(eod => ({ ...eod, value: eod.close }));
		// 				console.log(JSON.stringify(val, null, 4));
		// 				setTickers(response2.data.data.map(eod => ({ ...eod, value: eod.close })));
		// 			});
		// 	});
		Axios.get<StockProps[]>('https://demo6455206.mockable.io/stocks')
			.then(response => {
				const tickersUpdated = response.data
					.map(eod => ({ ...eod, value: eod.close }))
					.sort((a, b) => a.value - b.value);

				setStocks(tickersUpdated);
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		const cryptoSubtotal = Object.entries(cryptoQuantity).reduce((acc, [symbol, qtd]) => {
			const crypto = cryptos.find(item => item.symbol === symbol) || { value: 0 };
			const sum = qtd * crypto.value;
			return acc + sum;
		}, 0);

		const stocksSubtotal = Object.entries(stockQuantity).reduce((acc, [symbol, qtd]) => {
			const stock = stocks.find(ticker => ticker.symbol === symbol) || { close: 0 };
			const sum = qtd * stock.close;
			return acc + sum;
		}, 0);

		setSubtotal(cryptoSubtotal + stocksSubtotal);
	}, [cryptoQuantity, cryptos, stockQuantity, stocks]);

	function handleChange({ target: { value } }: ChangeEvent<HTMLInputElement>): void {
		setInvestValue(Number(value));

		// // debounce to get value in bitcoin
		// if (typingTimeout) {
		// 	clearTimeout(typingTimeout);
		// }
		// if (!value) {
		// 	setBitcoinValue(0);
		// 	return;
		// }
		// setTypingTimeout(
		// 	setTimeout(() => {
		// 		blockchainAPI
		// 			.get('tobtc', { params: { currency: 'USD', value } })
		// 			.then(response => setBitcoinValue(response.data));
		// 	}, 500),
		// );
	}

	if (loading) {
		return <CircularProgress className="loading-center" />;
	}

	return (
		<div className="main-component">
			<header>
				<h1>Sua carteira</h1>
				<h2>{`$ ${numberFormatter.format(money)}`}</h2>
			</header>

			<FormControl fullWidth variant="outlined">
				<InputLabel htmlFor="investValue">Quanto deseja aplicar hoje?</InputLabel>
				<OutlinedInput
					id="investValue"
					type="number"
					label="Quanto deseja aplicar hoje?"
					placeholder="Invista com sabedoria"
					value={investValue || ''}
					onChange={handleChange}
					inputProps={{ min: 1, max: money }}
					startAdornment={<InputAdornment position="start">$</InputAdornment>}
				/>
			</FormControl>

			{/* {!!investValue && !!bitcoinValue && (
				<section>
					<h3>Valor em bitcoin:</h3>
					<span>{bitcoinValue}</span>
				</section>
			)} */}

			<section className="exchange-rates">
				<div>
					<h3>Criptomoedas</h3>
					<pre>
						{cryptos.map(({ symbol, value }) => {
							const x = investValue - subtotal + value * (cryptoQuantity[symbol] || 0);
							const purchasable = x >= value;

							return (
								<div key={symbol} className="line">
									<span className={classnames({ purchasable })}>
										{`[${symbol.padEnd(4, ' ')}] $ ${numberFormatter.format(value)}`}
									</span>
									{purchasable && (
										<TextField
											size="small"
											type="number"
											variant="standard"
											className="quantity-field"
											label="Quantidade"
											value={cryptoQuantity[symbol] || 0}
											onChange={e => {
												setCryptoQuantity({ ...cryptoQuantity, [symbol]: Number(e.target.value) });
											}}
											inputProps={{ min: 0, max: Math.floor(x / value) }}
										/>
									)}
								</div>
							);
						})}
					</pre>
				</div>

				<div>
					<h3>Ações</h3>
					<pre>
						{stocks.map(({ symbol, close }) => {
							const x = investValue - subtotal + close * (stockQuantity[symbol] || 0);
							const purchasable = x >= close;

							return (
								<div key={symbol} className="line">
									<span className={classnames({ purchasable })}>
										{`[${symbol.padEnd(5, ' ')}] $ ${numberFormatter.format(close)}`}
									</span>
									{purchasable && (
										<TextField
											size="small"
											type="number"
											variant="standard"
											className="quantity-field"
											label="Quantidade"
											value={stockQuantity[symbol] || 0}
											onChange={e => {
												setStockQuantity({ ...stockQuantity, [symbol]: Number(e.target.value) });
											}}
											inputProps={{ min: 0, max: Math.floor(x / close) }}
										/>
									)}
								</div>
							);
						})}
					</pre>
				</div>
			</section>

			<footer>
				<h3>Subtotal</h3>
				<code>
					{`$ ${numberFormatter.format(subtotal)}`}

					{subtotal > 0 && (
						<Button variant="contained" color="primary" size="small">
							Comprar
						</Button>
					)}
				</code>
			</footer>
		</div>
	);
};

export default Main;
