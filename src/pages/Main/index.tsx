import React, { useState, useEffect, ChangeEvent } from 'react';

import {
	CircularProgress,
	InputAdornment,
	OutlinedInput,
	InputLabel,
	FormControl,
} from '@material-ui/core';
import classnames from 'classnames';

import { blockchainAPI, alphavantageAPI } from '../../services/apis';
import { numberFormatter } from '../../utils/format';

import './styles.scss';

interface ExchangeRateProps {
	[key: string]: {
		symbol: string;
		last: number;
	};
}

interface TickerProps {
	symbol: string;
	close: number;
}

interface TickerAPIProps {
	data: Array<{ symbol: string }>;
}

interface EodAPIProps {
	data: Array<TickerProps>;
}

const stocks = [
	'FB', // 269.0
	'GOOG', // 1,581.75
	'GOOGL', // 1,576.25
	'MSFT', // 214.58
	'AAPL', // 473.10
	'AMZN', // 3,297.37
	'NFLX', // 497.90
	'ZM', // 290.69
	'MELI34.SAO', // 685.00
	'BRDT3.SAO', // 21.77
];

const Main: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [money, setMoney] = useState<number>(724568.78);
	const [investValue, setInvestValue] = useState<number>(0);
	const [exchangeRates, setExchangeRates] = useState<ExchangeRateProps>({});
	const [bitcoinValue, setBitcoinValue] = useState();
	const [tickers, setTickers] = useState<TickerProps[]>([]);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();

	useEffect(() => {
		setLoading(true);

		blockchainAPI.get('ticker').then(response => setExchangeRates(response.data));

		const promises = stocks.map(stock => {
			return alphavantageAPI
				.get('', { params: { function: 'TIME_SERIES_DAILY', symbol: stock } })
				.then(response => response.data);
		});

		Promise.all(promises).then(results => console.log(results));
	}, []);

	function handleChange({ target: { value } }: ChangeEvent<HTMLInputElement>): void {
		setInvestValue(Number(value));

		// debounce
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}
		setTypingTimeout(
			setTimeout(() => {
				blockchainAPI
					.get('tobtc', { params: { currency: 'USD', value } })
					.then(response => setBitcoinValue(response.data));
			}, 500),
		);
	}

	if (loading) {
		return <CircularProgress />;
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

			{!!investValue && !!bitcoinValue && (
				<section>
					<h3>Valor em bitcoin:</h3>
					<span>{bitcoinValue}</span>
				</section>
			)}

			<section className="exchange-rates">
				<div>
					<h3>Câmbio mais recente de Bitcoin (BTC)</h3>
					<code>
						{Object.entries(exchangeRates).map(([currency, { symbol, last }]) => {
							return (
								<pre
									key={currency}
									className={classnames({
										purchasable: currency === 'USD' && investValue >= last,
									})}
								>
									{`[${currency}] ${symbol.padStart(3, ' ')} ${numberFormatter.format(last)}`}
								</pre>
							);
						})}
					</code>
				</div>

				<div>
					<h3>Câmbio mais recente de Ações</h3>
					<code>
						{tickers.map(({ symbol, close }) => {
							return (
								<pre key={symbol} className={classnames({ purchasable: investValue >= close })}>
									{`[USD] ${symbol.padEnd(5, ' ')} $ ${numberFormatter.format(close)}`}
								</pre>
							);
						})}
					</code>
				</div>
			</section>
		</div>
	);
};

export default Main;
